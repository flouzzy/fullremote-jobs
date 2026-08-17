/**
 * FullRemote-Jobs - SEO, Schema.org Google Jobs & RSS Feed Generator
 */

import { stripHtml } from "./scraper.js";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Génère une page HTML dédiée pour une offre avec balises Schema.org JobPosting et OpenGraph
 */
export function renderJobDetailPage(job, meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.edounze.com";
  const canonicalUrl = `${siteUrl}/jobs/${encodeURIComponent(job.id)}`;
  const cleanSnippet = stripHtml(job.description_snippet || "");
  const title = `${job.title} chez ${job.company} (100% Full Remote)`;
  const description = `${job.title} — ${job.company} recrute en 100% télétravail (${job.region}). Contrat : ${job.contractType || "CDI / Full-time"}.${job.salary ? ` Salaire : ${job.salary}.` : ""} Postulez directement sans inscription.`;

  // Construction du JSON-LD pour Google For Jobs
  const validThroughDate = new Date(
    new Date(job.published_at).getTime() + 45 * 24 * 60 * 60 * 1000
  ).toISOString();

  const employmentTypeMap = {
    cdi_fulltime: "FULL_TIME",
    freelance_contract: "CONTRACTOR",
    cdd_parttime: "PART_TIME",
    internship: "INTERN",
  };

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description_snippet || title,
    identifier: {
      "@type": "PropertyValue",
      name: "FullRemoteJobs",
      value: job.id,
    },
    datePosted: job.published_at || new Date().toISOString(),
    validThrough: validThroughDate,
    employmentType: employmentTypeMap[job.contractTypeId] || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      sameAs: job.url,
      ...(job.company_logo ? { logo: job.company_logo } : {}),
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: job.regionId === "france" ? "France" : "Worldwide",
    },
    directApply: true,
  };

  if (job.salary_min_eur && job.salary_min_eur > 0) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary_min_eur,
        maxValue: job.salary_max_eur || job.salary_min_eur,
        unitText: "YEAR",
      },
    };
  }

  const initial = (job.company || "C").charAt(0).toUpperCase();

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- OpenGraph / Social Meta -->
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />

  <!-- Google Jobs Schema.org Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2)}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌍</text></svg>">
  <style>
    :root, html.light {
      --bg: #f8fafc;
      --bg-card: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --text-dim: #94a3b8;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --emerald: #10b981;
      --emerald-bg: rgba(16, 185, 129, 0.1);
      --meta-bg: #f1f5f9;
      --radius: 12px;
      --font-sans: 'Inter', system-ui, sans-serif;
    }
    html.dark {
      --bg: #090d16;
      --bg-card: #111726;
      --border: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --emerald: #10b981;
      --emerald-bg: rgba(16, 185, 129, 0.12);
      --meta-bg: rgba(0, 0, 0, 0.2);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 0;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem; width: 100%; }
    header {
      border-bottom: 1px solid var(--border);
      background: var(--bg-card);
      padding: 1rem 0;
    }
    .header-inner {
      max-width: 860px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .back-btn {
      color: var(--primary);
      font-weight: 600;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .job-sheet {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2.5rem;
      margin-top: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .job-header {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .company-avatar {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
      color: #64748b;
      flex-shrink: 0;
      overflow: hidden;
    }
    .company-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 600;
    }
    .badge-contract { background: rgba(99, 102, 241, 0.15); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.3); }
    .badge-region { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-salary { background: var(--emerald-bg); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-remote { background: rgba(6, 182, 212, 0.15); color: #0891b2; border: 1px solid rgba(6, 182, 212, 0.3); }
    .btn-apply {
      background: var(--primary);
      color: white;
      font-weight: 700;
      padding: 0.85rem 1.75rem;
      border-radius: 8px;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.15s ease;
      cursor: pointer;
    }
    .btn-apply:hover { background: var(--primary-hover); }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      background: var(--meta-bg);
      padding: 1.25rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    .meta-item-label { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .meta-item-val { font-size: 0.95rem; font-weight: 600; color: var(--text); }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="back-btn">← Retour à l'annuaire FullRemote.Jobs</a>
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <a href="/post-a-job" style="font-size:0.85rem; font-weight:600; color:var(--primary);">Publier une offre</a>
        <button id="themeToggleBtn" style="background:var(--bg-card); border:1px solid var(--border); padding:0.35rem 0.65rem; border-radius:6px; cursor:pointer;" title="Changer le thème">🌙</button>
      </div>
    </div>
  </header>

  <main class="container">
    <article class="job-sheet">
      <div class="job-header">
        <div class="company-avatar">
          ${
            job.company_logo
              ? `<img src="${escapeHtml(job.company_logo)}" alt="${escapeHtml(job.company)}" onerror="this.parentElement.innerHTML='${initial}'">`
              : initial
          }
        </div>
        <div>
          <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-muted);">${escapeHtml(job.company)}</div>
          <h1 style="font-size: 1.75rem; font-weight: 800; line-height: 1.25; margin-top: 0.2rem;">${escapeHtml(job.title)}</h1>
        </div>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.75rem;">
        <span class="badge badge-remote">✓ 100% Télétravail Garanti</span>
        <span class="badge badge-contract">${job.contractIcon || "💼"} ${escapeHtml(job.contractType || "CDI / Full-time")}</span>
        <span class="badge badge-region">${job.regionFlag || "🌍"} ${escapeHtml(job.location || job.region)}</span>
        ${job.salary ? `<span class="badge badge-salary">💰 ${escapeHtml(job.salary)}</span>` : ""}
      </div>

      <div class="meta-grid">
        <div>
          <div class="meta-item-label">Catégorie</div>
          <div class="meta-item-val">${job.categoryIcon || "💼"} ${escapeHtml(job.category)}</div>
        </div>
        <div>
          <div class="meta-item-label">Type de contrat</div>
          <div class="meta-item-val">${escapeHtml(job.contractType || "CDI")}</div>
        </div>
        <div>
          <div class="meta-item-label">Zone géographique</div>
          <div class="meta-item-val">${escapeHtml(job.region)}</div>
        </div>
        <div>
          <div class="meta-item-label">Date de parution</div>
          <div class="meta-item-val">${new Date(job.published_at).toLocaleDateString("fr-FR")}</div>
        </div>
      </div>

      <div style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text);">Aperçu du poste</h2>
        <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.7;">
          ${escapeHtml(cleanSnippet || "Aucune description détaillée disponible.")}
        </p>
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
        <a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" class="btn-apply">
          Postuler directement sur l'offre ↗
        </a>
        <button onclick="navigator.clipboard.writeText(window.location.href); alert('Lien copié dans le presse-papiers !');" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); padding: 0.85rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
          🔗 Partager cette offre
        </button>
      </div>
    </article>
  </main>
  <script>
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    let currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);

    function applyTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
      }
      localStorage.setItem('theme', theme);
    }

    if (themeToggleBtn) {
      themeToggleBtn.onclick = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
      };
    }
  </script>
