/**
 * FullRemote-Jobs Cloudflare Worker
 * Subdomain: fullremote-jobs.edounze.com
 * Repository: flouzzy/fullremote-jobs
 */

import {
  scrapeAllJobs,
  categorizeJob,
  detectRegion,
  detectContractType,
  parseSalaryDetails,
  detectLanguage,
} from "./scraper.js";
import { FALLBACK_JOBS } from "./fallback-data.js";
import { renderHTML, renderUnsubscribePage } from "./ui.js";
import {
  initDb,
  saveJobsToDb,
  queryJobsFromDb,
  getDbStats,
  saveEmailAlert,
  getEmailAlertByToken,
  unsubscribeEmailAlert,
  getActiveEmailAlerts,
  updateAlertLastSent,
  savePushSubscription,
  getActivePushSubscriptions,
  deletePushSubscription,
  logNotification,
} from "./db.js";
import {
  sendResendEmail,
  buildWelcomeEmailHtml,
  buildJobDigestEmailHtml,
  matchJobToAlert,
} from "./email.js";
import {
  DEFAULT_VAPID_PUBLIC_KEY,
  DEFAULT_VAPID_PRIVATE_KEY,
  sendWebPushNotification,
} from "./push.js";
import { renderJobDetailPage, generateRssFeed, generateSitemap } from "./seo.js";
import {
  generateRobotsTxt,
  generateLlmsTxt,
  generateLlmsFullTxt,
  generateOpenApiSchema,
  generateAiPluginManifest,
  handleMcpRequest,
} from "./geo.js";
import { renderPostJobPage } from "./b2b.js";
import { renderSalaryCalculatorPage } from "./calculator.js";

// Cache mémoire local en runtime Worker
let cachedJobs = null;
let lastIngestionTime = null;

// Service Worker script served dynamically
const SERVICE_WORKER_CODE = `/**
 * FullRemote-Jobs - Service Worker pour Notifications Web Push
 */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Full Remote Jobs 🌍",
    body: "✨ De nouvelles offres 100% télétravail viennent d'être publiées !",
    url: "https://fullremote-jobs.edounze.com",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      const text = event.data.text();
      if (text) data.body = text;
    }
  }

  const options = {
    body: data.body,
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌍</text></svg>",
    badge: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌍</text></svg>",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
    actions: [{ action: "explore", title: "Voir les offres ↗" }],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("fullremote-jobs.edounze.com") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
`;

/**
 * Récupère les données en privilégiant Cloudflare D1, puis le cache mémoire, puis le scraping live
 */
async function getOrFetchJobs(env) {
  // 1. Tenter depuis Cloudflare D1 si la base est liée
  if (env && env.DB) {
    try {
      await initDb(env.DB);
      const dbJobs = await queryJobsFromDb(env.DB, { limit: 300 });
      if (dbJobs && dbJobs.length > 0) {
        cachedJobs = dbJobs;
        lastIngestionTime = dbJobs[0].published_at || new Date().toISOString();
        return { jobs: dbJobs, updated_at: lastIngestionTime, source: "d1" };
      }
    } catch (e) {
      console.warn("D1 query fallback notice:", e.message);
    }
  }

  // 2. Cache mémoire de l'instance Worker
  if (cachedJobs && cachedJobs.length > 0) {
    return { jobs: cachedJobs, updated_at: lastIngestionTime, source: "memory" };
  }

  // 3. Scraping en direct si le cache est vide
  try {
    const liveJobs = await scrapeAllJobs();
    if (liveJobs && liveJobs.length > 0) {
      cachedJobs = liveJobs;
      lastIngestionTime = new Date().toISOString();

      if (env && env.DB) {
        saveJobsToDb(env.DB, liveJobs).catch(console.error);
      }

      return { jobs: cachedJobs, updated_at: lastIngestionTime, source: "live_scrape" };
    }
  } catch (err) {
    console.error("Échec du scraping en direct :", err);
  }

  // 4. Données de secours garanties
  cachedJobs = FALLBACK_JOBS;
  lastIngestionTime = lastIngestionTime || new Date().toISOString();
  return { jobs: cachedJobs, updated_at: lastIngestionTime, source: "fallback" };
}

/**
 * Traite et distribue les alertes emails et notifications web push
 */
