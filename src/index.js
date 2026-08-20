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
  saveTalentProfile,
  queryTalentsFromDb,
  getTalentById,
  getTalentByToken,
  getTalentByEmail,
  getAdminByToken,
  getAdminByEmail,
  getAdminDashboardMetrics,
  getAllTalentsForAdmin,
  updateTalentStatus,
  updateTalentProfileByToken,
  deleteTalentProfileByToken,
  recordTalentContact,
  recordJobClick,
  recordJobFeedback,
  getTalentApplications,
  updateTalentApplicationStatus,
  deleteTalentApplication,
  reportDeadJob,
  getTrackingKpis,
  saveRecruiterSubscriber,
  getRecruiterByToken,
  getActiveRecruiters,
  getTopWeeklyTalents,
} from "./db.js";
import {
  sendResendEmail,
  buildWelcomeEmailHtml,
  buildJobDigestEmailHtml,
  matchJobToAlert,
  buildTalentWelcomeEmailHtml,
  buildTalentMagicLinkEmailHtml,
  buildAdminMagicLinkEmailHtml,
  buildTalentContactNotificationEmailHtml,
  buildWeeklyTalentDropEmailHtml,
} from "./email.js";
import {
  DEFAULT_VAPID_PUBLIC_KEY,
  DEFAULT_VAPID_PRIVATE_KEY,
  sendWebPushNotification,
} from "./push.js";
import {
  renderJobDetailPage,
  generateRssFeed,
  generateSitemap,
  PROGRAMMATIC_PAGES,
  renderProgrammaticLandingPage,
} from "./seo.js";
import {
  renderTalentsDirectoryPage,
  renderJoinTalentPoolPage,
  renderManageTalentPage,
  renderTalentLoginPage,
} from "./talents.js";
import {
  renderAdminLoginPage,
  renderAdminDashboardPage,
} from "./admin.js";
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
    url: "/",
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
        if (client.url.includes(self.location.hostname) && "focus" in client) {
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
      const dbJobs = await queryJobsFromDb(env.DB, { limit: 2000 });
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
 * Vérifie si une alerte email est éligible pour un digest (STRICTEMENT MAX 1 EMAIL PAR 24H / PAR JOUR)
 */
function isAlertEligibleForEmail(alert) {
  if (!alert.last_sent_at) return true;

  const now = Date.now();
  const lastSentTime = new Date(alert.last_sent_at).getTime();
  if (isNaN(lastSentTime)) return true;

  const hoursSinceLast = (now - lastSentTime) / (1000 * 60 * 60);

  // Vérification de la même journée calendaire UTC (interdiction formelle d'envoyer 2 fois le même jour)
  const todayUtc = new Date().toISOString().slice(0, 10);
  const lastSentUtc = new Date(lastSentTime).toISOString().slice(0, 10);
  if (todayUtc === lastSentUtc) {
    return false; // Déjà envoyé aujourd'hui
  }

  if (alert.frequency === "weekly") {
    // 6 jours minimum d'intervalle pour le digest hebdomadaire
    return hoursSinceLast >= 144;
  }

  // Quotidien : minimum 20 heures d'intervalle entre deux digests
  return hoursSinceLast >= 20;
}

/**
 * Traite et distribue les alertes emails et notifications web push
 */
async function processNotifications(env, jobs = [], siteUrl = "https://remote-jobs.app") {
  if (!jobs || jobs.length === 0 || !env || !env.DB) {
    return { emails_sent: 0, pushes_sent: 0 };
  }

  const resendApiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL || "FullRemote Jobs <alerts@hey.edounze.com>";
  let emailsSent = 0;
  let pushesSent = 0;

  // 1. Alertes Emails personnalisées (STRICT MAXIMUM 1 EMAIL PAR JOUR - 0 SPAM)
  try {
    const activeAlerts = await getActiveEmailAlerts(env.DB);
    for (const alert of activeAlerts) {
      // Contrôle anti-spam strict : au maximum 1 email par jour
      if (!isAlertEligibleForEmail(alert)) {
        continue;
      }

      const matchingJobs = jobs.filter((job) => matchJobToAlert(job, alert));
      if (matchingJobs.length > 0) {
        // Limiter au top 10 des offres les plus pertinentes
        const topJobs = matchingJobs.slice(0, 10);
        const html = buildJobDigestEmailHtml({ jobs: topJobs, alert, siteUrl });
        const subject = `🔔 ${topJobs.length} nouvelle${
          topJobs.length > 1 ? "s" : ""
        } offre${topJobs.length > 1 ? "s" : ""} 100% remote pour votre profil`;

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
          items_count: topJobs.length,
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

  // 2. Notifications Web Push Navigateur (TEMPS RÉEL)
  try {
    const pushSubs = await getActivePushSubscriptions(env.DB);
    for (const sub of pushSubs) {
      const payload = {
        title: "Full Remote Jobs 🌍",
        body: `✨ ${jobs.length} opportunités 100% télétravail disponibles en direct !`,
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
    const siteUrl = ((env && env.SITE_URL) || `${url.protocol}//${url.host}`).replace(/\/+$/, "");

    // Redirection permanente 301 de l'ancien domaine vers remote-jobs.app
    if (url.host.includes("edounze.com")) {
      return Response.redirect(`https://remote-jobs.app${pathname}${url.search}`, 301);
    }

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
      return new Response(url.host, {
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

    // 9.quater Routes Cockpit Exécutif Administrateur : /admin
    if (pathname === "/admin" || pathname === "/admin/dashboard") {
      const token = url.searchParams.get("token") || "";
      let admin = null;
      if (token && env && env.DB) {
        await initDb(env.DB);
        admin = await getAdminByToken(env.DB, token);
      }
      if (!admin) {
        const loginHtml = renderAdminLoginPage({ siteUrl });
        return new Response(loginHtml, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            ...corsHeaders,
          },
        });
      }

      const [metrics, allTalents, trackingKpis] = await Promise.all([
        getAdminDashboardMetrics(env.DB),
        getAllTalentsForAdmin(env.DB, { limit: 200 }),
        getTrackingKpis(env.DB),
      ]);

      const html = renderAdminDashboardPage(metrics || {}, allTalents || [], admin, { siteUrl, trackingKpis });
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          ...corsHeaders,
        },
      });
    }

    if (pathname === "/admin/login") {
      const loginHtml = renderAdminLoginPage({ siteUrl });
      return new Response(loginHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          ...corsHeaders,
        },
      });
    }

    // API Demande Magic Link Admin : POST /api/admin/magic-link
    if (pathname === "/api/admin/magic-link" && request.method === "POST") {
      try {
        const body = await request.json();
        const email = (body.email || "").trim().toLowerCase();

        if (!email) {
          return new Response(JSON.stringify({ success: false, error: "Veuillez renseigner votre email." }), {
            status: 400,
            headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
          });
        }

        let adminUser = null;
        if (env && env.DB) {
          await initDb(env.DB);
          adminUser = await getAdminByEmail(env.DB, email);
        }

        if (adminUser) {
          const resendApiKey = env.RESEND_API_KEY;
          const fromEmail = env.RESEND_FROM_EMAIL || "FullRemote Jobs <alerts@hey.edounze.com>";
          const magicHtml = buildAdminMagicLinkEmailHtml({ adminUser, siteUrl });

          await sendResendEmail({
            apiKey: resendApiKey,
            from: fromEmail,
            to: email,
            subject: "🛡️ Votre accès SuperAdmin FullRemote.Jobs",
            html: magicHtml,
          });

          return new Response(
            JSON.stringify({ success: true, message: "Lien magique administrateur envoyé avec succès !" }),
            { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, error: "Cet email n'est pas autorisé en tant qu'administrateur." }),
          { status: 403, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // API Purge des offres obsolètes (> 30j) : POST /api/admin/jobs/purge
    if (pathname === "/api/admin/jobs/purge" && request.method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const token = body.token || "";
        let admin = null;
        if (token && env && env.DB) {
          admin = await getAdminByToken(env.DB, token);
        }
        if (!admin) {
          return new Response(JSON.stringify({ success: false, error: "Non autorisé" }), { status: 401, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } });
        }

        const res = await env.DB.prepare("DELETE FROM jobs WHERE datetime(published_at) < datetime('now', '-30 days')").run();
        return new Response(JSON.stringify({ success: true, purged: res.meta?.changes || 0 }), { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } });
      }
    }

    // 9.ter Routes Talent Drops & Reverse Recruiting
    if (pathname === "/talents") {
      if (env && env.DB) await initDb(env.DB);
      const cookieHeader = request.headers.get("cookie") || "";
      const talentMatch = cookieHeader.match(/talent_token=([^;]+)/);
      const talentToken = talentMatch ? decodeURIComponent(talentMatch[1]) : (url.searchParams.get("token") || "");
      
      const recruiterMatch = cookieHeader.match(/recruiter_token=([^;]+)/);
      const recruiterToken = recruiterMatch ? decodeURIComponent(recruiterMatch[1]) : (url.searchParams.get("recruiter_token") || "");
      
      let isPaidRecruiter = false;
      let loggedInTalent = null;
      let newRecruiterCookie = null;
      if (env && env.DB) {
        const sessionId = url.searchParams.get("session_id");
        if (sessionId) {
          const recBySession = await env.DB.prepare("SELECT * FROM recruiter_subscribers WHERE stripe_subscription_id = ?").bind(sessionId).first();
          if (recBySession && recBySession.auth_token) {
            isPaidRecruiter = true;
            newRecruiterCookie = `recruiter_token=${encodeURIComponent(recBySession.auth_token)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
          }
        }
        if (!isPaidRecruiter && recruiterToken) {
          const rec = await getRecruiterByToken(env.DB, recruiterToken);
          if (rec && rec.is_active) isPaidRecruiter = true;
        }
        if (talentToken) {
          loggedInTalent = await getTalentByToken(env.DB, talentToken);
        }
      }

      const talents = env && env.DB ? await queryTalentsFromDb(env.DB) : [];
      const isRecruiterSuccess = url.searchParams.get("recruiter_success") === "true";
      const html = renderTalentsDirectoryPage(talents, {
        siteUrl,
        talentToken,
        loggedInTalentId: loggedInTalent?.id || "",
        recruiterToken,
        isRecruiter: isPaidRecruiter,
        recruiterSuccess: isRecruiterSuccess
      });
      const responseHeaders = {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, max-age=0",
        ...corsHeaders,
      };
      if (newRecruiterCookie) {
        responseHeaders["Set-Cookie"] = newRecruiterCookie;
      }
      return new Response(html, { headers: responseHeaders });
    }

    if (pathname === "/talents/join" || pathname === "/rejoindre-le-vivier") {
      const html = renderJoinTalentPoolPage({ siteUrl });
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=600",
          ...corsHeaders,
        },
      });
    }

    if (pathname === "/talents/login" || pathname === "/connexion-talent") {
      const html = renderTalentLoginPage({ siteUrl });
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=600",
          ...corsHeaders,
        },
      });
    }

    if (pathname === "/talents/manage") {
      const token = url.searchParams.get("token") || "";
      const successMsg = url.searchParams.get("success") || "";
      const errorMsg = url.searchParams.get("error") || "";
      const welcome = url.searchParams.get("welcome") === "1";
      let talent = null;
      if (token && env && env.DB) {
        await initDb(env.DB);
        talent = await getTalentByToken(env.DB, token);
      }
      if (!talent) {
        return Response.redirect(new URL("/talents/join", request.url).toString(), 302);
      }
      let applications = [];
      if (talent && env && env.DB) {
        applications = await getTalentApplications(env.DB, talent.id);
      }
      const html = renderManageTalentPage(talent, successMsg, errorMsg, { siteUrl, welcome, applications });
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          ...corsHeaders,
        },
      });
    }

    // API Connexion Talent par Magic Link : POST /api/talents/magic-link
    if (pathname === "/api/talents/magic-link" && request.method === "POST") {
      try {
        const body = await request.json();
        const email = (body.email || "").trim().toLowerCase();

        if (email && env && env.DB) {
          await initDb(env.DB);
          const talent = await getTalentByEmail(env.DB, email);
          if (talent) {
            const resendApiKey = env.RESEND_API_KEY;
            const fromEmail = env.RESEND_FROM_EMAIL || "FullRemote Jobs <alerts@hey.edounze.com>";
            const magicLinkHtml = buildTalentMagicLinkEmailHtml({ talent, siteUrl });

            await sendResendEmail({
              apiKey: resendApiKey,
              from: fromEmail,
              to: email,
              subject: "🔑 Votre lien magique de connexion — FullRemote.Jobs",
              html: magicLinkHtml,
            });
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Si cette adresse est associée à un profil, votre lien magique vient de vous être envoyé !",
          }),
          { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // API Inscription Talent : POST /api/talents/join
    if (pathname === "/api/talents/join" && request.method === "POST") {
      try {
        const body = await request.json();
        const email = (body.email || "").trim().toLowerCase();
        const title = (body.title || "").trim();
        const primaryStack = (body.primary_stack || "").trim();

        if (!email || !title || !primaryStack) {
          return new Response(
            JSON.stringify({ success: false, error: "Veuillez remplir le titre, la stack et votre email." }),
            { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        let savedTalent = null;
        if (env && env.DB) {
          await initDb(env.DB);
          savedTalent = await saveTalentProfile(env.DB, body);

          // Synchronisation automatique de l'alerte email pour les offres personnalisées
          try {
            await saveEmailAlert(env.DB, {
              email,
              keywords: primaryStack,
              frequency: body.alert_frequency || "weekly",
              region_id: "all",
            });
          } catch (alertErr) {
            console.warn("Alerte auto-creation notice:", alertErr.message);
          }
        } else {
          savedTalent = { id: `talent_${Date.now()}`, manage_token: `token_${Date.now()}`, ...body };
        }

        // Envoi email de confirmation avec lien secret
        const resendApiKey = env.RESEND_API_KEY;
        const fromEmail = env.RESEND_FROM_EMAIL || "FullRemote Jobs <alerts@hey.edounze.com>";
        const welcomeHtml = buildTalentWelcomeEmailHtml({ talent: savedTalent, siteUrl });

        await sendResendEmail({
          apiKey: resendApiKey,
          from: fromEmail,
          to: email,
          subject: "Confirmation d'activation de votre profil Talent — FullRemote.Jobs",
          html: welcomeHtml,
        });

        return new Response(
          JSON.stringify({
            success: true,
            id: savedTalent.id,
            manage_token: savedTalent.manage_token,
          }),
          { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // API Sollicitation Recruteur -> Talent : POST /api/talents/:id/contact
    if (pathname.startsWith("/api/talents/") && pathname.endsWith("/contact") && request.method === "POST") {
      try {
        const talentId = decodeURIComponent(pathname.replace("/api/talents/", "").replace("/contact", "")).trim();
        const body = await request.json();
        const { recruiter_name, recruiter_company, recruiter_email, message } = body;

        if (!recruiter_name || !recruiter_company || !recruiter_email || !message) {
          return new Response(
            JSON.stringify({ success: false, error: "Veuillez renseigner tous les champs obligatoires (*)." }),
            { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        let talent = null;
        if (env && env.DB) {
          await initDb(env.DB);
          talent = await getTalentById(env.DB, talentId);
          await recordTalentContact(env.DB, { ...body, talent_id: talentId });
        }

        if (talent && talent.email) {
          const resendApiKey = env.RESEND_API_KEY;
          const fromEmail = env.RESEND_FROM_EMAIL || "FullRemote Jobs <alerts@hey.edounze.com>";
          const notifHtml = buildTalentContactNotificationEmailHtml({ talent, contact: body, siteUrl });

          await sendResendEmail({
            apiKey: resendApiKey,
            from: fromEmail,
            to: talent.email,
            subject: `Opportunité de ${recruiter_company} pour votre profil — FullRemote.Jobs`,
            html: notifHtml,
          });
        }

        return new Response(
          JSON.stringify({ success: true, message: "Proposition transmise au candidat !" }),
          { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // ----------------------------------------------------
    // API TRACKING DE CLICS & MODALE POST-CANDIDATURE
    // ----------------------------------------------------

    // API Enregistrement Clic Sortant : POST /api/track/click
    if (pathname === "/api/track/click" && request.method === "POST") {
      try {
        const body = await request.json();
        const { jobId, jobTitle, company, userType, userId, userEmail, referrer, tags } = body;

        let clickId = null;
        if (env && env.DB && jobId) {
          await initDb(env.DB);
          clickId = await recordJobClick(env.DB, {
            jobId,
            jobTitle,
            company,
            userType: userType || "guest",
            userId,
            userEmail,
            referrer,
            tags: tags || []
          });
        }

        return new Response(
          JSON.stringify({ success: true, clickId }),
          { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // API Feedback Post-Clic ("Avez-vous postulé ?") : POST /api/track/feedback
    if (pathname === "/api/track/feedback" && request.method === "POST") {
      try {
        const body = await request.json();
        const { clickId, jobId, feedback, talentToken, userEmail, notes } = body;

        if (!jobId || !feedback) {
          return new Response(
            JSON.stringify({ success: false, error: "jobId et feedback requis." }),
            { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        let res = { success: true };
        if (env && env.DB) {
          await initDb(env.DB);
          res = await recordJobFeedback(env.DB, {
            clickId,
            jobId,
            feedback,
            talentToken,
            userEmail,
            notes
          });
        }

        return new Response(
          JSON.stringify(res),
          { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // API Signalement de lien mort : POST /api/track/report
    if (pathname === "/api/track/report" && request.method === "POST") {
      try {
        const body = await request.json();
        const { jobId, reason, details } = body;

        if (env && env.DB && jobId) {
          await initDb(env.DB);
          await reportDeadJob(env.DB, { jobId, reason: reason || "expired", details });
        }

        return new Response(
          JSON.stringify({ success: true, message: "Merci ! Notre équipe a été notifiée." }),
          { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // API Récupération des Candidatures d'un Talent : GET /api/talents/applications
    if (pathname === "/api/talents/applications" && request.method === "GET") {
      try {
        const token = url.searchParams.get("token") || "";
        if (!token) {
          return new Response(
            JSON.stringify({ success: false, error: "Token requis." }),
            { status: 401, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        let applications = [];
        if (env && env.DB) {
          await initDb(env.DB);
          const talent = await getTalentByToken(env.DB, token);
          if (talent) {
            applications = await getTalentApplications(env.DB, talent.id);
          }
        }

        return new Response(
          JSON.stringify({ success: true, applications }),
          { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // API Mise à jour statut candidature : POST /api/talents/applications/update-status
    if (pathname === "/api/talents/applications/update-status" && request.method === "POST") {
      try {
        const body = await request.json();
        const { token, jobId, status, notes } = body;

        if (!token || !jobId || !status) {
          return new Response(
            JSON.stringify({ success: false, error: "Paramètres manquants." }),
            { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        if (env && env.DB) {
          await initDb(env.DB);
          const talent = await getTalentByToken(env.DB, token);
          if (talent) {
            await updateTalentApplicationStatus(env.DB, talent.id, jobId, status, notes);
            return new Response(
              JSON.stringify({ success: true, message: "Statut mis à jour !" }),
              { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
            );
          }
        }

        return new Response(
          JSON.stringify({ success: false, error: "Talent non trouvé." }),
          { status: 404, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // API Suppression candidature : POST /api/talents/applications/delete
    if (pathname === "/api/talents/applications/delete" && request.method === "POST") {
      try {
        const body = await request.json();
        const { token, jobId } = body;

        if (env && env.DB && token && jobId) {
          await initDb(env.DB);
          const talent = await getTalentByToken(env.DB, token);
          if (talent) {
            await deleteTalentApplication(env.DB, talent.id, jobId);
            return new Response(
              JSON.stringify({ success: true, message: "Candidature retirée." }),
              { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
            );
          }
        }

        return new Response(
          JSON.stringify({ success: false, error: "Action non autorisée." }),
          { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // API Consultation / Téléchargement CV Candidat : GET /api/talents/:id/cv
    if (pathname.startsWith("/api/talents/") && pathname.endsWith("/cv") && request.method === "GET") {
      try {
        const talentId = decodeURIComponent(pathname.replace("/api/talents/", "").replace("/cv", "")).trim();
        if (!env || !env.DB) {
          return new Response("Service indisponible.", { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
        await initDb(env.DB);
        const talent = await getTalentById(env.DB, talentId);
        if (!talent) {
          return new Response("Profil Talent introuvable.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }

        // Authentification : token en query param, cookie ou header Authorization
        const cookieHeader = request.headers.get("cookie") || "";
        const talentCookie = (cookieHeader.match(/talent_token=([^;]+)/) || [])[1];
        const recruiterCookie = (cookieHeader.match(/recruiter_token=([^;]+)/) || [])[1];
        const adminCookie = (cookieHeader.match(/admin_token=([^;]+)/) || [])[1];
        const authHeader = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");

        const token = url.searchParams.get("token") || recruiterCookie || talentCookie || adminCookie || authHeader;

        let isAuthorized = false;

        // 1. Vérifier si c'est le propriétaire du profil
        if (token && (talent.manage_token === token || (await getTalentByToken(env.DB, token))?.id === talentId)) {
          isAuthorized = true;
        }

        // 2. Vérifier si c'est un administrateur
        if (!isAuthorized && token && ((await getAdminByToken(env.DB, token)) || token === env.ADMIN_SECRET_TOKEN)) {
          isAuthorized = true;
        }

        // 3. Vérifier si c'est un recruteur payant actif
        if (!isAuthorized && token) {
          const recruiter = await getRecruiterByToken(env.DB, token);
          if (recruiter && recruiter.is_active) {
            isAuthorized = true;
          }
        }

        if (!isAuthorized) {
          return new Response(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accès CV Réservé — FullRemote.Jobs</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap">
  <style>
    body { margin: 0; padding: 2rem 1rem; font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.5rem 2rem; max-width: 520px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(37,99,235,0.1); color: #2563eb; font-weight: 800; font-size: 0.8rem; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; margin-bottom: 1rem; }
    h1 { font-size: 1.45rem; font-weight: 800; margin: 0 0 0.75rem; letter-spacing: -0.02em; }
    p { font-size: 0.92rem; color: #64748b; line-height: 1.6; margin: 0 0 1.5rem; }
    .btn-primary { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 0.95rem; padding: 0.85rem 1.75rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
    .btn-secondary { display: block; margin-top: 1.25rem; font-size: 0.85rem; color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🔒 Accès CV Protégé</div>
    <h1>Consultation réservée aux Recruteurs</h1>
    <p>Pour consulter les CVs complets et contacter directement nos talents confirmés, vous devez être connecté avec un compte <strong>Recruiter Pass B2B</strong> actif (149 € / mois) ou être le propriétaire de ce profil.</p>
    <a href="/talents" class="btn-primary">👑 Débloquer le Recruiter Pass (149 € / mois)</a>
    <a href="/talents/login" class="btn-secondary">Vous êtes ce candidat ? Connectez-vous à votre espace</a>
  </div>
</body>
</html>`, {
            status: 403,
            headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders }
          });
        }

        if (talent.cv_data && talent.cv_data.startsWith("data:")) {
          const commaIdx = talent.cv_data.indexOf(",");
          if (commaIdx !== -1) {
            const metaPart = talent.cv_data.substring(0, commaIdx);
            const base64Data = talent.cv_data.substring(commaIdx + 1);
            const mimeMatch = metaPart.match(/data:([^;]+)/);
            const mimeType = mimeMatch ? mimeMatch[1] : "application/pdf";
            const binaryString = atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const cleanFilename = talent.cv_filename || `CV_${talent.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
            return new Response(bytes.buffer, {
              status: 200,
              headers: {
                "Content-Type": mimeType,
                "Content-Disposition": `inline; filename="${cleanFilename}"`,
                "Cache-Control": "private, no-cache, no-store",
                ...corsHeaders,
              },
            });
          }
        }
        if (talent.cv_url) {
          return Response.redirect(talent.cv_url, 302);
        }
        return new Response("Aucun CV n'a été rattaché à ce profil.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      } catch (err) {
        return new Response("Erreur lors de la récupération du CV : " + err.message, { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    }

    // API Mise à jour Statut Talent (Pause / Actif / Recruté) : POST /api/talents/manage/status
    if (pathname === "/api/talents/manage/status" && request.method === "POST") {
      let token = "";
      let status = "";
      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const body = await request.json();
        token = body.token || "";
        status = body.status || "";
      } else {
        const formData = await request.formData();
        token = formData.get("token") || "";
        status = formData.get("status") || "";
      }

      if (token && status && env && env.DB) {
        await initDb(env.DB);
        await updateTalentStatus(env.DB, token, status);
      }

      return Response.redirect(new URL(`/talents/manage?token=${encodeURIComponent(token)}&success=Statut mis à jour avec succès.`, request.url).toString(), 302);
    }

    // API Mise à jour Préférences Alertes Talent : POST /api/talents/manage/alert
    if (pathname === "/api/talents/manage/alert" && request.method === "POST") {
      let token = "";
      let frequency = "weekly";
      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const body = await request.json();
        token = body.token || "";
        frequency = body.frequency || "weekly";
      } else {
        const formData = await request.formData();
        token = formData.get("token") || "";
        frequency = formData.get("frequency") || "weekly";
      }

      if (token && env && env.DB) {
        await initDb(env.DB);
        const talent = await getTalentByToken(env.DB, token);
        if (talent && talent.email) {
          if (frequency === "off") {
            try {
              await env.DB.prepare("UPDATE email_alerts SET is_active = 0 WHERE email = ?").bind(talent.email.toLowerCase().trim()).run();
            } catch (_) {}
          } else {
            try {
              await saveEmailAlert(env.DB, {
                email: talent.email.toLowerCase().trim(),
                keywords: talent.primary_stack || "",
                frequency,
                region_id: "all",
              });
            } catch (_) {}
          }
        }
      }

      return Response.redirect(new URL(`/talents/manage?token=${encodeURIComponent(token)}&success=Préférences d'alertes enregistrées avec succès.`, request.url).toString(), 302);
    }

    // API Mise à jour Profil Talent : POST /api/talents/manage/profile
    if (pathname === "/api/talents/manage/profile" && request.method === "POST") {
      try {
        const body = await request.json();
        const token = body.token || "";
        if (!token) {
          return new Response(JSON.stringify({ success: false, error: "Token manquant." }), { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } });
        }
        if (env && env.DB) {
          await initDb(env.DB);
          const updated = await updateTalentProfileByToken(env.DB, token, body);
          if (updated) {
            return new Response(JSON.stringify({ success: true, talent: updated }), { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } });
          }
        }
        return new Response(JSON.stringify({ success: false, error: "Impossible de mettre à jour le profil." }), { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } });
      }
    }

    // API Suppression Définitive Profil Talent (RGPD) : POST /api/talents/manage/delete
    if (pathname === "/api/talents/manage/delete" && request.method === "POST") {
      let token = "";
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await request.json().catch(() => ({}));
        token = body.token || "";
      } else {
        const formData = await request.formData();
        token = formData.get("token") || "";
      }

      if (token && env && env.DB) {
        await initDb(env.DB);
        await deleteTalentProfileByToken(env.DB, token);
      }

      return Response.redirect(new URL("/talents?success=Votre profil et vos données ont été définitivement supprimés.", request.url).toString(), 302);
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

        const canonicalUrl = siteUrl;
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

    // 9.bis API Stripe Checkout Recruiter Pass B2B (149 € / mois) : POST /api/checkout/recruiter-pass
    if (pathname === "/api/checkout/recruiter-pass" && request.method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const email = (body.email || "").trim().toLowerCase();
        const company = (body.company || "").trim();

        if (!email) {
          return new Response(
            JSON.stringify({ success: false, error: "Veuillez fournir un email professionnel valide." }),
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

        const canonicalUrl = siteUrl;
        const stripeParams = new URLSearchParams();
        stripeParams.append("payment_method_types[]", "card");
        stripeParams.append("mode", "payment");
        stripeParams.append("line_items[0][price_data][currency]", "eur");
        stripeParams.append("line_items[0][price_data][unit_amount]", "14900");
        stripeParams.append("line_items[0][price_data][product_data][name]", "Recruiter Pass B2B — Accès Vivier & Talent Drops (30 jours)");
        stripeParams.append("line_items[0][price_data][product_data][description]", "Contacts directs illimités des talents + Réception hebdomadaire du Weekly Talent Drop");
        stripeParams.append("line_items[0][quantity]", "1");
        stripeParams.append("customer_email", email);
        stripeParams.append("success_url", `${canonicalUrl}/talents?recruiter_success=true&session_id={CHECKOUT_SESSION_ID}`);
        stripeParams.append("cancel_url", `${canonicalUrl}/talents?canceled=true`);
        stripeParams.append("metadata[company]", company);
        stripeParams.append("metadata[email]", email);
        stripeParams.append("metadata[plan]", "talent_drop_pass");

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
          console.error("[STRIPE] Erreur Recruiter Pass :", session);
          return new Response(
            JSON.stringify({ success: false, error: session.error?.message || "Erreur Stripe." }),
            { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        // Sauvegarde immédiate du recruteur abonné dans D1
        if (env && env.DB) {
          await initDb(env.DB);
          await saveRecruiterSubscriber(env.DB, {
            email,
            company,
            plan: "talent_drop_pass",
            stripeCustomerId: session.customer || "",
            stripeSubscriptionId: session.subscription || session.id
          });
        }

        return new Response(
          JSON.stringify({ success: true, checkout_url: session.url, session_id: session.id }),
          { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      } catch (err) {
        console.error("[RECRUITER_PASS] Exception :", err);
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }
    }

    // 9.ter Route Cron Envoi Weekly Talent Drop : POST /api/cron/talent-drop
    if (pathname === "/api/cron/talent-drop" && request.method === "POST") {
      try {
        if (!env || !env.DB) {
          return new Response(JSON.stringify({ success: false, error: "Base de données non disponible" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        await initDb(env.DB);
        const [recruiters, topTalents] = await Promise.all([
          getActiveRecruiters(env.DB),
          getTopWeeklyTalents(env.DB, 10)
        ]);

        if (topTalents.length === 0) {
          return new Response(JSON.stringify({ success: true, message: "Aucun talent actif à diffuser cette semaine." }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        const resendApiKey = env.RESEND_API_KEY;
        const fromEmail = env.RESEND_FROM_EMAIL || "FullRemote Jobs <alerts@hey.edounze.com>";
        const emailHtml = buildWeeklyTalentDropEmailHtml({ talents: topTalents, siteUrl });

        let sentCount = 0;
        for (const recruiter of recruiters) {
          try {
            await sendResendEmail({
              apiKey: resendApiKey,
              from: fromEmail,
              to: recruiter.email,
              subject: "👑 Weekly Talent Drop : Les 10 Meilleurs Profils 100% Remote — FullRemote.Jobs",
              html: emailHtml
            });
            sentCount++;
          } catch (recErr) {
            console.error("[TALENT_DROP] Erreur envoi recruteur :", recruiter.email, recErr);
          }
        }

        return new Response(JSON.stringify({ success: true, sent_to: sentCount, talents_count: topTalents.length }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
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
        const html = renderJobDetailPage(job, { siteUrl, allJobs: jobs });
        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60, s-maxage=900, stale-while-revalidate=86400",
            ...corsHeaders,
          },
        });
      }
      return Response.redirect(new URL("/", request.url).toString(), 302);
    }

    // 9.bis Routes d'Atterrissage Programmatiques SEO (Stacks TIOBE & Régions)
    const cleanSlug = pathname.replace(/^\//, "").toLowerCase();
    if (PROGRAMMATIC_PAGES[cleanSlug]) {
      const pageConfig = PROGRAMMATIC_PAGES[cleanSlug];
      const { jobs } = await getOrFetchJobs(env);
      const matchingJobs = jobs.filter(pageConfig.filterFn);
      const html = renderProgrammaticLandingPage(pageConfig, matchingJobs, jobs, { siteUrl });

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=120, s-maxage=1800, stale-while-revalidate=86400",
          ...corsHeaders,
        },
      });
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

      const html = renderHTML(jobs, { updated_at, siteUrl });

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=60, s-maxage=900, stale-while-revalidate=86400",
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
        const siteUrl = (env && env.SITE_URL) || "https://remote-jobs.app";
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
