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

function formatInlineMarkdown(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:700; color:var(--text);">$1</strong>')
    .replace(/__(.*?)__/g, '<strong style="font-weight:700; color:var(--text);">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:var(--meta-bg); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-size:0.88em; font-family:monospace;">$1</code>');
}

export function renderMarkdownToHtml(text = "") {
  if (!text) return "";
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = escaped.split("\n");
  const htmlParts = [];
  let inList = false;
  let currentListItems = [];
  let currentParagraphLines = [];

  function flushParagraph() {
    if (currentParagraphLines.length > 0) {
      const pText = currentParagraphLines.join("<br>");
      htmlParts.push(`<p style="margin-bottom:0.75rem; line-height:1.7;">${formatInlineMarkdown(pText)}</p>`);
      currentParagraphLines = [];
    }
  }

  function flushList() {
    if (inList && currentListItems.length > 0) {
      const itemsHtml = currentListItems
        .map(it => `<li style="margin-bottom:0.35rem; line-height:1.6;">${formatInlineMarkdown(it)}</li>`)
        .join("");
      htmlParts.push(`<ul style="margin:0.5rem 0 0.85rem 1.25rem; padding:0; list-style-type:disc;">${itemsHtml}</ul>`);
      currentListItems = [];
      inList = false;
    }
  }

  for (let line of rawLines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (/^#{1,4}\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      if (/^###\s+/.test(trimmed)) {
        htmlParts.push(`<h4 style="font-size:1.05rem; font-weight:800; color:var(--text); margin:1.25rem 0 0.4rem;">${formatInlineMarkdown(trimmed.replace(/^###\s+/, ''))}</h4>`);
      } else if (/^##\s+/.test(trimmed)) {
        htmlParts.push(`<h3 style="font-size:1.15rem; font-weight:800; color:var(--text); margin:1.5rem 0 0.5rem;">${formatInlineMarkdown(trimmed.replace(/^##\s+/, ''))}</h3>`);
      } else if (/^#\s+/.test(trimmed)) {
        htmlParts.push(`<h2 style="font-size:1.25rem; font-weight:800; color:var(--text); margin:1.75rem 0 0.6rem;">${formatInlineMarkdown(trimmed.replace(/^#\s+/, ''))}</h2>`);
      } else {
        htmlParts.push(`<h5 style="font-size:1rem; font-weight:700; color:var(--text); margin:1rem 0 0.3rem;">${formatInlineMarkdown(trimmed.replace(/^#{4,}\s+/, ''))}</h5>`);
      }
      continue;
    }

    if (/^([*•\-+]\s+|\d+\.\s+)/.test(trimmed)) {
      flushParagraph();
      inList = true;
      currentListItems.push(trimmed.replace(/^([*•\-+]\s+|\d+\.\s+)/, ''));
      continue;
    }

    if (inList) {
      flushList();
    }
    currentParagraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return htmlParts.join("");
}

/**
 * Génère une page HTML dédiée pour une offre avec balises Schema.org JobPosting et OpenGraph
 */