async function processNotifications(env, jobs = [], siteUrl = "https://remote-jobs.edounze.com") {
  if (!jobs || jobs.length === 0 || !env || !env.DB) {
    return { emails_sent: 0, pushes_sent: 0 };
  }

  const resendApiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL || "FullRemote Jobs <alerts@hey.edounze.com>";
  let emailsSent = 0;
  let pushesSent = 0;

  // 1. Alertes Emails personnalisées
  try {
    const activeAlerts = await getActiveEmailAlerts(env.DB);
    for (const alert of activeAlerts) {
      const matchingJobs = jobs.filter((job) => matchJobToAlert(job, alert));
      if (matchingJobs.length > 0) {
        const html = buildJobDigestEmailHtml({ jobs: matchingJobs, alert, siteUrl });
        const subject = `🔔 ${matchingJobs.length} nouvelle${
          matchingJobs.length > 1 ? "s" : ""
        } offre${matchingJobs.length > 1 ? "s" : ""} 100% remote pour votre profil`;

        const sendRes = await sendResendEmail({
          apiKey: resendApiKey,
          from: fromEmail,
          to: alert.email,
          subject,
          html,
        });

        await logNotification(env.DB, {
          type: "email",
          recipient: alert.email,
          subject_or_title: subject,
          items_count: matchingJobs.length,
          status: sendRes.success ? "sent" : "failed",
          error_message: sendRes.error,
        });

        if (sendRes.success) {
          emailsSent++;
          await updateAlertLastSent(env.DB, alert.id);
        }
      }
    }
  } catch (e) {
    console.error("[NOTIF] Erreur processing alertes email :", e);
  }

  // 2. Notifications Web Push
  try {
    const pushSubs = await getActivePushSubscriptions(env.DB);
    for (const sub of pushSubs) {
      const payload = {
        title: "Full Remote Jobs 🌍",
        body: `✨ ${jobs.length} nouvelles offres 100% télétravail disponibles aujourd'hui !`,
        url: siteUrl,
      };

      const pushRes = await sendWebPushNotification({
        subscription: { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
        vapidPublicKey: env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY,
        vapidPrivateKey: env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY,
      });

      if (pushRes.expired) {
        await deletePushSubscription(env.DB, sub.endpoint);
      }

      await logNotification(env.DB, {
        type: "push",
        recipient: sub.endpoint,
        subject_or_title: payload.title,
        items_count: jobs.length,
        status: pushRes.success ? "sent" : "failed",
        error_message: pushRes.error,
      });

      if (pushRes.success) pushesSent++;
    }
  } catch (e) {
    console.error("[NOTIF] Erreur processing web push :", e);
  }

  return { emails_sent: emailsSent, pushes_sent: pushesSent };
}

export default {
  /**
   * Point d'entrée HTTP (Requêtes web, SEO, RSS & API)
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const siteUrl = (env && env.SITE_URL) || (url.host.includes("edounze.com") ? `${url.protocol}//${url.host}` : "https://remote-jobs.edounze.com");

    // Headers standards de sécurité et CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Route CNAME
    if (pathname === "/CNAME") {
      return new Response("fullremote-jobs.edounze.com", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 2. Route robots.txt (Optimisé SEO & GEO Crawlers IA)
    if (pathname === "/robots.txt") {
      const robots = generateRobotsTxt({ siteUrl });
      return new Response(robots, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          ...corsHeaders,
        },
      });
    }

    // 3. Route llms.txt (Standard LLM Index - Answer.ai)
    if (pathname === "/llms.txt") {
      const llmsTxt = generateLlmsTxt({ siteUrl });
      return new Response(llmsTxt, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders,
        },
      });
    }

    // 4. Route llms-full.txt & /jobs.md (Catalogue complet Markdown optimisé token)
    if (pathname === "/llms-full.txt" || pathname === "/jobs.md") {
      const { jobs } = await getOrFetchJobs(env);
      const fullMd = generateLlmsFullTxt(jobs, { siteUrl });
      return new Response(fullMd, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=600, s-maxage=1800",
          ...corsHeaders,
        },
      });
    }

    // 5. Route OpenAPI 3.0 (/openapi.json)
    if (pathname === "/openapi.json") {
      const schema = generateOpenApiSchema({ siteUrl });
      return new Response(JSON.stringify(schema, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders,
        },
      });
    }

    // 6. Route AI Plugin Manifest (/.well-known/ai-plugin.json)
    if (pathname === "/.well-known/ai-plugin.json") {
      const manifest = generateAiPluginManifest({ siteUrl });
      return new Response(JSON.stringify(manifest, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders,
        },
      });
    }

    // 7. Route Serveur MCP (/mcp) — Model Context Protocol
    if (pathname === "/mcp") {
      const { jobs } = await getOrFetchJobs(env);
      return handleMcpRequest(request, env, ctx, { jobs, siteUrl });
    }

    // 8. Route Recruteurs : /post-a-job (B2B 49€)
    if (pathname === "/post-a-job") {
      const html = renderPostJobPage({ siteUrl });
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders,
        },
      });
    }

    // 9. Route Simulateur de Salaire & Télétravail International
    if (pathname === "/simulateur-salaire-remote" || pathname === "/salary-calculator") {
      const html = renderSalaryCalculatorPage({ siteUrl });
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders,
        },
      });
    }

    // 9. API Création de Session Stripe Checkout (49 €) : POST /api/checkout/create-session ou /api/jobs/draft
    if ((pathname === "/api/checkout/create-session" || pathname === "/api/jobs/draft") && request.method === "POST") {
      try {
        const body = await request.json();
        const {
          title,
          company,
          company_logo,
          url: applyUrl,
          category,
          region,
          contract,
          salary,
          description,
          email,
        } = body;

        if (!title || !company || !applyUrl || !email || !description) {
          return new Response(
            JSON.stringify({ success: false, error: "Veuillez renseigner tous les champs obligatoires (*)." }),
            { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        const stripeKey = env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
          return new Response(
            JSON.stringify({ success: false, error: "Configuration Stripe manquante sur le serveur." }),
            { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        const canonicalUrl = (env.SITE_URL || (url.host.includes("edounze.com") ? `${url.protocol}//${url.host}` : "https://remote-jobs.edounze.com")).replace(/\/+$/, "");
        const jobId = `b2b-${company.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`.slice(0, 80);

        // Appel direct à l'API REST Stripe pour générer la session de paiement
        const stripeParams = new URLSearchParams();
        stripeParams.append("payment_method_types[]", "card");
        stripeParams.append("mode", "payment");
        stripeParams.append("line_items[0][price_data][currency]", "eur");
        stripeParams.append("line_items[0][price_data][unit_amount]", "4900");
        stripeParams.append("line_items[0][price_data][product_data][name]", "Publication Offre 100% Full Remote (30 jours)");
        stripeParams.append("line_items[0][price_data][product_data][description]", `Mise en avant sur FullRemote.Jobs : ${company} — ${title}`);
        stripeParams.append("line_items[0][quantity]", "1");
        stripeParams.append("customer_email", email.toLowerCase().trim());
        stripeParams.append("success_url", `${canonicalUrl}/post-a-job?success=true&session_id={CHECKOUT_SESSION_ID}&job_id=${encodeURIComponent(jobId)}`);
        stripeParams.append("cancel_url", `${canonicalUrl}/post-a-job?canceled=true`);

        stripeParams.append("metadata[job_id]", jobId);
        stripeParams.append("metadata[title]", title.slice(0, 200));
        stripeParams.append("metadata[company]", company.slice(0, 100));
        stripeParams.append("metadata[email]", email.slice(0, 100));

        const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: stripeParams.toString(),
        });

        const session = await stripeRes.json();
        if (!stripeRes.ok) {
          console.error("[STRIPE] Erreur création session :", session);
          return new Response(
            JSON.stringify({
              success: false,
              error: session.error?.message || "Erreur lors de la communication avec Stripe.",
            }),
            { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        // Sauvegarde de l'offre dans D1 SQL pour activation immédiate
        if (env && env.DB) {
          await initDb(env.DB);
          const categoryObj = categorizeJob(title, category || "", []);
          const regionObj = detectRegion(region || "worldwide", title, []);
          const contractObj = detectContractType(title, contract || "cdi_fulltime", description, []);
          const salaryObj = parseSalaryDetails(salary || "");

          await saveJobsToDb(env.DB, [
            {
              id: jobId,
              title,
              company,
              company_logo: company_logo || "",
              url: applyUrl,
              category: categoryObj.label,
              categoryId: categoryObj.id,
              categoryIcon: categoryObj.icon,
              contractType: contractObj.label,
              contractTypeId: contractObj.id,
              contractIcon: contractObj.icon,
              job_type: contractObj.label,
              location: regionObj.label,
              region: regionObj.label,
              regionId: regionObj.id,
              regionFlag: regionObj.flag,
              salary: salaryObj.raw,
              salary_min_eur: salaryObj.min_eur,
              salary_max_eur: salaryObj.max_eur,
              salary_min_usd: salaryObj.min_usd,
              salary_max_usd: salaryObj.max_usd,
              currency: salaryObj.currency,
              published_at: new Date().toISOString(),
              description_snippet: description.slice(0, 300),
              source: "Direct_B2B",
              language: detectLanguage(title, description),
              is_verified: 1,
            },
          ]);
        }

        return new Response(
          JSON.stringify({
            success: true,
            checkout_url: session.url,
            session_id: session.id,
            job_id: jobId,
          }),
          { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        console.error("[CHECKOUT] Exception create session :", err);
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // 10. Route Service Worker : /sw.js
    if (pathname === "/sw.js") {
      return new Response(SERVICE_WORKER_CODE, {
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Service-Worker-Allowed": "/",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders,
        },
      });
    }

    // 3. Route Clé Publique VAPID : /api/notifications/vapid-public-key
    if (pathname === "/api/notifications/vapid-public-key") {
      return new Response(
        JSON.stringify({
          publicKey: env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY,
        }),
        {
          headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // 4. Inscription Web Push : POST /api/notifications/subscribe
    if (pathname === "/api/notifications/subscribe" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.endpoint || !body.p256dh || !body.auth) {
          return new Response(
            JSON.stringify({ success: false, error: "Données de souscription push incomplètes." }),
            { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        if (env && env.DB) {
          await initDb(env.DB);
          await savePushSubscription(env.DB, body);
        }

        // Notification de bienvenue instantanée
        sendWebPushNotification({
          subscription: body,
          payload: {
            title: "Notifications activées ! 🔔",
            body: "Vous recevrez une alerte chaque matin dès la publication des nouvelles offres 100% remote.",
            url: siteUrl,
          },
          vapidPublicKey: env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY,
          vapidPrivateKey: env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY,
        }).catch(console.error);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Abonnement aux notifications activé avec succès.",
          }),
          {
            headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // 5. Inscription Alerte Email : POST /api/alerts/subscribe
    if (pathname === "/api/alerts/subscribe" && request.method === "POST") {
      try {
        const body = await request.json();
        const email = (body.email || "").trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
          return new Response(
            JSON.stringify({ success: false, error: "Adresse email invalide." }),
            { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        let savedAlert = null;
        if (env && env.DB) {
          await initDb(env.DB);
          savedAlert = await saveEmailAlert(env.DB, body);
        } else {
          savedAlert = {
            id: `alert_mock_${Date.now()}`,
            email,
            region_id: body.region_id || "all",
            category_id: body.category_id || "all",
            contract_type_id: body.contract_type_id || "all",
            keywords: body.keywords || "",
            frequency: body.frequency || "daily",
            unsubscribe_token: `unsub_${Date.now()}`,
          };
        }

        const resendApiKey = env.RESEND_API_KEY;
        const fromEmail = env.RESEND_FROM_EMAIL || "FullRemote Jobs <alerts@hey.edounze.com>";
        const welcomeHtml = buildWelcomeEmailHtml({ alert: savedAlert, siteUrl });

        const emailRes = await sendResendEmail({
          apiKey: resendApiKey,
          from: fromEmail,
          to: email,
          subject: "🎉 Votre alerte quotidienne FullRemote Jobs est activée !",
          html: welcomeHtml,
        });

        if (env && env.DB) {
          await logNotification(env.DB, {
            type: "email",
            recipient: email,
            subject_or_title: "Confirmation d'activation alerte",
            items_count: 0,
            status: emailRes.success ? "sent" : "failed",
            error_message: emailRes.error,
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Alerte activée avec succès ! Un email de confirmation vous a été envoyé.",
            email_sent: emailRes.success,
          }),
          {
            headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // 6. Désinscription Alerte Email : GET /api/alerts/unsubscribe
    if (pathname === "/api/alerts/unsubscribe") {
      const token = url.searchParams.get("token");
      let success = false;
      let email = "";

      if (token && env && env.DB) {
        await initDb(env.DB);
        const alert = await getEmailAlertByToken(env.DB, token);
        if (alert) {
          email = alert.email;
          success = await unsubscribeEmailAlert(env.DB, token);
        }
      }

      const html = renderUnsubscribePage({ success, email, siteUrl });
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      });
    }

    // 7. Route Flux RSS 2.0 : /rss ou /feed
    if (pathname === "/rss" || pathname === "/feed" || pathname === "/feed.xml") {
      const { jobs } = await getOrFetchJobs(env);
      const xml = generateRssFeed(jobs, siteUrl);
      return new Response(xml, {
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          "Cache-Control": "public, max-age=600, s-maxage=1800",
          ...corsHeaders,
        },
      });
    }

    // 8. Route Sitemap XML : /sitemap.xml
    if (pathname === "/sitemap.xml") {
      const { jobs } = await getOrFetchJobs(env);
      const xml = generateSitemap(jobs, siteUrl);
      return new Response(xml, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=1800, s-maxage=3600",
          ...corsHeaders,
        },
      });
    }

    // 9. Route SEO fiche dédiée : /jobs/:id
    if (pathname.startsWith("/jobs/")) {
      const jobId = decodeURIComponent(pathname.replace("/jobs/", "")).trim();
      const { jobs } = await getOrFetchJobs(env);
      const job = jobs.find((j) => j.id === jobId);

      if (job) {
        const html = renderJobDetailPage(job, { siteUrl });
        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=600, s-maxage=3600",
            ...corsHeaders,
          },
        });
      }
      return Response.redirect(new URL("/", request.url).toString(), 302);
    }

    // 10. Route API : /api/jobs
    if (pathname === "/api/jobs") {
      const regionParam = url.searchParams.get("region") || "all";
      const contractParam = url.searchParams.get("contract") || "all";
      const langParam = url.searchParams.get("lang") || "all";
      const catParam = url.searchParams.get("category") || "all";
      const minSalaryParam = parseInt(url.searchParams.get("min_salary") || "0", 10);
      const qParam = (url.searchParams.get("q") || "").toLowerCase().trim();
      const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
      const limit = Math.min(150, Math.max(1, parseInt(url.searchParams.get("limit") || "60", 10)));
      const offset = (page - 1) * limit;

      const dataset = await getOrFetchJobs(env);
      const updatedAt = dataset.updated_at;
      let filtered = dataset.jobs;

      if (regionParam !== "all") {
        filtered = filtered.filter(
          (j) =>
            (j.regionId && j.regionId.toLowerCase() === regionParam.toLowerCase()) ||
            (j.regionId && j.regionId.toLowerCase() === "worldwide")
        );
      }

      if (contractParam !== "all") {
        filtered = filtered.filter(
          (j) =>
            j.contractTypeId &&
            j.contractTypeId.toLowerCase() === contractParam.toLowerCase()
        );
      }

      if (catParam !== "all") {
        filtered = filtered.filter(
          (j) =>
            j.categoryId &&
            j.categoryId.toLowerCase() === catParam.toLowerCase()
        );
      }

      if (langParam !== "all") {
        filtered = filtered.filter(
          (j) =>
            j.language &&
            j.language.toLowerCase() === langParam.toLowerCase()
        );
      }

      if (minSalaryParam > 0) {
        filtered = filtered.filter((j) => {
          const maxVal = Math.max(j.salary_min || 0, j.salary_max || 0);
          return maxVal >= minSalaryParam;
        });
      }

      if (qParam) {
        filtered = filtered.filter((j) => {
          const textCorpus = `${j.title} ${j.company} ${j.description_snippet || ""} ${JSON.stringify(
            j.tags || []
          )}`.toLowerCase();
          return textCorpus.includes(qParam);
        });
      }

      const totalResults = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);

      return new Response(
        JSON.stringify(
          {
            success: true,
            total: totalResults,
            page,
            limit,
            total_pages: Math.ceil(totalResults / limit),
            updated_at: updatedAt,
            source: dataset.source,
            jobs: paginated,
          },
          null,
          2
        ),
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=1800",
            ...corsHeaders,
          },
        }
      );
    }

    // 11. Route API Stats : /api/stats
    if (pathname === "/api/stats") {
      let stats = null;
      if (env && env.DB) {
        try {
          stats = await getDbStats(env.DB);
        } catch (e) {}
      }

      if (!stats) {
        const dataset = await getOrFetchJobs(env);
        stats = {
          total: dataset.jobs.length,
          by_region: {},
          by_contract: {},
          by_source: {},
          by_language: { fr: 0, en: 0 },
        };
        for (const j of dataset.jobs) {
          stats.by_region[j.regionId] = (stats.by_region[j.regionId] || 0) + 1;
          const cId = j.contractTypeId || "cdi_fulltime";
          stats.by_contract[cId] = (stats.by_contract[cId] || 0) + 1;
          stats.by_source[j.source] = (stats.by_source[j.source] || 0) + 1;
          stats.by_language[j.language] = (stats.by_language[j.language] || 0) + 1;
        }
      }

      return new Response(
        JSON.stringify(
          {
            success: true,
            statistics: stats,
            updated_at: lastIngestionTime || new Date().toISOString(),
          },
          null,
          2
        ),
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...corsHeaders,
          },
        }
      );
    }

    // 12. Déclencheur manuel de rafraîchissement & notifications : /api/refresh
    if (pathname === "/api/refresh") {
      try {
        const freshJobs = await scrapeAllJobs();
        cachedJobs = freshJobs;
        lastIngestionTime = new Date().toISOString();

        let savedDb = 0;
        if (env && env.DB) {
          await initDb(env.DB);
          savedDb = await saveJobsToDb(env.DB, freshJobs);
        }

        const notifResults = await processNotifications(env, freshJobs, siteUrl);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Scraping rafraîchi et notifications traitées avec succès.",
            jobs_scraped: freshJobs.length,
            jobs_saved_d1: savedDb,
            notifications: notifResults,
            updated_at: lastIngestionTime,
          }),
          {
            headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            error: err.message,
            stack: err.stack,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
          }
        );
      }
    }

    // 21. Route Racine (/) : Interface Web Responsive & Content Negotiation Markdown
    if (pathname === "/" || pathname === "/index.html") {
      const { jobs, updated_at } = await getOrFetchJobs(env);

      // Support Content Negotiation pour Agents IA (Accept: text/markdown)
      const acceptHeader = request.headers.get("Accept") || "";
      if (acceptHeader.includes("text/markdown")) {
        const fullMd = generateLlmsFullTxt(jobs, { siteUrl });
        return new Response(fullMd, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=600, s-maxage=1800",
            ...corsHeaders,
          },
        });
      }

      const html = renderHTML(jobs, { updated_at });

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300, s-maxage=1800",
          ...corsHeaders,
        },
      });
    }

    // Redirection automatique des routes inconnues
    return Response.redirect(new URL("/", request.url).toString(), 302);
  },

  /**
   * Cron Trigger quotidien (0 6 * * *)
   */
  async scheduled(event, env, ctx) {
    const startTime = Date.now();
    console.log(`[CRON] Début de l'ingestion quotidienne à ${new Date().toISOString()}...`);

    try {
      const freshJobs = await scrapeAllJobs();
      if (freshJobs && freshJobs.length > 0) {
        cachedJobs = freshJobs;
        lastIngestionTime = new Date().toISOString();

        // Sauvegarde dans Cloudflare D1
        let savedDb = 0;
        if (env && env.DB) {
          await initDb(env.DB);
          savedDb = await saveJobsToDb(env.DB, freshJobs);
        }

        // Traitement et envoi des alertes emails & web push
        const siteUrl = (env && env.SITE_URL) || "https://remote-jobs.edounze.com";
        const notifResults = await processNotifications(env, freshJobs, siteUrl);

        const durationMs = Date.now() - startTime;
        console.log(
          `[CRON] ✅ Succès : ${freshJobs.length} offres scrapées (${savedDb} dans D1), ${notifResults.emails_sent} emails & ${notifResults.pushes_sent} push envoyés en ${durationMs}ms.`
        );
      }
    } catch (error) {
      console.error("[CRON] ❌ Erreur d'exécution Cron :", error);
    }
  },
};
