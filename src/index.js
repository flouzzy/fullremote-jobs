/**
 * FullRemote-Jobs Cloudflare Worker
 * Subdomain: fullremote-jobs.edounze.com
 * Repository: flouzzy/fullremote-jobs
 */

import { scrapeAllJobs } from "./scraper.js";
import { FALLBACK_JOBS } from "./fallback-data.js";
import { renderHTML } from "./ui.js";
import { initDb, saveJobsToDb, queryJobsFromDb, getDbStats } from "./db.js";
import { renderJobDetailPage, generateRssFeed, generateSitemap } from "./seo.js";

// Cache mémoire local en runtime Worker
let cachedJobs = null;
let lastIngestionTime = null;

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

export default {
  /**
   * Point d'entrée HTTP (Requêtes web, SEO, RSS & API)
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const siteUrl = `${url.protocol}//${url.host}`;

    // Headers standards de sécurité et CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
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

    // 2. Route Flux RSS 2.0 : /rss ou /feed
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

    // 3. Route Sitemap XML : /sitemap.xml
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

    // 4. Route SEO fiche dédiée : /jobs/:id
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
      // Redirection si l'offre n'existe plus
      return Response.redirect(new URL("/", request.url).toString(), 302);
    }

    // 5. Route API : /api/jobs
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
      let filtered = [...dataset.jobs];

      if (regionParam !== "all") filtered = filtered.filter((j) => j.regionId === regionParam);
      if (contractParam !== "all") filtered = filtered.filter((j) => (j.contractTypeId || "cdi_fulltime") === contractParam);
      if (langParam !== "all") filtered = filtered.filter((j) => j.language === langParam);
      if (catParam !== "all") filtered = filtered.filter((j) => j.categoryId === catParam);
      if (minSalaryParam > 0) {
        filtered = filtered.filter((j) => {
          const maxS = Math.max(j.salary_max_eur || 0, j.salary_max_usd || 0, j.salary_min_eur || 0, j.salary_min_usd || 0);
          return maxS >= minSalaryParam;
        });
      }
      if (qParam) {
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(qParam) ||
            j.company.toLowerCase().includes(qParam) ||
            (j.contractType && j.contractType.toLowerCase().includes(qParam)) ||
            (j.tags && j.tags.some((t) => t.toLowerCase().includes(qParam)))
        );
      }

      const totalUnfiltered = dataset.jobs.length;
      const paginatedJobs = filtered.slice(offset, offset + limit);

      return new Response(
        JSON.stringify(
          {
            success: true,
            page: page,
            limit: limit,
            count: paginatedJobs.length,
            total_matching: filtered.length,
            total_unfiltered: totalUnfiltered,
            updated_at: updatedAt,
            filters: {
              region: regionParam,
              contract: contractParam,
              language: langParam,
              category: catParam,
              min_salary: minSalaryParam > 0 ? minSalaryParam : null,
              search: qParam || null,
            },
            jobs: paginatedJobs,
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

    // 6. Route API Stats : /api/stats
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

    // 7. Déclencheur manuel de rafraîchissement : /api/refresh
    if (pathname === "/api/refresh") {
      const freshJobs = await scrapeAllJobs();
      cachedJobs = freshJobs;
      lastIngestionTime = new Date().toISOString();

      let savedDb = 0;
      if (env && env.DB) {
        await initDb(env.DB);
        savedDb = await saveJobsToDb(env.DB, freshJobs);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Scraping rafraîchi avec succès.",
          jobs_scraped: freshJobs.length,
          jobs_saved_d1: savedDb,
          updated_at: lastIngestionTime,
        }),
        {
          headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // 8. Route Racine (/) : Interface Web Responsive
    if (pathname === "/" || pathname === "/index.html") {
      const { jobs, updated_at } = await getOrFetchJobs(env);
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

        const durationMs = Date.now() - startTime;
        console.log(
          `[CRON] ✅ Succès : ${freshJobs.length} offres scrapées (${savedDb} dans D1) en ${durationMs}ms.`
        );
      }
    } catch (error) {
      console.error("[CRON] ❌ Erreur d'exécution Cron :", error);
    }
  },
};