export function renderJobDetailPage(job, meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.app";
  const canonicalUrl = `${siteUrl}/jobs/${encodeURIComponent(job.id)}`;
  let cleanSnippet = stripHtml(job.description_snippet || "", true);
  if (!cleanSnippet || cleanSnippet.length < 120 || cleanSnippet.endsWith("...")) {
    const cleanTitle = (job.title || "").replace(/\.\.\.$/, "").trim();
    const company = job.company || "Entreprise";
    const region = job.region || "Worldwide";
    const contract = job.contractType || "CDI";
    const tagsStr = (job.tags && job.tags.length > 0) ? job.tags.join(", ") : "";

    cleanSnippet = `Opportunité 100% télétravail : ${cleanTitle} chez ${company} (${region}).\n\n` +
      `• Type de contrat : ${contract}\n` +
      (tagsStr ? `• Stack & Compétences clés : ${tagsStr}\n` : "") +
      (job.salary ? `• Rémunération indicative : ${job.salary}\n` : "") +
      `\nL'employeur recrute activement sur cette position 100% remote. Pour consulter le cahier des charges complet, les critères d'éligibilité et postuler, accédez directement à l'annonce officielle via le lien ci-dessous.`;
  }
  const title = `${job.title} chez ${job.company} (100% Full Remote)`;
  const description = `${job.title} — ${job.company} recrute en 100% télétravail (${job.region}). Contrat : ${job.contractType || "CDI / Full-time"}.${job.salary ? ` Salaire : ${job.salary}.` : ""} Postulez directement sans inscription.`;

  // Construction du JSON-LD pour Google For Jobs
  const pubTime = job.published_at ? new Date(job.published_at).getTime() : Date.now();
  const validThroughDate = new Date(
    (isNaN(pubTime) ? Date.now() : pubTime) + 45 * 24 * 60 * 60 * 1000
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
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
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
      <a href="/" class="back-btn" data-i18n="back_home">← Retour à l'annuaire FullRemote.Jobs</a>
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <a href="/post-a-job" style="font-size:0.85rem; font-weight:600; color:var(--primary);" data-i18n="post_link">Publier une offre</a>
        <button id="langToggleBtn" onclick="toggleLanguage()" style="background:var(--bg-card); border:1px solid var(--border); padding:0.35rem 0.5rem; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:700; color:var(--text);" title="Changer de langue / Switch Language">🇬🇧 EN</button>
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
        <span class="badge badge-remote" data-i18n="badge_remote">✓ 100% Télétravail Garanti</span>
        <span class="badge badge-contract">${job.contractIcon || "💼"} ${escapeHtml(job.contractType || "CDI / Full-time")}</span>
        <span class="badge badge-region">${job.regionFlag || "🌍"} ${escapeHtml(job.location || job.region)}</span>
        ${job.salary ? `<span class="badge badge-salary">💰 ${escapeHtml(job.salary)}</span>` : ""}
      </div>

      <div class="meta-grid">
        <div>
          <div class="meta-item-label" data-i18n="lbl_category">Catégorie</div>
          <div class="meta-item-val">${job.categoryIcon || "💼"} ${escapeHtml(job.category)}</div>
        </div>
        <div>
          <div class="meta-item-label" data-i18n="lbl_contract">Type de contrat</div>
          <div class="meta-item-val">${escapeHtml(job.contractType || "CDI")}</div>
        </div>
        <div>
          <div class="meta-item-label" data-i18n="lbl_region">Zone géographique</div>
          <div class="meta-item-val">${escapeHtml(job.region)}</div>
        </div>
        <div>
          <div class="meta-item-label" data-i18n="lbl_date">Date de parution</div>
          <div class="meta-item-val">${job.published_at ? new Date(job.published_at).toLocaleDateString("fr-FR") : "Récent"}</div>
        </div>
      </div>

      <!-- Radar de Pouvoir d'Achat & Geo-Arbitrage -->
      ${(() => {
        const salaryStr = (job.salary || "").trim();
        let min = job.salary_min_eur || 0;
        let max = job.salary_max_eur || 0;
        let isUsd = (job.currency === "USD" || salaryStr.includes("$") || /\busd\b/i.test(salaryStr));
        let isDaily = /\b(tjm|jour|day|j)\b/i.test(salaryStr);
        let isHourly = /\b(hour|hr|heure|h)\b/i.test(salaryStr) && !/\b(month|an|mois|year)\b/i.test(salaryStr);

        if (salaryStr) {
          const norm = salaryStr.replace(/(\d+[\d\s,.]*)\s*[kK]\b/g, (_, p1) => {
            return String(parseInt(p1.replace(/[\s,.]/g, ""), 10) * 1000);
          });
          const nums = (norm.match(/\d+[\d\s,.]*/g) || [])
            .map(n => parseInt(n.replace(/[\s,.]/g, ""), 10))
            .filter(n => !isNaN(n) && n > 0);
          if (nums.length > 0) {
            min = nums[0];
            max = nums.length > 1 ? nums[1] : min;
            if (isDaily && min < 3000) { min = min * 218; max = max * 218; }
            else if (isHourly && min < 500) { min = min * 1800; max = max * 1800; }
            else if (min < 200 && /an|year|annual/i.test(salaryStr)) { min = min * 1000; max = max * 1000; }
          }
        }

        const hasSpecifiedSalary = min > 0;
        const baseSalary = hasSpecifiedSalary ? Math.round((min + max) / 2) : 55000;
        let eurGross = baseSalary;
        let usdGross = baseSalary;

        if (isUsd) {
          usdGross = baseSalary;
          eurGross = Math.round(baseSalary / 1.08);
        } else {
          eurGross = baseSalary;
          usdGross = Math.round(baseSalary * 1.08);
        }

        const livingMultiplier = isUsd ? 1.30 : (hasSpecifiedSalary ? 1.15 : 1.0);
        const equivalentPpp = Math.round(eurGross * livingMultiplier);
        const netSalariedMonthly = Math.round((eurGross * 0.77) / 12);
        const tjmEquivalent = Math.round((eurGross / 218) * 1.5);

        return `
        <section class="geo-radar-card" style="background: linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(16,185,129,0.06) 100%); border: 1px solid rgba(37,99,235,0.25); border-radius: 14px; padding: 1.5rem; margin-bottom: 2rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.25rem;">💶</span>
              <h3 style="font-size:1.1rem; font-weight:800; color:var(--text);" data-i18n="radar_title">Estimation Pouvoir d'Achat & Salaire Net</h3>
            </div>
            <a href="/simulateur-salaire-remote" style="font-size:0.8rem; font-weight:700; color:var(--primary); text-decoration:underline;" data-i18n="radar_open_sim">
              Ouvrir le simulateur complet →
            </a>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1rem;">
            <div style="background:var(--bg-card); border:1px solid var(--border); padding:1rem; border-radius:10px;">
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;" data-i18n="radar_base_salary">Rémunération Brute</div>
              <div style="font-size:1.25rem; font-weight:800; color:var(--emerald); margin-top:0.25rem;">
                ${job.salary ? escapeHtml(job.salary) : `~${eurGross.toLocaleString('fr-FR')} € / an`}
              </div>
              <div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.15rem;">
                ${isUsd ? `≈ ${eurGross.toLocaleString('fr-FR')} € (taux de change 1€ = 1.08$)` : `≈ ${usdGross.toLocaleString('en-US')} $ USD`}
              </div>
            </div>

            <div style="background:var(--bg-card); border:1px solid var(--border); padding:1rem; border-radius:10px;">
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;" data-i18n="radar_ppp_equiv">Équivalent Niveau de Vie (France)</div>
              <div style="font-size:1.25rem; font-weight:800; color:var(--primary); margin-top:0.25rem;">
                ≈ ${equivalentPpp.toLocaleString('fr-FR')} € / an
              </div>
              <div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.15rem;" data-i18n="radar_ppp_desc">
                ${isUsd ? "Gain de pouvoir d'achat US/FR (+30%)" : "Gain télétravail vs grandes métropoles (+15%)"}
              </div>
            </div>

            <div style="background:var(--bg-card); border:1px solid var(--border); padding:1rem; border-radius:10px;">
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;" data-i18n="radar_net_est">Net Estimé en France</div>
              <div style="font-size:1.15rem; font-weight:800; color:var(--text); margin-top:0.25rem;">
                ≈ ${netSalariedMonthly.toLocaleString('fr-FR')} € <span style="font-size:0.75rem; font-weight:600; color:var(--text-muted);">/ mois (CDI)</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.15rem;">
                Freelance TJM équivalent : <strong>~${tjmEquivalent} € / jour</strong>
              </div>
            </div>
          </div>

          <div style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">
            💡 <em>En télétravail depuis la France, un contrat à <strong>${isUsd ? '$' + usdGross.toLocaleString('en-US') : eurGross.toLocaleString('fr-FR') + ' €'}</strong> génère un net avant impôt de <strong>~${netSalariedMonthly.toLocaleString('fr-FR')} € / mois</strong> en CDI ou un TJM de <strong>~${tjmEquivalent} € / j</strong> en Freelance.</em>
          </div>
        </section>
        `;
      })()}

      <div style="margin-bottom: 2.25rem;">
        <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; color: var(--text);" data-i18n="overview_title">📝 Description du Poste & Missions</h2>
        <div style="font-size: 0.96rem; color: var(--text); line-height: 1.7; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem;">
          ${renderMarkdownToHtml(cleanSnippet || "Consultez l'offre complète directement sur le site de l'employeur.")}
        </div>
        <div style="margin-top:0.75rem; text-align:right;">
          <a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" style="font-size:0.85rem; font-weight:700; color:var(--primary); text-decoration:underline;" onclick="handleApplyClick('${escapeHtml(job.id)}', '${escapeHtml(job.url)}', event)">
            Consulter l'annonce officielle intégrale chez ${escapeHtml(job.company)} ↗
          </a>
        </div>
      </div>

      <!-- Module 10x : AI Direct-to-Hiring-Manager Pitch Generator -->
      <section class="ai-pitch-box" style="background: var(--bg-card); border: 2px solid var(--primary); border-radius: 14px; padding: 1.75rem; margin-bottom: 2.25rem; box-shadow: 0 8px 24px rgba(37,99,235,0.08);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;">
          <div>
            <div style="display:inline-flex; align-items:center; gap:0.35rem; background:rgba(37,99,235,0.12); color:var(--primary); font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:999px; text-transform:uppercase; letter-spacing:0.05em;">
              ⚡ Avantage Candidat 10x
            </div>
            <h3 style="font-size:1.25rem; font-weight:800; color:var(--text); margin-top:0.35rem;" data-i18n="pitch_title">
              Postulez directement auprès du Décideur (Direct-to-DM)
            </h3>
            <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.2rem;" data-i18n="pitch_subtitle">
              Court-circuitez les robots ATS en envoyant un pitch technique sur-mesure au CTO ou Talent Lead.
            </p>
          </div>

          <a href="https://www.google.com/search?q=site:linkedin.com/in+%22${encodeURIComponent(job.company)}%22+(CTO+OR+%22VP+Engineering%22+OR+%22Head+of+Talent%22+OR+Recruiter+OR+Founder)" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:0.4rem; background:#0a66c2; color:white; font-size:0.83rem; font-weight:700; padding:0.6rem 1rem; border-radius:8px; text-decoration:none;" data-i18n="pitch_find_linkedin">
            🔍 Trouver le CTO sur LinkedIn ↗
          </a>
        </div>

        <div style="display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap;">
          <button id="pitchBtnShort" class="pitch-tab-btn active" onclick="switchPitchMode('short')" style="padding:0.45rem 0.9rem; font-size:0.8rem; font-weight:700; border-radius:6px; border:1px solid var(--border); background:var(--primary); color:white; cursor:pointer;" data-i18n="pitch_tab_short">
            📨 Email Direct (Court & Percutant)
          </button>
          <button id="pitchBtnLinkedin" class="pitch-tab-btn" onclick="switchPitchMode('linkedin')" style="padding:0.45rem 0.9rem; font-size:0.8rem; font-weight:700; border-radius:6px; border:1px solid var(--border); background:var(--bg-card); color:var(--text); cursor:pointer;" data-i18n="pitch_tab_linkedin">
            💼 Message InMail LinkedIn (< 300 car.)
          </button>
          <button id="pitchBtnTech" class="pitch-tab-btn" onclick="switchPitchMode('tech')" style="padding:0.45rem 0.9rem; font-size:0.8rem; font-weight:700; border-radius:6px; border:1px solid var(--border); background:var(--bg-card); color:var(--text); cursor:pointer;" data-i18n="pitch_tab_tech">
            🛠️ Pitch Technique Approfondi
          </button>
        </div>

        <div style="position:relative;">
          <textarea id="pitchTextarea" readonly style="width:100%; min-height:160px; background:var(--meta-bg); border:1px solid var(--border); border-radius:8px; padding:1rem; font-family:var(--font-sans); font-size:0.9rem; color:var(--text); line-height:1.6; resize:vertical;"></textarea>
          <button id="copyPitchBtn" onclick="copyPitchToClipboard()" style="position:absolute; top:10px; right:10px; background:var(--bg-card); border:1px solid var(--border); color:var(--text); padding:0.45rem 0.85rem; border-radius:6px; font-size:0.78rem; font-weight:700; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.05); display:inline-flex; align-items:center; gap:0.35rem;" data-i18n="pitch_copy_btn">
            📋 Copier le pitch
          </button>
        </div>
      </section>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
        <a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" class="btn-apply" data-i18n="btn_apply_direct" onclick="handleApplyClick('${escapeHtml(job.id)}', '${escapeHtml(job.url)}', event)">
          Postuler sur le site officiel ↗
        </a>
        <button id="shareOfferBtn" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); padding: 0.85rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer;" data-i18n="btn_share">
          🔗 Partager cette offre
        </button>
      </div>
    </article>

    <!-- Section Offres Similaires 100% Télétravail -->
    ${(() => {
      const allJobs = meta.allJobs || [];
      const currentTags = new Set((job.tags || []).map((t) => t.toLowerCase()));
      const stopWords = new Set(['and', 'the', 'for', 'with', 'chez', 'pour', 'dans', 'des', 'les', 'une', 'sur', 'des', 'est', 'par']);
      const titleWords = (job.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !stopWords.has(w));

      const similarJobs = allJobs
        .filter((j) => j.id !== job.id)
        .map((j) => {
          let score = 0;
          if (j.categoryId && job.categoryId && j.categoryId === job.categoryId) score += 6;
          if (j.company && job.company && j.company.toLowerCase() === job.company.toLowerCase()) score += 10;
          if (j.contractTypeId && job.contractTypeId && j.contractTypeId === job.contractTypeId) score += 2;
          if (j.regionId && job.regionId && (j.regionId === job.regionId || j.regionId === "worldwide")) score += 1;
          
          for (const t of (j.tags || [])) {
            if (currentTags.has(t.toLowerCase())) score += 3;
          }

          const jTitleLower = (j.title || '').toLowerCase();
          for (const w of titleWords) {
            if (jTitleLower.includes(w)) score += 4;
          }

          return { job: j, score };
        })
        .sort((a, b) => b.score - a.score || new Date(b.job.published_at) - new Date(a.job.published_at))
        .slice(0, 4)
        .map((item) => item.job);

      if (similarJobs.length === 0) return "";

      return `
      <section style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em;" data-i18n="sim_title">
            💼 Offres similaires 100% Télétravail
          </h3>
          <a href="/" style="font-size: 0.88rem; font-weight: 600; color: var(--primary);" data-i18n="sim_see_all">
            Voir tout l'annuaire →
          </a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.25rem;">
          ${similarJobs.map((sj) => {
            const sjDetailsUrl = `${siteUrl}/jobs/${encodeURIComponent(sj.id)}`;
            const sjInitial = (sj.company || "C").charAt(0).toUpperCase();
            const sjAvatar = sj.company_logo
              ? `<img src="${escapeHtml(sj.company_logo)}" alt="${escapeHtml(sj.company)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.textContent='${sjInitial}'" />`
              : sjInitial;
            const salaryBadge = sj.salary
              ? `<span style="font-size:0.75rem; font-weight:700; color:var(--emerald); background:var(--emerald-bg); padding:3px 8px; border-radius:6px; border:1px solid rgba(16,185,129,0.25);">💰 ${escapeHtml(sj.salary)}</span>`
              : "";
            const cleanDesc = stripHtml(sj.description_snippet || "").replace(/\\s+/g, ' ').trim();
            const tagsHtml = (sj.tags || []).slice(0, 3).map(t => `<span style="font-size:0.72rem; color:var(--text-dim); background:var(--meta-bg); border:1px solid var(--border); padding:2px 6px; border-radius:4px;">#${escapeHtml(t)}</span>`).join(' ');

            return `
            <a href="${sjDetailsUrl}" class="similar-job-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 1.35rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.85rem; text-decoration: none; color: inherit; transition: all 0.18s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.03);" onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='var(--border)'; this.style.transform='translateY(0)';">
              <div>
                <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.85rem;">
                  <div style="width: 42px; height: 42px; border-radius: 10px; background: var(--meta-bg); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--primary); flex-shrink: 0; overflow: hidden;">
                    ${sjAvatar}
                  </div>
                  <div style="min-width: 0;">
                    <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(sj.company)}</div>
                    <div style="font-size: 1rem; font-weight: 700; color: var(--text); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(sj.title)}</div>
                  </div>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.85rem;">
                  <span style="font-size: 0.75rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: rgba(99,102,241,0.1); color: #6366f1;">${sj.contractIcon || "💼"} ${escapeHtml(sj.contractType || "CDI")}</span>
                  <span style="font-size: 0.75rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: rgba(37,99,235,0.1); color: #2563eb;">${sj.regionFlag || "🌍"} ${escapeHtml(sj.region || "Worldwide")}</span>
                  ${salaryBadge}
                </div>

                ${cleanDesc ? `<p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 0.5rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(cleanDesc)}</p>` : ""}
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.25rem;">
                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">${tagsHtml}</div>
                <span style="font-size: 0.83rem; font-weight: 700; color: var(--primary); display: inline-flex; align-items: center; gap: 0.25rem; white-space: nowrap;" data-i18n="sim_view_btn">
                  Consulter ↗
                </span>
              </div>
            </a>
            `;
          }).join("")}
        </div>
      </section>
      `;
    })()}

    <!-- Modal Feedback Post-Candidature ("Avez-vous postulé ?") -->
    <div id="postApplyModal" class="modal-backdrop" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); display:none; align-items:center; justify-content:center; z-index:9999; backdrop-filter:blur(4px);">
      <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:14px; max-width:440px; width:90%; padding:1.75rem; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.25);">
        <div style="font-size:2.25rem; margin-bottom:0.5rem;">🚀</div>
        <h3 id="postApplyTitle" style="font-size:1.2rem; font-weight:800; color:var(--text); margin-bottom:0.35rem;">
          Avez-vous postulé chez ${escapeHtml(job.company)} ?
        </h3>
        <p id="postApplySubtitle" style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin-bottom:1.25rem;">
          Enregistrez cette candidature pour la retrouver dans votre espace et améliorer vos suggestions quotidiennes.
        </p>

        <div style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1rem;">
          <button onclick="submitPostApplyFeedback('applied')" style="background:var(--primary); color:white; border:none; padding:0.75rem; border-radius:8px; font-weight:700; font-size:0.92rem; cursor:pointer; width:100%;">
            ✅ Oui, j'ai postulé !
          </button>
          <button onclick="submitPostApplyFeedback('viewing')" style="background:var(--meta-bg); border:1px solid var(--border); color:var(--text); padding:0.65rem; border-radius:8px; font-weight:600; font-size:0.85rem; cursor:pointer; width:100%;">
            👀 Pas encore, je consulte
          </button>
        </div>

        <div id="postApplyGuestBox" style="display:none; background:var(--meta-bg); border:1px solid var(--border); border-radius:8px; padding:0.75rem; margin-bottom:1rem; text-align:left;">
          <label style="font-size:0.72rem; font-weight:700; color:var(--text); display:block; margin-bottom:0.25rem;">
            💡 Associer à mon profil Talent (Email) :
          </label>
          <input type="email" id="postApplyGuestEmail" placeholder="votre@email.com" style="width:100%; padding:0.4rem 0.6rem; font-size:0.82rem; background:var(--bg-card); border:1px solid var(--border); border-radius:6px; color:var(--text);" />
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.75rem; border-top:1px solid var(--border); font-size:0.75rem;">
          <button onclick="reportDeadLinkModal()" style="background:none; border:none; color:var(--text-dim); text-decoration:underline; cursor:pointer;">
            ⚠️ Signaler offre expirée
          </button>
          <button onclick="closePostApplyModal()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-weight:600;">
            Fermer ✕
          </button>
        </div>
      </div>
    </div>
  </main>
  <script>
    const JOB_CURRENT = ${JSON.stringify({
      id: job.id,
      title: job.title,
      company: job.company,
      tags: job.tags || [],
      salary: job.salary || "",
      salary_min_eur: job.salary_min_eur || 0,
      currency: job.currency || "EUR",
      url: job.url
    })};

    const I18N_SEO = {
      fr: {
        back_home: "← Retour à l'annuaire FullRemote.Jobs",
        post_link: "Publier une offre",
        badge_remote: "✓ 100% Télétravail Garanti",
        lbl_category: "Catégorie",
        lbl_contract: "Type de contrat",
        lbl_region: "Zone géographique",
        lbl_date: "Date de parution",
        overview_title: "📝 Description du Poste & Missions",
        btn_apply_direct: "Postuler sur le site officiel ↗",
        btn_share: "🔗 Partager cette offre",
        sim_title: "💼 Offres similaires 100% Télétravail",
        sim_see_all: "Voir tout l'annuaire →",
        sim_view_btn: "Consulter ↗",
        toast_copied: "Lien copié dans le presse-papiers ! 🔗",
        radar_title: "Estimation Pouvoir d'Achat & Salaire Net",
        radar_open_sim: "Ouvrir le simulateur complet →",
        radar_base_salary: "Rémunération Brute",
        radar_ppp_equiv: "Équivalent Niveau de Vie (France)",
        radar_ppp_desc: "Pouvoir d'achat réel ajusté au coût de la vie",
        radar_net_est: "Net Estimé en France",
        pitch_title: "Postulez directement auprès du Décideur (Direct-to-DM)",
        pitch_subtitle: "Court-circuitez les robots ATS en envoyant un pitch technique sur-mesure au CTO ou Talent Lead.",
        pitch_find_linkedin: "🔍 Trouver le CTO sur LinkedIn ↗",
        pitch_tab_short: "📨 Email Direct (Court)",
        pitch_tab_linkedin: "💼 InMail LinkedIn",
        pitch_tab_tech: "🛠️ Pitch Technique Approfondi",
        pitch_copy_btn: "📋 Copier le pitch",
        toast_pitch_copied: "Pitch copié dans le presse-papiers ! Prêt à être envoyé 🚀"
      },
      en: {
        back_home: "← Back to FullRemote.Jobs Directory",
        post_link: "Post a Job",
        badge_remote: "✓ 100% Remote Guaranteed",
        lbl_category: "Category",
        lbl_contract: "Contract Type",
        lbl_region: "Location",
        lbl_date: "Published Date",
        overview_title: "📝 Job Overview & Responsibilities",
        btn_apply_direct: "Apply directly on official site ↗",
        btn_share: "🔗 Share this Job",
        sim_title: "💼 Similar 100% Remote Jobs",
        sim_see_all: "View all remote jobs →",
        sim_view_btn: "View Details ↗",
        toast_copied: "Link copied to clipboard! 🔗",
        radar_title: "Purchasing Power & Net Salary Estimator",
        radar_open_sim: "Open full salary simulator →",
        radar_base_salary: "Gross Compensation",
        radar_ppp_equiv: "Living Standard Equiv. (France)",
        radar_ppp_desc: "Real purchasing power adjusted to cost of living",
        radar_net_est: "Estimated Net in France",
        pitch_title: "Apply directly to the Decision Maker (Direct-to-DM)",
        pitch_subtitle: "Bypass ATS screening bots with a high-impact technical pitch sent directly to the CTO or Talent Lead.",
        pitch_find_linkedin: "🔍 Find CTO on LinkedIn ↗",
        pitch_tab_short: "📨 Direct Email (Short)",
        pitch_tab_linkedin: "💼 LinkedIn InMail",
        pitch_tab_tech: "🛠️ In-Depth Technical Pitch",
        pitch_copy_btn: "📋 Copy pitch",
        toast_pitch_copied: "Pitch copied to clipboard! Ready to send 🚀"
      }
    };

    let currentLang = 'fr';
    let currentPitchMode = 'short';

    try {
      const savedLang = localStorage.getItem('lang');
      if (savedLang === 'fr' || savedLang === 'en') {
        currentLang = savedLang;
      } else {
        const bLang = (navigator.language || '').toLowerCase();
        currentLang = bLang.startsWith('fr') ? 'fr' : 'en';
      }
    } catch(e) { currentLang = 'fr'; }

    function getPitchContent(mode, lang) {
      const comp = JOB_CURRENT.company || 'l\\'équipe';
      const title = JOB_CURRENT.title || 'ce poste';
      const tags = (JOB_CURRENT.tags || []).filter(t => !['Remote', 'Worldwide', 'Full-time', 'CDI'].includes(t));
      const stack = tags.slice(0, 3).join(', ') || 'votre stack technique';

      if (lang === 'fr') {
        if (mode === 'short') {
          return [
            'Bonjour,',
            '',
            'J\\'ai vu que ' + comp + ' recherche un(e) ' + title + ' en 100% télétravail.',
            'Fort d\\'une solide expertise sur ' + stack + ', j\\'ai conçu des systèmes scalables et délivré des fonctionnalités critiques en totale autonomie à distance.',
            '',
            'Seriez-vous ouvert(e) à un bref échange informel de 10 minutes cette semaine pour faire connaissance ?',
            '',
            'Bien à vous,',
            '[Votre Prénom] [Votre Nom] — [Lien Portfolio / GitHub]'
          ].join(String.fromCharCode(10));
        } else if (mode === 'linkedin') {
          return [
            'Bonjour ! J\\'ai repéré votre ouverture pour le poste de ' + title + ' chez ' + comp + '.',
            'Expert(e) sur ' + stack + ' et habitué(e) au full remote, j\\'aimerais échanger 5 min sur vos enjeux techniques du moment. Disponible cette semaine si vous avez un créneau !',
            '[Lien GitHub / Profil]'
          ].join(String.fromCharCode(10));
        } else {
          return [
            'Bonjour,',
            '',
            'Je vous contacte concernant l\\'opportunité de ' + title + ' au sein de ' + comp + '.',
            'Au cours de mes précédents projets, j\\'ai approfondi ' + stack + ' en production avec des contraintes élevées de performance, de testabilité et d\\'architecture clean.',
            '',
            'Ce que je peux apporter immédiatement :',
            '1. Maîtrise éprouvée des bonnes pratiques ' + stack + '.',
            '2. Rigueur de communication asynchrone et autonomie totale en remote.',
            '3. Capacité à itérer vite et fiabiliser les déploiements.',
            '',
            'Quel serait le meilleur moment pour une courte discussion de cadrage ?',
            '',
            'Cordialement,',
            '[Votre Prénom] [Votre Nom]',
            '[Lien Portfolio / LinkedIn / GitHub]'
          ].join(String.fromCharCode(10));
        }
      } else {
        if (mode === 'short') {
          return [
            'Hi,',
            '',
            'I noticed that ' + comp + ' is looking for a ' + title + ' (100% Remote).',
            'With proven expertise in ' + stack + ', I have architected resilient systems and shipped mission-critical features in fully distributed async environments.',
            '',
            'Would you be open for a quick 10-minute intro chat this week to see if my background matches your current priorities?',
            '',
            'Best regards,',
            '[Your Name] — [GitHub / Portfolio / LinkedIn URL]'
          ].join(String.fromCharCode(10));
        } else if (mode === 'linkedin') {
          return [
            'Hi! I saw ' + comp + ' is hiring a ' + title + '.',
            'With strong expertise in ' + stack + ' and extensive remote experience, I\\'d love to connect and briefly chat about your engineering roadmap.',
            '[Your Portfolio / GitHub URL]'
          ].join(String.fromCharCode(10));
        } else {
          return [
            'Hi,',
            '',
            'I am reaching out regarding the ' + title + ' role at ' + comp + '.',
            'Throughout my career, I\\'ve focused on ' + stack + ' in production, delivering scalable backends and reliable user-facing features under strict performance benchmarks.',
            '',
            'Key value I can bring from Day 1:',
            '1. Battle-tested hands-on experience in ' + stack + '.',
            '2. Autonomous, proactive async communication in remote-first cultures.',
            '3. Fast execution and strong engineering hygiene (CI/CD, automated testing).',
            '',
            'Let me know if you have 10 minutes available for a brief conversation this week.',
            '',
            'Best regards,',
            '[Your Name]',
            '[GitHub / Portfolio URL]'
          ].join(String.fromCharCode(10));
        }
      }
    }

    window.switchPitchMode = function(mode) {
      currentPitchMode = mode;
      document.querySelectorAll('.pitch-tab-btn').forEach(b => {
        b.style.background = 'var(--bg-card)';
        b.style.color = 'var(--text)';
      });
      const activeBtnId = mode === 'short' ? 'pitchBtnShort' : (mode === 'linkedin' ? 'pitchBtnLinkedin' : 'pitchBtnTech');
      const activeBtn = document.getElementById(activeBtnId);
      if (activeBtn) {
        activeBtn.style.background = 'var(--primary)';
        activeBtn.style.color = 'white';
      }
      updatePitchDisplay();
    };

    function updatePitchDisplay() {
      const textarea = document.getElementById('pitchTextarea');
      if (textarea) {
        textarea.value = getPitchContent(currentPitchMode, currentLang);
      }
    }

    window.copyPitchToClipboard = function() {
      const textarea = document.getElementById('pitchTextarea');
      if (!textarea) return;
      navigator.clipboard.writeText(textarea.value).then(() => {
        const dict = I18N_SEO[currentLang] || I18N_SEO.fr;
        const copyBtn = document.getElementById('copyPitchBtn');
        if (copyBtn) {
          copyBtn.textContent = '✅ ' + (currentLang === 'fr' ? 'Copié !' : 'Copied!');
          setTimeout(() => {
            copyBtn.textContent = '📋 ' + (currentLang === 'fr' ? 'Copier le pitch' : 'Copy pitch');
          }, 2500);
        }
        alert(dict.toast_pitch_copied);
      });
    };

    function applyLanguage(lang) {
      currentLang = lang === 'en' ? 'en' : 'fr';
      localStorage.setItem('lang', currentLang);
      document.documentElement.lang = currentLang;

      const dict = I18N_SEO[currentLang] || I18N_SEO.fr;
      const langBtn = document.getElementById('langToggleBtn');
      if (langBtn) langBtn.textContent = currentLang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR';

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
      });

      updatePitchDisplay();
    }

    window.toggleLanguage = function() {
      applyLanguage(currentLang === 'fr' ? 'en' : 'fr');
    };

    applyLanguage(currentLang);
    updatePitchDisplay();

    const shareBtn = document.getElementById('shareOfferBtn');
    if (shareBtn) {
      shareBtn.onclick = () => {
        const dict = I18N_SEO[currentLang] || I18N_SEO.fr;
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert(dict.toast_copied);
        });
      };
    }

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

    // Tracking Clics Sortants & Modale Post-Candidature
    let currentTrackingClick = null;

    window.handleApplyClick = function(jobId, targetUrl, event) {
      if (event) {
        event.preventDefault();
      }

      const talentToken = localStorage.getItem('fullremote_talent_token') || '';
      const destUrl = targetUrl || JOB_CURRENT.url || window.location.href;

      // 1. Ouvrir instantanément l'offre dans un nouvel onglet
      window.open(destUrl, '_blank', 'noopener,noreferrer');

      // 2. Journaliser le clic en arrière-plan
      currentTrackingClick = {
        jobId: jobId,
        jobTitle: JOB_CURRENT.title || '',
        company: JOB_CURRENT.company || '',
        destUrl: destUrl,
        clickId: null
      };

      try {
        fetch('/api/track/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: jobId,
            jobTitle: JOB_CURRENT.title,
            company: JOB_CURRENT.company,
            userType: talentToken ? 'talent' : 'guest',
            userId: talentToken || null,
            referrer: document.referrer || window.location.href,
            tags: JOB_CURRENT.tags || []
          }),
          keepalive: true
        })
        .then(r => r.json())
        .then(data => {
          if (data && data.clickId && currentTrackingClick) {
            currentTrackingClick.clickId = data.clickId;
          }
        })
        .catch(() => {});
      } catch (e) {}

      // 3. Ouvrir la modale d'engagement
      setTimeout(() => {
        openPostApplyModal();
      }, 350);
    };

    function openPostApplyModal() {
      const modal = document.getElementById('postApplyModal');
      if (!modal) return;

      const tToken = localStorage.getItem('fullremote_talent_token');
      const guestBox = document.getElementById('postApplyGuestBox');
      if (guestBox) {
        guestBox.style.display = tToken ? 'none' : 'block';
      }

      modal.style.display = 'flex';
    }

    window.closePostApplyModal = function() {
      const modal = document.getElementById('postApplyModal');
      if (modal) modal.style.display = 'none';
    };

    window.submitPostApplyFeedback = function(status) {
      if (!currentTrackingClick) {
        closePostApplyModal();
        return;
      }

      const talentToken = localStorage.getItem('fullremote_talent_token') || '';
      const emailInput = document.getElementById('postApplyGuestEmail');
      const guestEmail = (emailInput ? emailInput.value : '').trim();

      if (status === 'applied') {
        try {
          const localApps = JSON.parse(localStorage.getItem('my_remote_applications') || '[]');
          const exists = localApps.some(a => a.jobId === currentTrackingClick.jobId);
          if (!exists) {
            localApps.unshift({
              jobId: currentTrackingClick.jobId,
              title: currentTrackingClick.jobTitle,
              company: currentTrackingClick.company,
              url: currentTrackingClick.destUrl,
              appliedAt: new Date().toISOString(),
              status: 'applied'
            });
            localStorage.setItem('my_remote_applications', JSON.stringify(localApps));
          }
        } catch (e) {}
      }

      fetch('/api/track/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clickId: currentTrackingClick.clickId,
          jobId: currentTrackingClick.jobId,
          feedback: status,
          talentToken: talentToken || null,
          userEmail: guestEmail || null
        })
      })
      .then(r => r.json())
      .then(res => {
        if (status === 'applied') {
          if (res && (res.savedToTalent || talentToken)) {
            alert(currentLang === 'fr' ? 'Candidature enregistrée dans votre espace Talent ! 📂' : 'Application saved to your Talent profile! 📂');
          } else {
            alert(currentLang === 'fr' ? 'Candidature enregistrée dans vos candidatures suivies ! 🚀' : 'Application recorded in your tracker! 🚀');
          }
        } else if (status === 'viewing') {
          alert(currentLang === 'fr' ? 'Offre marquée comme consultée 👀' : 'Job marked as viewed 👀');
        }
      })
      .catch(() => {})
      .finally(() => {
        closePostApplyModal();
      });
    };

    window.reportDeadLinkModal = function() {
      if (!currentTrackingClick) return;
      const jId = currentTrackingClick.jobId;
      fetch('/api/track/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: jId, reason: 'expired' })
      })
      .then(() => {
        alert(currentLang === 'fr' ? 'Merci ! Notre équipe a été notifiée pour vérifier cette offre.' : 'Thank you! Our team has been notified.');
        closePostApplyModal();
      });
    };

    const postApplyModalEl = document.getElementById('postApplyModal');
    if (postApplyModalEl) {
      postApplyModalEl.onclick = (e) => {
        if (e.target === postApplyModalEl) closePostApplyModal();
      };
    }
  </script>
</body>
</html>`;
}

