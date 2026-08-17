/**
 * FullRemote-Jobs Cloudflare Worker
 * Subdomain: fullremote-jobs.edounze.com
 * Repository: flouzzy/fullremote-jobs
 */

import { scrapeAllJobs } from "./scraper.js";
import { FALLBACK_JOBS } from "./fallback-data.js";
import { renderHTML } from "./ui.js";

// Cache mémoire en runtime Worker
let cachedJobs = null;
let lastIngestionTime = null;

/**
 * Récupère les jobs depuis la mémoire vive, le cache, ou exécute un scraping
 */
async function getOrFetchJobs() {
  if (cachedJobs && cachedJobs.length > 0) {
    return { jobs: cachedJobs, updated_at: lastIngestionTime };
  }

  try {
    const liveJobs = await scrapeAllJobs();
    if (liveJobs && liveJobs.length > 0) {
      cachedJobs = liveJobs;
      lastIngestionTime = new Date().toISOString();
      return { jobs: cachedJobs, updated_at: lastIngestionTime };
    }
  } catch (err) {
    console.error("Échec lors de la récupération directe :", err);
  }

  // Utilisation des données de secours garanties
  cachedJobs = FALLBACK_JOBS;
  lastIngestionTime = lastIngestionTime || new Date().toISOString();
  return { jobs: cachedJobs, updated_at: lastIngestionTime };
}

export default {
  /**
   * Point d'entrée HTTP (Requêtes web & API)
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Headers standards de sécurité et CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Route CNAME pour compatibilité
    if (pathname === "/CNAME") {
      return new Response("fullremote-jobs.edounze.com", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 2. Route API : /api/jobs
    if (pathname === "/api/jobs") {
      const { jobs, updated_at } = await getOrFetchJobs();

      // Paramètres de filtrage optionnels
      const regionParam = url.searchParams.get("region");
      const langParam = url.searchParams.get("lang");
      const catParam = url.searchParams.get("category");
      const qParam = (url.searchParams.get("q") || "").toLowerCase().trim();

      let filtered = [...jobs];

      if (regionParam && regionParam !== "all") {
        filtered = filtered.filter((j) => j.regionId === regionParam);
      }
      if (langParam && langParam !== "all") {
        filtered = filtered.filter((j) => j.language === langParam);
      }
      if (catParam && catParam !== "all") {
        filtered = filtered.filter((j) => j.categoryId === catParam);
      }
      if (qParam) {
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(qParam) ||
            j.company.toLowerCase().includes(qParam) ||
            (j.tags && j.tags.some((t) => t.toLowerCase().includes(qParam)))
        );
      }

      return new Response(
        JSON.stringify(
          {
            success: true,
            total: filtered.length,
            total_unfiltered: jobs.length,
            updated_at: updated_at,
            filters: {
              region: regionParam || "all",
              language: langParam || "all",
              category: catParam || "all",
              search: qParam || null,
            },
            jobs: filtered,
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

    // 3. Route API Stats : /api/stats
    if (pathname === "/api/stats") {
      const { jobs, updated_at } = await getOrFetchJobs();
      
      const stats = {
        success: true,
        total_jobs: jobs.length,
        updated_at: updated_at,
        by_region: {},
        by_source: {},
        by_language: { fr: 0, en: 0 },
        by_category: {},
      };

      for (const j of jobs) {
        stats.by_region[j.regionId] = (stats.by_region[j.regionId] || 0) + 1;
        stats.by_source[j.source] = (stats.by_source[j.source] || 0) + 1;
        stats.by_language[j.language] = (stats.by_language[j.language] || 0) + 1;
        stats.by_category[j.categoryId] = (stats.by_category[j.categoryId] || 0) + 1;
      }

      return new Response(JSON.stringify(stats, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders,
        },
      });
    }

    // 4. Route Racine (/) : Interface Utilisateur Web Responsive
    if (pathname === "/" || pathname === "/index.html") {
      const { jobs, updated_at } = await getOrFetchJobs();
      const html = renderHTML(jobs, { updated_at });

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300, s-maxage=1800",
          ...corsHeaders,
        },
      });
    }

    // Route 404 - Redirection vers accueil
    return Response.redirect(new URL("/", request.url).toString(), 302);
  },

  /**
   * Point d'entrée Cron Trigger (Déclenché automatiquement chaque matin à 6h00 UTC)
   */
  async scheduled(event, env, ctx) {
    const startTime = Date.now();
    console.log(`[CRON] Démarrage du rafraîchissement planifié des jobs à ${new Date().toISOString()}...`);

    try {
      const freshJobs = await scrapeAllJobs();
      if (freshJobs && freshJobs.length > 0) {
        cachedJobs = freshJobs;
        lastIngestionTime = new Date().toISOString();

        // Analyse statistique
        const sourcesCount = {};
        const regionsCount = {};
        for (const j of freshJobs) {
          sourcesCount[j.source] = (sourcesCount[j.source] || 0) + 1;
          regionsCount[j.regionId] = (regionsCount[j.regionId] || 0) + 1;
        }

        const durationMs = Date.now() - startTime;
        console.log(`[CRON] ✅ Succès : ${freshJobs.length} offres 100% full remote indexées en ${durationMs}ms.`);
        console.log(`[CRON] Statistiques par source :`, JSON.stringify(sourcesCount));
        console.log(`[CRON] Statistiques par région :`, JSON.stringify(regionsCount));
      } else {
        console.warn("[CRON] ⚠️ Aucune offre collectée lors de ce cycle, conservation du cache existant.");
      }
    } catch (error) {
      console.error("[CRON] ❌ Erreur critique lors de l'exécution du Cron:", error);
    }
  },
};