</body>
</html>`;
}

/**
 * Génère le flux RSS 2.0 officiel
 */
export function generateRssFeed(jobs = [], siteUrl = "https://remote-jobs.edounze.com") {
  const itemsXml = jobs
    .slice(0, 60)
    .map((j) => {
      const link = `${siteUrl}/jobs/${encodeURIComponent(j.id)}`;
      const pubDate = new Date(j.published_at).toUTCString();
      const salaryTag = j.salary ? `<p><strong>💰 Rémunération :</strong> ${escapeHtml(j.salary)}</p>` : "";
      return `
    <item>
      <title><![CDATA[${j.title} — ${j.company} (100% Remote)]]></title>
      <link>${link}</link>
      <guid isPermaLink="false">${j.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[
        <p><strong>Entreprise :</strong> ${j.company}</p>
        <p><strong>Région :</strong> ${j.region} (${j.regionFlag || "🌍"})</p>
        <p><strong>Type de contrat :</strong> ${j.contractType || "CDI / Full-time"}</p>
        ${salaryTag}
        <p>${j.description_snippet}</p>
        <p><a href="${j.url}">👉 Postuler directement</a></p>
      ]]></description>
      <category>${j.category}</category>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FullRemote.Jobs — Flux Officiel 100% Télétravail</title>
    <link>${siteUrl}</link>
    <description>Les meilleures opportunités mondiales 100% full remote en français et en anglais.</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;
}

/**
 * Génère le sitemap XML
 */
export function generateSitemap(jobs = [], siteUrl = "https://remote-jobs.edounze.com") {
  const urlsXml = jobs
    .map(
      (j) => `
  <url>
    <loc>${siteUrl}/jobs/${encodeURIComponent(j.id)}</loc>
    <lastmod>${new Date(j.published_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  ${urlsXml}
</urlset>`;
}