/**
 * Dictionnaire des pages programmatiques ciblées pour le SEO (Stacks TIOBE & Régions)
 */
export const PROGRAMMATIC_PAGES = {
  "remote-laravel-jobs": {
    slug: "remote-laravel-jobs",
    tech: "Laravel",
    icon: "🔴",
    title_fr: "Offres d'Emploi 100% Télétravail Laravel (CDI & Freelance)",
    title_en: "100% Remote Laravel Jobs (Full-Time & Contract)",
    desc_fr: "Trouvez les meilleures opportunités 100% télétravail Laravel, PHP, Livewire et Vue.js. Postulez directement sans intermédiaire.",
    desc_en: "Find verified 100% remote Laravel developer jobs, PHP, Livewire and Vue. Direct apply with no recruiter middlemen.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("laravel") || (j.tags || []).includes("Laravel");
    },
  },
  "remote-symfony-jobs": {
    slug: "remote-symfony-jobs",
    tech: "Symfony",
    icon: "🎼",
    title_fr: "Offres d'Emploi 100% Télétravail Symfony (CDI & Freelance)",
    title_en: "100% Remote Symfony Developer Jobs",
    desc_fr: "Découvrez les postes en pur télétravail Symfony, PHP, Doctrine et API Platform. Salaires transparents et contact direct.",
    desc_en: "Explore verified remote Symfony engineering positions, PHP, Doctrine and API Platform. Transparent salaries and direct apply.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("symfony") || (j.tags || []).includes("Symfony");
    },
  },
  "remote-php-jobs": {
    slug: "remote-php-jobs",
    tech: "PHP",
    icon: "🐘",
    title_fr: "Offres d'Emploi 100% Télétravail PHP (Laravel, Symfony, WordPress)",
    title_en: "100% Remote PHP Developer Jobs",
    desc_fr: "Toutes les offres full remote pour développeurs PHP, architectures modernes, Laravel, Symfony, WordPress et APIs.",
    desc_en: "All 100% remote job opportunities for PHP engineers, modern architectures, Laravel, Symfony and high-scale APIs.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("php") || (j.tags || []).includes("PHP") || text.includes("laravel") || text.includes("symfony");
    },
  },
  "remote-python-jobs": {
    slug: "remote-python-jobs",
    tech: "Python & IA",
    icon: "🐍",
    title_fr: "Offres d'Emploi 100% Télétravail Python, IA & Data",
    title_en: "100% Remote Python, AI & Data Engineering Jobs",
    desc_fr: "Postes en pur télétravail Python, Django, FastAPI, Machine Learning, LLM et Data Science. Contact direct avec les recruteurs.",
    desc_en: "Remote Python developer, Django, FastAPI, Machine Learning, LLMs and Data Engineering roles worldwide.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("python") || (j.tags || []).includes("Python") || text.includes("django") || text.includes("fastapi") || text.includes("ai");
    },
  },
  "remote-react-jobs": {
    slug: "remote-react-jobs",
    tech: "React & TypeScript",
    icon: "⚛️",
    title_fr: "Offres d'Emploi 100% Télétravail React, Next.js & TypeScript",
    title_en: "100% Remote React & TypeScript Jobs",
    desc_fr: "Opportunités full remote pour ingénieurs Frontend et Fullstack React, Next.js, TypeScript et Node.js.",
    desc_en: "Verified 100% remote jobs for React, Next.js, TypeScript and Frontend/Fullstack developers.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("react") || (j.tags || []).includes("React") || text.includes("typescript") || text.includes("next.js");
    },
  },
  "remote-rust-jobs": {
    slug: "remote-rust-jobs",
    tech: "Rust",
    icon: "🦀",
    title_fr: "Offres d'Emploi 100% Télétravail Rust & Systèmes",
    title_en: "100% Remote Rust Developer Jobs",
    desc_fr: "Postes en télétravail pour développeurs Rust, architectures distribuées, backend haute performance, Tokio et Web3.",
    desc_en: "Remote Rust engineering roles, high performance systems, distributed backends, Tokio and Web3.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("rust") || (j.tags || []).includes("Rust");
    },
  },
  "remote-golang-jobs": {
    slug: "remote-golang-jobs",
    tech: "Go / Golang",
    icon: "🐹",
    title_fr: "Offres d'Emploi 100% Télétravail Go / Golang",
    title_en: "100% Remote Go (Golang) Developer Jobs",
    desc_fr: "Opportunités 100% télétravail Go / Golang pour ingénieurs backend, microservices, cloud et infrastructure.",
    desc_en: "Explore 100% remote Go (Golang) engineering roles, cloud native, distributed systems and microservices.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("go") || (j.tags || []).includes("Go") || text.includes("golang");
    },
  },
  "remote-java-jobs": {
    slug: "remote-java-jobs",
    tech: "Java & JVM",
    icon: "☕",
    title_fr: "Offres d'Emploi 100% Télétravail Java & Spring Boot",
    title_en: "100% Remote Java Developer Jobs",
    desc_fr: "Offres full remote pour développeurs Java, Spring Boot, Kotlin, Quarkus et architectures d'entreprise.",
    desc_en: "Verified 100% remote Java, Spring Boot, Kotlin and JVM engineering opportunities worldwide.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("java") || (j.tags || []).includes("Java") || text.includes("spring") || text.includes("kotlin");
    },
  },
  "remote-csharp-jobs": {
    slug: "remote-csharp-jobs",
    tech: "C# & .NET",
    icon: "🎯",
    title_fr: "Offres d'Emploi 100% Télétravail C# & .NET Core",
    title_en: "100% Remote C# & .NET Jobs",
    desc_fr: "Postes en pur télétravail pour développeurs C#, .NET Core, Azure et applications d'entreprise modernes.",
    desc_en: "Remote C#, .NET Core, Azure and modern enterprise software engineering positions.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("c#") || (j.tags || []).includes("C#") || text.includes(".net") || text.includes("dotnet");
    },
  },
  "remote-ruby-jobs": {
    slug: "remote-ruby-jobs",
    tech: "Ruby & Rails",
    icon: "💎",
    title_fr: "Offres d'Emploi 100% Télétravail Ruby on Rails",
    title_en: "100% Remote Ruby on Rails Jobs",
    desc_fr: "Les meilleures offres en 100% remote pour développeurs Ruby, Rails, Hotwire et architectures SaaS.",
    desc_en: "Verified remote Ruby on Rails opportunities, Hotwire, SaaS architectures and full-stack positions.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("ruby") || (j.tags || []).includes("Ruby") || text.includes("rails");
    },
  },
  "remote-devops-jobs": {
    slug: "remote-devops-jobs",
    tech: "DevOps & Cloud",
    icon: "☁️",
    title_fr: "Offres d'Emploi 100% Télétravail DevOps, Kubernetes & Cloud",
    title_en: "100% Remote DevOps & Cloud Infrastructure Jobs",
    desc_fr: "Postes en télétravail pour ingénieurs DevOps, SRE, Kubernetes, Docker, AWS, GCP, Azure et Terraform.",
    desc_en: "Remote DevOps, SRE, Kubernetes, Docker, AWS, GCP and Terraform infrastructure opportunities.",
    filterFn: (j) => {
      const text = `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase();
      return text.includes("devops") || (j.tags || []).includes("DevOps") || text.includes("kubernetes") || text.includes("aws") || text.includes("terraform");
    },
  },
  "remote-jobs-france": {
    slug: "remote-jobs-france",
    tech: "France & Francophonie",
    icon: "🇫🇷",
    title_fr: "Offres d'Emploi 100% Télétravail Éligibles France & Francophonie",
    title_en: "100% Remote Jobs Eligible for France & Francophonie",
    desc_fr: "Répertoire vérifié des postes en 100% télétravail (CDI et Freelance) ouverts aux résidents en France et en Europe.",
    desc_en: "Verified 100% remote jobs (Full-time & Contract) available for candidates in France and French-speaking regions.",
    filterFn: (j) => {
      const region = (j.regionId || "").toLowerCase();
      return region === "france" || region === "europe" || region === "worldwide" || j.language === "fr";
    },
  },
  "remote-jobs-europe": {
    slug: "remote-jobs-europe",
    tech: "Europe (UTC±2)",
    icon: "🇪🇺",
    title_fr: "Offres d'Emploi 100% Télétravail Europe (Fuseau Horaire UTC±2)",
    title_en: "100% Remote Jobs in Europe (Timezone UTC±2)",
    desc_fr: "Postes en pur télétravail compatibles avec les fuseaux horaires européens. Entreprises européennes et internationales.",
    desc_en: "100% remote positions matching European timezones (UTC-1 to UTC+3). Direct apply without middlemen.",
    filterFn: (j) => {
      const region = (j.regionId || "").toLowerCase();
      return region === "europe" || region === "france" || region === "worldwide";
    },
  },
  "remote-jobs-worldwide": {
    slug: "remote-jobs-worldwide",
    tech: "Worldwide (Anywhere)",
    icon: "🌍",
    title_fr: "Offres d'Emploi 100% Télétravail Sans Restriction Géographique (Worldwide)",
    title_en: "100% Remote Jobs Worldwide (Work from Anywhere)",
    desc_fr: "Les meilleures opportunités mondiales 100% remote ouvertes à tous les pays sans restriction de localisation.",
    desc_en: "Global 100% remote opportunities hiring anywhere in the world. Work from anywhere with transparent compensation.",
    filterFn: (j) => {
      return (j.regionId || "").toLowerCase() === "worldwide" || (j.location || "").toLowerCase().includes("worldwide");
    },
  },
  "remote-intern-jobs": {
    slug: "remote-intern-jobs",
    tech: "Stages & Internships",
    icon: "🎓",
    title_fr: "Stages 100% Télétravail (Remote Internships Tech, Dév & Data)",
    title_en: "100% Remote Internships & Student Jobs",
    desc_fr: "Trouvez votre stage en 100% télétravail dans les meilleures startups et scale-ups tech. Postulez directement sans filtre d'adresse postale.",
    desc_en: "Discover verified 100% remote tech internships, software development, data and design positions. Work and learn from home.",
    filterFn: (j) => {
      const text = `${j.title} ${j.contractType || ""} ${j.description_snippet || ""}`.toLowerCase();
      return j.contractTypeId === "internship" || /\b(intern|internship|stage|stagiaire|trainee)\b/i.test(text);
    },
  },
  "remote-stage-jobs": {
    slug: "remote-stage-jobs",
    tech: "Stages 100% Télétravail",
    icon: "🎓",
    title_fr: "Offres de Stage 100% Télétravail en France & International",
    title_en: "Remote Internship Positions in France & Worldwide",
    desc_fr: "Toutes les offres de stage en pur télétravail (Dév, DevOps, Web, Marketing, IA). Démarrez votre carrière sans contrainte géographique.",
    desc_en: "All 100% work-from-home internship offers for students and juniors in tech, development and design.",
    filterFn: (j) => {
      const text = `${j.title} ${j.contractType || ""} ${j.description_snippet || ""}`.toLowerCase();
      return j.contractTypeId === "internship" || /\b(stage|stagiaire|intern|internship)\b/i.test(text);
    },
  },
  "remote-alternance-jobs": {
    slug: "remote-alternance-jobs",
    tech: "Alternance & Apprentissage",
    icon: "📚",
    title_fr: "Alternances & Apprentissage 100% Télétravail (Tech, Dév, Web)",
    title_en: "Remote Apprenticeships & Work-Study Jobs",
    desc_fr: "Les offres d'alternance et contrats d'apprentissage en télétravail intégral. Entreprises bienveillantes avec encadrement à distance.",
    desc_en: "Find remote apprenticeships and work-study contracts in software engineering, cloud, and product management.",
    filterFn: (j) => {
      const text = `${j.title} ${j.contractType || ""} ${j.description_snippet || ""}`.toLowerCase();
      return /\b(alternan|apprentissage|apprentice|work-study|contrat pro)\b/i.test(text) || (j.contractTypeId === "internship" && text.includes("altern"));
    },
  },
  "remote-senior-jobs": {
    slug: "remote-senior-jobs",
    tech: "Seniors, Staff & Lead",
    icon: "👑",
    title_fr: "Postes Senior, Staff Engineer, Principal & Lead 100% Télétravail",
    title_en: "Senior, Staff & Lead Remote Engineering Jobs",
    desc_fr: "Les meilleures opportunités full remote pour développeurs seniors, architectes, Staff Engineers et Tech Leads. Valorisez votre expertise et votre autonomie.",
    desc_en: "High-impact remote leadership and senior engineering roles (Staff, Principal, Lead Architect, CTO). Transparent high salaries.",
    filterFn: (j) => {
      const text = `${j.title} ${j.description_snippet || ""}`.toLowerCase();
      return /\b(senior|staff|principal|lead|architect|architecte|head of|director|vp|directeur|50\+)\b/i.test(text);
    },
  },
  "remote-fractional-jobs": {
    slug: "remote-fractional-jobs",
    tech: "Fractional CTO & Temps Partagé",
    icon: "⚡",
    title_fr: "Missions Fractional CTO, Expert Partagé & Advisory 100% Télétravail",
    title_en: "Fractional CTO & Part-Time Executive Remote Jobs",
    desc_fr: "Opportunités de direction technique à temps partagé (Fractional CTO, VP Eng), advisory et mentorat pour profils très expérimentés.",
    desc_en: "Fractional CTO, part-time leadership, and high-level advisory remote roles for experienced veterans and executives.",
    filterFn: (j) => {
      const text = `${j.title} ${j.description_snippet || ""}`.toLowerCase();
      return /\b(fractional|partagé|partage|advisory|advisor|temps partiel|part-time|interim cto)\b/i.test(text);
    },
  },
  "remote-freelance-jobs": {
    slug: "remote-freelance-jobs",
    tech: "Freelance & Missions TJM",
    icon: "⚡",
    title_fr: "Missions Freelance 100% Télétravail & TJM Élevés",
    title_en: "100% Remote Freelance & Contract Tech Jobs",
    desc_fr: "Trouvez vos prochaines missions freelance en pur télétravail. TJM transparents, contrats directs avec les clients.",
    desc_en: "Discover high-paying freelance and contractor tech missions with 100% remote flexibility and direct client contact.",
    filterFn: (j) => {
      const text = `${j.title} ${j.contractType || ""} ${j.description_snippet || ""}`.toLowerCase();
      return j.contractTypeId === "freelance_contract" || /\b(freelance|contract|tjm|mission|indépendant|independant|contractor)\b/i.test(text);
    },
  },
  "remote-ai-jobs": {
    slug: "remote-ai-jobs",
    tech: "IA, Machine Learning & LLM",
    icon: "🤖",
    title_fr: "Offres d'Emploi 100% Télétravail IA, LLM & Machine Learning",
    title_en: "100% Remote AI, LLM & Machine Learning Engineering Jobs",
    desc_fr: "Postes en télétravail IA générative, ingénierie LLM, RAG, PyTorch, LangChain et architectures d'agents autonomes.",
    desc_en: "Explore remote AI engineer, GenAI, LLMs, RAG pipelines, PyTorch, Machine Learning and autonomous agents opportunities.",
    filterFn: (j) => {
      const text = `${j.title} ${(j.tags || []).join(" ")} ${j.description_snippet || ""}`.toLowerCase();
      return /\b(ai\b|ia\b|machine learning|llm|deep learning|genai|gpt|rag|langchain|pytorch|tensorflow|computer vision|nlp)\b/i.test(text);
    },
  },
  "remote-part-time-jobs": {
    slug: "remote-part-time-jobs",
    tech: "Temps Partiel & Semaine 4 Jours",
    icon: "⏱️",
    title_fr: "Offres 100% Télétravail à Temps Partiel & Semaine de 4 Jours",
    title_en: "Remote Part-Time & 4-Day Workweek Jobs",
    desc_fr: "Conciliez vie personnelle et carrière avec des postes 100% télétravail à temps partiel (28h-32h) ou semaine de 4 jours.",
    desc_en: "Work-life balance focused remote jobs: part-time, 4-day workweek, 32h/week flexible arrangements.",
    filterFn: (j) => {
      const text = `${j.title} ${j.contractType || ""} ${j.description_snippet || ""}`.toLowerCase();
      return j.contractTypeId === "cdd_parttime" || /\b(part-time|temps partiel|4-day|4 day|semaine 4|32h|28h)\b/i.test(text);
    },
  },
};

/**
 * Génère une page landing programmatique dédiée (SEO & Conversion)
 */
export function renderProgrammaticLandingPage(config, matchingJobs = [], allJobs = [], meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.app";
  const canonicalUrl = `${siteUrl}/${config.slug}`;
  const title = `${config.title_fr} — FullRemote.Jobs`;
  const description = config.desc_fr;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.title_fr,
    description,
    url: canonicalUrl,
    numberOfItems: matchingJobs.length,
    itemListElement: matchingJobs.slice(0, 30).map((j, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "JobPosting",
        title: j.title,
        url: `${siteUrl}/jobs/${encodeURIComponent(j.id)}`,
        datePosted: j.published_at,
        hiringOrganization: {
          "@type": "Organization",
          name: j.company,
        },
        jobLocationType: "TELECOMMUTE",
      },
    })),
  };

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />

  <script type="application/ld+json">
    ${JSON.stringify(itemListLd, null, 2)}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${config.icon || "💼"}</text></svg>">
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
    }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1080px; margin: 0 auto; padding: 2rem 1.5rem; width: 100%; }
    header {
      border-bottom: 1px solid var(--border);
      background: var(--bg-card);
      padding: 1rem 0;
    }
    .header-inner {
      max-width: 1080px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hero-box {
      background: linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(16,185,129,0.05) 100%);
      border: 1px solid rgba(37,99,235,0.2);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      margin-bottom: 2.5rem;
    }
    .job-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3rem;
    }
    .job-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      transition: all 0.18s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .job-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37,99,235,0.08);
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" style="font-weight: 800; font-size: 1.15rem; display: flex; align-items: center; gap: 0.4rem; color: var(--text);">
        <span>🌍</span> FullRemote<span style="color: var(--primary);">.Jobs</span>
      </a>
      <div style="display:flex; align-items:center; gap:1rem;">
        <a href="/" style="font-size:0.88rem; font-weight:600; color:var(--primary);">← Tout l'annuaire</a>
        <a href="/simulateur-salaire-remote" style="font-size:0.88rem; font-weight:600; color:var(--text-muted);">💶 Simulateur</a>
        <a href="/post-a-job" style="font-size:0.85rem; font-weight:700; background:var(--primary); color:white; padding:0.5rem 1rem; border-radius:6px;">+ Publier</a>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero-box">
      <div style="display:inline-flex; align-items:center; gap:0.4rem; background:var(--bg-card); border:1px solid var(--border); padding:4px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; color:var(--primary); margin-bottom:1rem;">
        <span>${config.icon || "💼"}</span> ${escapeHtml(config.tech)} 100% Remote
      </div>
      <h1 style="font-size:2.2rem; font-weight:800; line-height:1.2; color:var(--text); letter-spacing:-0.03em; margin-bottom:0.75rem;">
        ${escapeHtml(config.title_fr)}
      </h1>
      <p style="font-size:1.05rem; color:var(--text-muted); max-width:780px; line-height:1.6; margin-bottom:1.5rem;">
        ${escapeHtml(config.desc_fr)}
      </p>

      <div style="display:flex; gap:1rem; flex-wrap:wrap; align-items:center;">
        <div style="background:var(--bg-card); border:1px solid var(--border); padding:0.5rem 1rem; border-radius:8px; font-size:0.9rem; font-weight:700; color:var(--emerald);">
          🔥 ${matchingJobs.length} opportunité(s) vérifiée(s) (< 30 jours)
        </div>
        <div style="font-size:0.85rem; color:var(--text-dim);">
          ⚡ Purge automatique des offres obsolètes & Candidature directe sans intermédiaire.
        </div>
      </div>
    </section>

    <!-- Command Search Bar & Filtres Dynamiques -->
    <section style="margin-bottom: 2rem;">
      <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 0.85rem 1rem; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
          <span style="font-size:1.15rem; color:var(--text-muted);">🔍</span>
          <input
            type="text"
            id="pageSearchInput"
            placeholder="Filtrer parmi les offres ${escapeHtml(config.tech)} (ex: React, Paris, CDI, Lead, 60k...)"
            style="flex:1; border:none; background:transparent; font-family:inherit; font-size:0.95rem; font-weight:500; color:var(--text); outline:none;"
            autocomplete="off"
          />
          <button id="pageSearchClear" style="display:none; background:transparent; border:none; color:var(--text-dim); cursor:pointer; font-size:0.9rem;" title="Effacer">✕</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:0.5rem; padding-top:0.6rem; border-top:1px solid var(--border);">
          <select id="pageRegionSelect" style="background:var(--bg); border:1px solid var(--border); color:var(--text); font-family:inherit; font-size:0.8rem; font-weight:600; padding:0.45rem 0.6rem; border-radius:6px; outline:none; cursor:pointer;">
            <option value="all">🌍 Toutes les régions</option>
            <option value="france">🇫🇷 France & Francophonie</option>
            <option value="europe">🇪🇺 Europe & UK</option>
            <option value="worldwide">🌍 Worldwide</option>
          </select>

          <select id="pageContractSelect" style="background:var(--bg); border:1px solid var(--border); color:var(--text); font-family:inherit; font-size:0.8rem; font-weight:600; padding:0.45rem 0.6rem; border-radius:6px; outline:none; cursor:pointer;">
            <option value="all">📋 Tous les contrats</option>
            <option value="cdi_fulltime">💼 CDI / Full-time</option>
            <option value="freelance_contract">⚡ Freelance</option>
            <option value="internship">🎓 Stage / Alternance</option>
            <option value="cdd_parttime">⏳ CDD / Part-time</option>
          </select>

          <select id="pageSalarySelect" style="background:var(--bg); border:1px solid var(--border); color:var(--text); font-family:inherit; font-size:0.8rem; font-weight:600; padding:0.45rem 0.6rem; border-radius:6px; outline:none; cursor:pointer;">
            <option value="0">💰 Tous les salaires</option>
            <option value="40000">💰 > 40k € / $</option>
            <option value="60000">💰 > 60k € / $</option>
            <option value="80000">💰 > 80k € / $</option>
            <option value="100000">💰 > 100k € / $</option>
          </select>

          <select id="pageSortSelect" style="background:var(--bg); border:1px solid var(--border); color:var(--text); font-family:inherit; font-size:0.8rem; font-weight:600; padding:0.45rem 0.6rem; border-radius:6px; outline:none; cursor:pointer;">
            <option value="recent">⚡ Plus récentes</option>
            <option value="salary_desc">💰 Salaire décroissant</option>
            <option value="company">🏢 Entreprise (A-Z)</option>
          </select>
        </div>
      </div>

      <!-- Quick Chips Dynamiques -->
      <div id="pageChipsRow" style="display:flex; flex-wrap:wrap; align-items:center; gap:0.4rem; margin-top:0.75rem;"></div>
    </section>

    <!-- Liste des opportunités ciblées -->
    <section>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:0.5rem;">
        <h2 style="font-size:1.35rem; font-weight:800; color:var(--text);">
          Dernières offres 100% télétravail ${escapeHtml(config.tech)}
        </h2>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span style="font-size:0.85rem; color:var(--text-dim);">
            <strong id="pageVisibleCount" style="color:var(--text); font-weight:700;">${matchingJobs.length}</strong> offre(s) affichée(s)
          </span>
          <button onclick="resetPageFilters()" style="font-size:0.75rem; color:var(--primary); background:transparent; border:none; cursor:pointer; font-weight:600; text-decoration:underline;">Réinitialiser</button>
        </div>
      </div>

      <div class="job-grid" id="landingJobGrid">
        ${matchingJobs.map((j) => {
          const detailUrl = `${siteUrl}/jobs/${encodeURIComponent(j.id)}`;
          const initial = (j.company || "C").charAt(0).toUpperCase();
          const avatar = j.company_logo
            ? `<img src="${escapeHtml(j.company_logo)}" alt="${escapeHtml(j.company)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.textContent='${initial}'" />`
            : initial;
          const cleanDesc = stripHtml(j.description_snippet || "").replace(/\\s+/g, ' ').trim();
          const tagsHtml = (j.tags || []).slice(0, 4).map(t => `<span style="font-size:0.72rem; color:var(--text-dim); background:var(--meta-bg); border:1px solid var(--border); padding:2px 6px; border-radius:4px;">#${escapeHtml(t)}</span>`).join(' ');

          return `
          <div class="job-card">
            <div>
              <div style="display:flex; align-items:center; gap:0.85rem; margin-bottom:0.85rem;">
                <div style="width:44px; height:44px; border-radius:10px; background:var(--meta-bg); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.15rem; color:var(--primary); flex-shrink:0; overflow:hidden;">
                  ${avatar}
                </div>
                <div style="min-width:0;">
                  <div style="font-size:0.83rem; font-weight:600; color:var(--text-muted);">${escapeHtml(j.company)}</div>
                  <h3 style="font-size:1.05rem; font-weight:700; color:var(--text); line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(j.title)}</h3>
                </div>
              </div>

              <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.85rem;">
                <span style="font-size:0.75rem; font-weight:600; padding:3px 8px; border-radius:6px; background:rgba(99,102,241,0.1); color:#6366f1;">${j.contractIcon || "💼"} ${escapeHtml(j.contractType || "CDI")}</span>
                <span style="font-size:0.75rem; font-weight:600; padding:3px 8px; border-radius:6px; background:rgba(37,99,235,0.1); color:#2563eb;">${j.regionFlag || "🌍"} ${escapeHtml(j.region || "Worldwide")}</span>
                ${j.salary ? `<span style="font-size:0.75rem; font-weight:700; color:var(--emerald); background:var(--emerald-bg); padding:3px 8px; border-radius:6px; border:1px solid rgba(16,185,129,0.25);">💰 ${escapeHtml(j.salary)}</span>` : ""}
              </div>

              ${cleanDesc ? `<p style="font-size:0.86rem; color:var(--text-muted); line-height:1.5; margin-bottom:0.85rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(cleanDesc)}</p>` : ""}
            </div>

            <div>
              <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:0.85rem;">
                ${tagsHtml}
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; border-top:1px solid var(--border); padding-top:0.85rem;">
                <a href="${detailUrl}" style="font-size:0.82rem; font-weight:700; text-align:center; color:var(--primary); background:rgba(37,99,235,0.06); padding:8px 10px; border-radius:8px; border:1px solid rgba(37,99,235,0.2); transition:all 0.15s ease; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:0.25rem;">
                  📄 Détails & Pitch IA
                </a>
                <a href="${escapeHtml(j.url)}" target="_blank" rel="noopener noreferrer" style="font-size:0.82rem; font-weight:700; text-align:center; background:var(--primary); color:white; padding:8px 10px; border-radius:8px; transition:background 0.15s ease; text-decoration:none; display:flex; align-items:center; justify-content:center;">
                  Postuler ↗
                </a>
              </div>
            </div>
          </div>
          `;
        }).join("")}
      </div>

      <!-- Empty State -->
      <div id="pageEmptyState" style="display:none; text-align:center; padding:3rem 1.5rem; background:var(--bg-card); border:1px solid var(--border); border-radius:14px; margin-bottom:2rem;">
        <div style="font-size:2rem; margin-bottom:0.5rem;">🔎</div>
        <h3 style="font-size:1.15rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Aucune offre ne correspond à ces critères</h3>
        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">Essayez d'ajuster vos filtres de recherche ou de réinitialiser.</p>
        <button onclick="resetPageFilters()" style="font-size:0.85rem; font-weight:700; background:var(--primary); color:white; border:none; padding:0.6rem 1.2rem; border-radius:8px; cursor:pointer;">Réinitialiser les filtres</button>
      </div>
    </section>

    <!-- Navigation Programmatique SEO Cross-linking -->
    <section style="background:var(--bg-card); border:1px solid var(--border); border-radius:14px; padding:2rem; margin-top:2rem;">
      <h3 style="font-size:1.15rem; font-weight:800; color:var(--text); margin-bottom:1rem;">
        Explorer d'autres technologies et régions 100% télétravail
      </h3>
      <div style="display:flex; flex-wrap:wrap; gap:0.6rem;">
        ${Object.entries(PROGRAMMATIC_PAGES)
          .filter(([slug]) => slug !== config.slug)
          .map(([slug, p]) => `
            <a href="/${slug}" style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.82rem; font-weight:600; color:var(--text); background:var(--meta-bg); border:1px solid var(--border); padding:6px 12px; border-radius:8px; transition:all 0.15s ease;" onmouseover="this.style.borderColor='var(--primary)'; this.style.color='var(--primary)';" onmouseout="this.style.borderColor='var(--border)'; this.style.color='var(--text)';">
              <span>${p.icon || "💼"}</span> <span>${escapeHtml(p.tech)}</span>
            </a>
          `).join("")}
      </div>
    </section>
  </main>

  <script>
    const PAGE_JOBS = ${JSON.stringify(matchingJobs)};
    let activeJobs = [...PAGE_JOBS];
    let selectedChip = null;

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderCard(j) {
      const detailUrl = '${siteUrl}/jobs/' + encodeURIComponent(j.id);
      const initial = (j.company || 'C').charAt(0).toUpperCase();
      const avatar = j.company_logo
        ? \`<img src="\${escapeHtml(j.company_logo)}" alt="\${escapeHtml(j.company)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.textContent='\${initial}'" />\`
        : initial;
      const cleanDesc = (j.description_snippet || '').replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
      const tagsHtml = (j.tags || []).slice(0, 4).map(t => \`<span style="font-size:0.72rem; color:var(--text-dim); background:var(--meta-bg); border:1px solid var(--border); padding:2px 6px; border-radius:4px;">#\${escapeHtml(t)}</span>\`).join(' ');

      return \`
      <div class="job-card">
        <div>
          <div style="display:flex; align-items:center; gap:0.85rem; margin-bottom:0.85rem;">
            <div style="width:44px; height:44px; border-radius:10px; background:var(--meta-bg); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.15rem; color:var(--primary); flex-shrink:0; overflow:hidden;">
              \${avatar}
            </div>
            <div style="min-width:0;">
              <div style="font-size:0.83rem; font-weight:600; color:var(--text-muted);">\${escapeHtml(j.company)}</div>
              <h3 style="font-size:1.05rem; font-weight:700; color:var(--text); line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${escapeHtml(j.title)}</h3>
            </div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.85rem;">
            <span style="font-size:0.75rem; font-weight:600; padding:3px 8px; border-radius:6px; background:rgba(99,102,241,0.1); color:#6366f1;">\${j.contractIcon || '💼'} \${escapeHtml(j.contractType || 'CDI')}</span>
            <span style="font-size:0.75rem; font-weight:600; padding:3px 8px; border-radius:6px; background:rgba(37,99,235,0.1); color:#2563eb;">\${j.regionFlag || '🌍'} \${escapeHtml(j.region || 'Worldwide')}</span>
            \${j.salary ? \`<span style="font-size:0.75rem; font-weight:700; color:var(--emerald); background:var(--emerald-bg); padding:3px 8px; border-radius:6px; border:1px solid rgba(16,185,129,0.25);">💰 \${escapeHtml(j.salary)}</span>\` : ''}
          </div>

          \${cleanDesc ? \`<p style="font-size:0.86rem; color:var(--text-muted); line-height:1.5; margin-bottom:0.85rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">\${escapeHtml(cleanDesc)}</p>\` : ''}
        </div>

        <div>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:0.85rem;">
            \${tagsHtml}
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; border-top:1px solid var(--border); padding-top:0.85rem;">
            <a href="\${detailUrl}" style="font-size:0.82rem; font-weight:700; text-align:center; color:var(--primary); background:rgba(37,99,235,0.06); padding:8px 10px; border-radius:8px; border:1px solid rgba(37,99,235,0.2); transition:all 0.15s ease; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:0.25rem;">
              📄 Détails & Pitch IA
            </a>
            <a href="\${escapeHtml(j.url)}" target="_blank" rel="noopener noreferrer" style="font-size:0.82rem; font-weight:700; text-align:center; background:var(--primary); color:white; padding:8px 10px; border-radius:8px; transition:background 0.15s ease; text-decoration:none; display:flex; align-items:center; justify-content:center;">
              Postuler ↗
            </a>
          </div>
        </div>
      </div>
      \`;
    }

    function applyFilters() {
      const q = (document.getElementById('pageSearchInput')?.value || '').toLowerCase().trim();
      const region = document.getElementById('pageRegionSelect')?.value || 'all';
      const contract = document.getElementById('pageContractSelect')?.value || 'all';
      const minSalary = parseInt(document.getElementById('pageSalarySelect')?.value || '0', 10);
      const sort = document.getElementById('pageSortSelect')?.value || 'recent';

      const clearBtn = document.getElementById('pageSearchClear');
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

      activeJobs = PAGE_JOBS.filter(j => {
        if (q) {
          const haystack = (j.title + ' ' + j.company + ' ' + (j.tags || []).join(' ') + ' ' + (j.location || '') + ' ' + (j.salary || '')).toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (selectedChip) {
          const haystack = (j.title + ' ' + (j.tags || []).join(' ')).toLowerCase();
          if (!haystack.includes(selectedChip.toLowerCase())) return false;
        }
        if (region !== 'all') {
          const reg = (j.regionId || '').toLowerCase();
          if (region === 'france' && reg !== 'france') return false;
          if (region === 'europe' && reg !== 'europe' && reg !== 'france') return false;
          if (region === 'worldwide' && reg !== 'worldwide') return false;
        }
        if (contract !== 'all') {
          if (j.contractTypeId !== contract) return false;
        }
        if (minSalary > 0) {
          const sMin = j.salary_min_eur || j.salary_min_usd || 0;
          const sMax = j.salary_max_eur || j.salary_max_usd || 0;
          if (Math.max(sMin, sMax) < minSalary) return false;
        }
        return true;
      });

      if (sort === 'salary_desc') {
        activeJobs.sort((a, b) => (Math.max(b.salary_max_eur || 0, b.salary_min_eur || 0) - Math.max(a.salary_max_eur || 0, a.salary_min_eur || 0)));
      } else if (sort === 'company') {
        activeJobs.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
      } else {
        activeJobs.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
      }

      const grid = document.getElementById('landingJobGrid');
      const countEl = document.getElementById('pageVisibleCount');
      const emptyEl = document.getElementById('pageEmptyState');

      if (countEl) countEl.textContent = activeJobs.length;

      if (grid) {
        if (activeJobs.length === 0) {
          grid.style.display = 'none';
          if (emptyEl) emptyEl.style.display = 'block';
        } else {
          grid.style.display = 'grid';
          grid.innerHTML = activeJobs.map(renderCard).join('');
          if (emptyEl) emptyEl.style.display = 'none';
        }
      }
    }

    function renderQuickChips() {
      const container = document.getElementById('pageChipsRow');
      if (!container) return;

      const tagCounts = {};
      PAGE_JOBS.forEach(j => {
        (j.tags || []).forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });

      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      if (topTags.length === 0) return;

      let html = '<span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-right:0.25rem;">💡 Filtres rapides :</span>';
      topTags.forEach(([tag, count]) => {
        const isSel = selectedChip === tag;
        html += \`<button onclick="toggleChip('\${escapeHtml(tag)}')" style="font-size:0.75rem; font-weight:600; padding:3px 9px; border-radius:999px; border:1px solid \${isSel ? 'var(--primary)' : 'var(--border)'}; background:\${isSel ? 'var(--primary)' : 'var(--bg-card)'}; color:\${isSel ? '#ffffff' : 'var(--text-muted)'}; cursor:pointer; transition:all 0.15s ease;">\${escapeHtml(tag)} <span style="font-size:0.7rem; opacity:0.8;">(\${count})</span></button>\`;
      });

      container.innerHTML = html;
    }

    window.toggleChip = function(tag) {
      selectedChip = (selectedChip === tag) ? null : tag;
      renderQuickChips();
      applyFilters();
    };

    window.resetPageFilters = function() {
      const search = document.getElementById('pageSearchInput');
      if (search) search.value = '';
      const reg = document.getElementById('pageRegionSelect');
      if (reg) reg.value = 'all';
      const c = document.getElementById('pageContractSelect');
      if (c) c.value = 'all';
      const sal = document.getElementById('pageSalarySelect');
      if (sal) sal.value = '0';
      const s = document.getElementById('pageSortSelect');
      if (s) s.value = 'recent';
      selectedChip = null;
      renderQuickChips();
      applyFilters();
    };

    const sInput = document.getElementById('pageSearchInput');
    if (sInput) sInput.addEventListener('input', () => applyFilters());

    const sClear = document.getElementById('pageSearchClear');
    if (sClear) sClear.onclick = () => {
      sInput.value = '';
      applyFilters();
    };

    ['pageRegionSelect', 'pageContractSelect', 'pageSalarySelect', 'pageSortSelect'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => applyFilters());
    });

    renderQuickChips();
  </script>
</body>
</html>`;
}

/**
 * Génère le flux RSS 2.0 officiel
 */
export function generateRssFeed(jobs = [], siteUrl = "https://remote-jobs.app") {
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
 * Génère le sitemap XML (Offres individuelles + Pages d'atterrissage programmatiques SEO)
 */
export function generateSitemap(jobs = [], siteUrl = "https://remote-jobs.app") {
  const programmaticUrlsXml = Object.keys(PROGRAMMATIC_PAGES)
    .map(
      (slug) => `
  <url>
    <loc>${siteUrl}/${slug}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("");

  const urlsXml = jobs
    .map((j) => {
      const pubDate = j.published_at ? new Date(j.published_at) : new Date();
      const lastmod = !isNaN(pubDate.getTime()) ? pubDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      return `
  <url>
    <loc>${siteUrl}/jobs/${encodeURIComponent(j.id)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/simulateur-salaire-remote</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/post-a-job</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  ${programmaticUrlsXml}
  ${urlsXml}
</urlset>`;
}
