/**
 * FullRemote-Jobs - Interface Utilisateur Web A-Level UI/UX
 * Refonte complète inspirée des standards Linear / Airbnb :
 * - Header 3-zones ultra-épuré (Sticky Glassmorphism)
 * - Unified Command Search Bar avec sélecteurs intégrés
 * - Pills de suggestions rapides
 * - Infinite Scroll 60 FPS & Progressive Rendering
 * - Double thème Light / Dark haute précision
 */

export function renderHTML(jobs = [], meta = {}) {
  const jobsJson = JSON.stringify(jobs);
  const totalCount = jobs.length;
  const lastUpdated = meta.updated_at || new Date().toISOString();
  const siteUrl = (meta.siteUrl || "https://remote-jobs.app").replace(/\/+$/, "");
  const domainName = new URL(siteUrl).hostname;
  const dateFormatted = new Date(lastUpdated).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Full Remote Jobs — Les meilleurs postes 100% Télétravail (FR / EN)</title>
  <meta name="description" content="L'annuaire mondial et agrégateur intelligent de postes vérifiés 100% télétravail (CDI, Freelance, CDD, Stage). Accès direct, libre et sans inscription." />
  <meta property="og:title" content="Full Remote Jobs — 100% Télétravail vérifié (CDI / Freelance / CDD)" />
  <meta property="og:description" content="Trouvez votre prochain job 100% remote en CDI, Freelance ou CDD en France, Europe et Worldwide." />
  <meta property="og:url" content="${siteUrl}" />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="${siteUrl}" />
  <link rel="alternate" type="application/rss+xml" title="Flux RSS FullRemote.Jobs" href="/rss" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌍</text></svg>">
  <style>
    :root, html.light {
      --bg: #f8fafc;
      --bg-card: #ffffff;
      --bg-card-hover: #f1f5f9;
      --border: #e2e8f0;
      --border-focus: #2563eb;
      --text: #0f172a;
      --text-muted: #64748b;
      --text-dim: #94a3b8;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --primary-subtle: rgba(37, 99, 235, 0.08);
      --emerald: #10b981;
      --emerald-subtle: rgba(16, 185, 129, 0.1);
      --amber: #f59e0b;
      --amber-subtle: rgba(245, 158, 11, 0.1);
      --rose: #e11d48;
      --rose-subtle: rgba(225, 29, 72, 0.1);
      --radius: 12px;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --header-bg: rgba(255, 255, 255, 0.88);
      --search-bg: #ffffff;
      --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      --card-hover-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      --footer-bg: #ffffff;
    }

    html.dark {
      --bg: #0b0f19;
      --bg-card: #111726;
      --bg-card-hover: #172033;
      --border: #1e293b;
      --border-focus: #3b82f6;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --primary-subtle: rgba(59, 130, 246, 0.12);
      --emerald: #10b981;
      --emerald-subtle: rgba(16, 185, 129, 0.14);
      --amber: #f59e0b;
      --amber-subtle: rgba(245, 158, 11, 0.14);
      --rose: #f43f5e;
      --rose-subtle: rgba(244, 63, 94, 0.14);
      --header-bg: rgba(11, 15, 25, 0.88);
      --search-bg: #111726;
      --card-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      --card-hover-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      --footer-bg: #080b13;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      width: 100%;
    }

    /* ══════════════════════════════════════════════════
       1. HEADER (3-ZONES CLEAN ARCHITECTURE)
    ══════════════════════════════════════════════════ */
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--header-bg);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      transition: border-color 0.2s ease;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      gap: 1rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 800;
      font-size: 1.15rem;
      letter-spacing: -0.025em;
      white-space: nowrap;
    }
    .brand-accent { color: var(--primary); }

    .live-count-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--emerald-subtle);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.25);
      white-space: nowrap;
    }
    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--emerald);
      animation: pulseDot 2s infinite ease-in-out;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }
    .nav-link {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-muted);
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .nav-link:hover {
      color: var(--text);
      background: var(--bg-card-hover);
    }
    .nav-link.active {
      color: var(--primary);
      background: var(--primary-subtle);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .btn-fav-header {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .btn-fav-header:hover {
      color: var(--rose);
      border-color: rgba(225, 29, 72, 0.3);
      background: var(--rose-subtle);
    }
    .btn-fav-header.active {
      color: var(--rose);
      border-color: rgba(225, 29, 72, 0.4);
      background: var(--rose-subtle);
    }

    .btn-post-header {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      background: var(--primary);
      color: #ffffff !important;
      white-space: nowrap;
      transition: all 0.15s ease;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
    }
    .btn-post-header:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .btn-icon-header {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text);
      cursor: pointer;
      font-size: 0.95rem;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .btn-icon-header:hover {
      background: var(--bg-card-hover);
      border-color: var(--text-muted);
    }

    /* Menu Dropdown "···" */
    .dropdown-container {
      position: relative;
    }
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 200px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 6px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      z-index: 100;
    }
    .dropdown-menu.show { display: flex; }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--text);
      border-radius: 6px;
      transition: background 0.15s ease;
    }
    .dropdown-item:hover {
      background: var(--bg-card-hover);
      color: var(--primary);
    }

    /* ══════════════════════════════════════════════════
       2. HERO SECTION
    ══════════════════════════════════════════════════ */
    .hero-section {
      padding: 2.75rem 0 1.75rem;
      text-align: center;
    }
    .hero-title {
      font-size: 2.35rem;
      font-weight: 800;
      letter-spacing: -0.035em;
      line-height: 1.15;
      margin-bottom: 0.75rem;
    }
    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 640px;
      margin: 0 auto;
      line-height: 1.55;
    }

    /* ══════════════════════════════════════════════════
       3. UNIFIED COMMAND SEARCH BAR (AIRBNB / LINEAR)
    ══════════════════════════════════════════════════ */
    .search-section {
      position: sticky;
      top: 56px;
      z-index: 80;
      background: var(--bg);
      padding: 0.5rem 0 0.75rem 0;
      margin-bottom: 1.25rem;
    }

    .master-search-card {
      background: var(--search-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 0.5rem;
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .master-search-card:focus-within {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12), var(--card-hover-shadow);
    }

    .search-input-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.35rem 0.75rem;
    }
    .search-icon-badge {
      font-size: 1.15rem;
      color: var(--text-muted);
    }
    .main-search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text);
      outline: none;
    }
    .main-search-input::placeholder {
      color: var(--text-dim);
      font-weight: 400;
    }

    .kbd-shortcut {
      display: inline-flex;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--bg-card-hover);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }

    .search-clear-btn {
      background: transparent;
      border: none;
      color: var(--text-dim);
      cursor: pointer;
      padding: 4px;
      font-size: 0.9rem;
      display: none;
    }
    .search-clear-btn:hover { color: var(--text); }

    .search-filters-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      padding-top: 0.4rem;
      border-top: 1px solid var(--border);
    }

    .filter-select {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: inherit;
      font-size: 0.83rem;
      font-weight: 600;
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      outline: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-select:focus, .filter-select:hover {
      border-color: var(--primary);
    }

    /* Suggestions Rapides */
    .quick-chips-row {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
      padding: 0 0.25rem;
    }
    .chips-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-right: 0.25rem;
    }
    .quick-chip {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .quick-chip:hover {
      background: var(--primary-subtle);
      border-color: var(--primary);
      color: var(--primary);
    }
    .quick-chip.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #ffffff;
    }

    /* ══════════════════════════════════════════════════
       4. TOOLBAR & STATS
    ══════════════════════════════════════════════════ */
    .toolbar-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .results-count-wrapper {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .count-number {
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--text);
    }
    .reset-all-btn {
      font-size: 0.78rem;
      color: var(--rose);
      background: var(--rose-subtle);
      border: 1px solid rgba(225, 29, 72, 0.25);
      padding: 2px 8px;
      border-radius: 6px;
      cursor: pointer;
      display: none;
    }

    .view-controls {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .segmented-control {
      display: inline-flex;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 2px;
    }
    .segment-btn {
      border: none;
      background: transparent;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;
    }
    .segment-btn.active {
      background: var(--bg-card-hover);
      color: var(--text);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .sort-select {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.4rem 0.65rem;
      border-radius: 8px;
      outline: none;
      cursor: pointer;
    }

    /* ══════════════════════════════════════════════════
       5. JOB CARDS GRID
    ══════════════════════════════════════════════════ */
    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.1rem;
      margin-bottom: 2rem;
    }

    .job-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      transition: all 0.2s ease;
      cursor: pointer;
      box-shadow: var(--card-shadow);
    }
    .job-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--card-hover-shadow);
      border-color: rgba(37, 99, 235, 0.3);
    }

    .job-card-header {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      margin-bottom: 0.75rem;
    }

    .company-avatar {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--bg-card-hover);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--primary);
      flex-shrink: 0;
      overflow: hidden;
    }
    .company-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .company-info {
      flex: 1;
      min-width: 0;
    }
    .company-name {
      font-size: 0.83rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .job-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.35;
      letter-spacing: -0.015em;
    }

    .btn-card-fav {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: transparent;
      border: none;
      font-size: 1.1rem;
      color: var(--text-dim);
      cursor: pointer;
      transition: transform 0.15s ease, color 0.15s ease;
    }
    .btn-card-fav:hover {
      transform: scale(1.2);
      color: var(--rose);
    }
    .btn-card-fav.active {
      color: var(--rose);
    }

    .job-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin: 0.75rem 0 0.9rem;
    }
    .tag-badge {
      font-size: 0.74rem;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 6px;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .tag-salary {
      background: var(--emerald-subtle);
      border-color: rgba(16, 185, 129, 0.25);
      color: var(--emerald);
      font-family: var(--font-mono);
      font-weight: 700;
    }
    .tag-contract {
      background: var(--primary-subtle);
      border-color: rgba(37, 99, 235, 0.25);
      color: var(--primary);
    }

    .job-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
      font-size: 0.78rem;
      color: var(--text-dim);
    }

    .btn-apply-card {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--primary);
      padding: 4px 10px;
      border-radius: 6px;
      background: var(--primary-subtle);
      transition: all 0.15s ease;
    }
    .btn-apply-card:hover {
      background: var(--primary);
      color: #ffffff !important;
    }

    /* Infinite Scroll Sentinel */
    .infinite-container {
      text-align: center;
      padding: 1.5rem 0 3rem;
    }
    .btn-load-more {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.75rem 1.75rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-load-more:hover {
      background: var(--bg-card-hover);
      border-color: var(--primary);
    }

    /* Markdown Table View */
    .markdown-view-wrapper {
      display: none;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-bottom: 2rem;
      overflow-x: auto;
    }
    .markdown-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .markdown-table th, .markdown-table td {
      padding: 0.65rem 0.85rem;
      border-bottom: 1px solid var(--border);
      text-align: left;
    }
    .markdown-table th {
      background: var(--bg);
      font-weight: 700;
      color: var(--text-muted);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin-bottom: 2rem;
    }
    .empty-state-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

    /* ══════════════════════════════════════════════════
       6. MODALS (DETAIL & ALERTES)
    ══════════════════════════════════════════════════ */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1rem;
    }
    .modal-backdrop.open { display: flex; }

    .modal-dialog {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      max-width: 620px;
      width: 100%;
      max-height: 88vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    /* Form Styles */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text);
    }
    .form-input, .form-select {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: inherit;
      font-size: 0.88rem;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      outline: none;
    }
    .form-input:focus, .form-select:focus {
      border-color: var(--primary);
    }

    /* ══════════════════════════════════════════════════
       7. FOOTER
    ══════════════════════════════════════════════════ */
    footer {
      background: var(--footer-bg);
      border-top: 1px solid var(--border);
      padding: 3rem 0 2rem;
      margin-top: auto;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .footer-col-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .footer-col-links {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.83rem;
      color: var(--text-muted);
    }
    .footer-col-links a:hover {
      color: var(--primary);
    }
    .footer-bottom {
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-dim);
      flex-wrap: wrap;
      gap: 1rem;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--text);
      color: var(--bg);
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 200;
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
      transition: all 0.25s ease;
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    @media (max-width: 860px) {
      .header-nav { display: none; }
      .search-filters-row { grid-template-columns: 1fr 1fr; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .hero-title { font-size: 1.85rem; }
    }
    @media (max-width: 540px) {
      .search-filters-row { grid-template-columns: 1fr; }
      .jobs-grid { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr; }
      .hide-mobile { display: none; }
    }
  </style>
</head>
<body>

  <!-- 1. HEADER (3-ZONES MINIMALIST) -->
  <header>
    <div class="container header-inner">
      <!-- Left: Logo & Live Counter -->
      <div class="header-left">
        <a href="/" class="brand">
          <span style="font-size:1.3rem;">🌍</span>
          <span>FullRemote<span class="brand-accent">.Jobs</span></span>
        </a>
        <div class="live-count-badge" title="Nombre d'offres actives en direct">
          <span class="live-dot"></span>
          <span><span class="count-number" id="headerCount">${totalCount}</span> jobs</span>
        </div>
      </div>

      <!-- Center: Clean Navigation Links -->
      <nav class="header-nav hide-mobile">
        <a href="/" class="nav-link active" data-i18n="nav_explore">Explorer</a>
        <a href="/talents" class="nav-link" style="color:var(--primary); font-weight:700;">🚀 Talents</a>
        <a href="/simulateur-salaire-remote" class="nav-link" data-i18n="nav_calc">💶 Simulateur</a>
      </nav>

      <!-- Right: Action CTA & Utilities -->
      <div class="header-right">
        <button id="favHeaderBtn" class="btn-fav-header" title="Afficher mes offres sauvegardées">
          <span>❤️</span> <span id="favCount">0</span>
        </button>

        <a href="/post-a-job" class="btn-post-header">
          <span>+</span> <span data-i18n="nav_post">Publier</span>
        </a>

        <button id="langToggleBtn" class="btn-icon-header" onclick="toggleLanguage()" title="Changer de langue / Switch Language" style="font-size:0.75rem; font-weight:700; width:auto; padding:0 0.45rem;">
          🇬🇧 EN
        </button>

        <button id="themeToggleBtn" class="btn-icon-header" title="Changer de thème">
          🌙
        </button>

        <!-- Dropdown "···" for secondary developer resources -->
        <div class="dropdown-container">
          <button id="moreDropdownBtn" class="btn-icon-header" title="Plus d'outils">
            ···
          </button>
          <div id="moreDropdownMenu" class="dropdown-menu">
            <button onclick="openAlertModal()" class="dropdown-item" style="background:none; border:none; width:100%; text-align:left; cursor:pointer; font-family:inherit;">
              🔔 <span data-i18n="nav_alerts">Créer une alerte email</span>
            </button>
            <div style="height:1px; background:var(--border); margin:4px 0;"></div>
            <a href="/talents/join" id="menuTalentLink" class="dropdown-item">🚀 Rejoindre le Vivier (Gratuit)</a>
            <a href="/talents" class="dropdown-item">👥 Annuaire des Talents</a>
            <a href="/simulateur-salaire-remote" class="dropdown-item" data-i18n="nav_calc">💶 Simulateur Salaire</a>
            <a href="/llms.txt" class="dropdown-item">🤖 Index llms.txt</a>
            <a href="/rss" target="_blank" class="dropdown-item">📡 Flux RSS 2.0</a>
            <a href="/api/jobs" target="_blank" class="dropdown-item">⚡ API REST JSON</a>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- 2. HERO SECTION -->
  <main class="container">
    <section class="hero-section">
      <h1 class="hero-title" data-i18n="hero_title" data-i18n-html="true">Trouvez votre prochain job <span class="brand-accent">100% télétravail</span>.</h1>
      <p class="hero-subtitle" data-i18n="hero_sub">Le répertoire vérifié des meilleures opportunités sans restriction géographique (CDI, Freelance, CDD, Stage). Accès direct et sans intermédiaire.</p>
    </section>

    <!-- 3. UNIFIED MASTER COMMAND SEARCH BAR -->
    <section class="search-section">
      <div class="master-search-card">
        <div class="search-input-row">
          <span class="search-icon-badge">🔍</span>
          <input
            type="text"
            id="searchInput"
            class="main-search-input"
            placeholder="Rechercher par titre, stack techno, entreprise (ex: Go, React, Python, Stripe, DevOps...)"
            autocomplete="off"
          />
          <span class="kbd-shortcut hide-mobile">/</span>
          <button id="searchClear" class="search-clear-btn" title="Effacer">✕</button>
        </div>

        <div class="search-filters-row">
          <select id="regionSelect" class="filter-select">
            <option value="all">🌍 Toutes les régions</option>
            <option value="worldwide">🌍 Worldwide (Sans limite)</option>
            <option value="france">🇫🇷 France & Francophonie</option>
            <option value="europe">🇪🇺 Europe & UK</option>
            <option value="americas">🇺🇸 Amériques (USA/CA/LATAM)</option>
            <option value="apac_mea">🌏 Asie, Pacifique & MEA</option>
          </select>

          <select id="categorySelect" class="filter-select">
            <option value="all">💼 Tous les métiers</option>
            <option value="tech">💻 Tech & Dev</option>
            <option value="devops">☁️ DevOps & Cloud</option>
            <option value="data_ai">🧠 Data & IA</option>
            <option value="design">🎨 Design & UX/UI</option>
            <option value="product">🚀 Product</option>
            <option value="marketing_sales">📈 Marketing & Sales</option>
          </select>

          <select id="contractSelect" class="filter-select">
            <option value="all">📋 Tous les contrats</option>
            <option value="cdi_fulltime">💼 CDI / Full-time</option>
            <option value="freelance_contract">⚡ Freelance</option>
            <option value="cdd_parttime">⏳ CDD / Part-time</option>
            <option value="internship">🎓 Stage / Alternance</option>
          </select>

          <select id="salarySelect" class="filter-select">
            <option value="0">💰 Tous les salaires</option>
            <option value="50000">💰 > 50k € / $</option>
            <option value="75000">💰 > 75k € / $</option>
            <option value="100000">💰 > 100k € / $</option>
            <option value="130000">💰 > 130k € / $</option>
          </select>
        </div>
      </div>

      <!-- Quick Chips Suggestions (Dynamiques) -->
      <div class="quick-chips-row" id="quickChipsContainer">
        <span class="chips-label">💡 Populaire :</span>
      </div>
    </section>

    <!-- 4. TOOLBAR SECTION -->
    <section class="toolbar-section">
      <div class="results-count-wrapper">
        <span><span data-i18n="showing_jobs">Affichage de</span> <span class="count-number" id="visibleCount">0</span> <span data-i18n="jobs_count">offre(s)</span></span>
        <button id="resetAllFiltersBtn" class="reset-all-btn" onclick="resetAllFilters()" data-i18n="reset_filters">✕ Réinitialiser</button>
      </div>

      <div class="view-controls">
        <div class="segmented-control">
          <button id="viewCardsBtn" class="segment-btn active" title="Vue Cartes">
            <span>🗂️</span> <span class="hide-mobile" data-i18n="view_cards">Cartes</span>
          </button>
          <button id="viewMdBtn" class="segment-btn" title="Vue Markdown">
            <span>📋</span> <span class="hide-mobile" data-i18n="view_md">Markdown</span>
          </button>
        </div>

        <select id="sortSelect" class="sort-select">
          <option value="recent">⚡ Plus récentes</option>
          <option value="salary_desc">💰 Salaire décroissant</option>
          <option value="company">🏢 Entreprise (A-Z)</option>
        </select>
      </div>
    </section>

    <!-- 5. JOB CARDS GRID -->
    <div id="jobsGrid" class="jobs-grid"></div>

    <!-- Infinite Scroll Sentinel & Load More -->
    <div class="infinite-container">
      <div id="infiniteSentinel" style="height: 20px; margin-bottom: 10px;"></div>
      <button id="loadMoreBtn" class="btn-load-more" onclick="loadMoreJobs()">
        Charger plus d'offres ⬇
      </button>
      <div id="allLoadedNotice" style="display:none; font-size:0.85rem; color:var(--text-dim); margin-top:0.75rem;">
        🎉 Vous avez visualisé l'ensemble des offres.
      </div>
    </div>

    <!-- Markdown Table View -->
    <div id="markdownView" class="markdown-view-wrapper">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2 style="font-size:1.05rem; font-weight:700;" data-i18n="md_title">Catalogue au format Markdown (LLM & Agent friendly)</h2>
        <button id="copyMdBtn" class="btn-post-header" style="border:none; cursor:pointer;" data-i18n="md_copy_btn">
          📋 Copier tout le Markdown
        </button>
      </div>
      <table class="markdown-table" id="markdownTable">
        <thead>
          <tr>
            <th data-i18n="th_region">Région</th>
            <th data-i18n="th_type">Type</th>
            <th data-i18n="th_role">Poste</th>
            <th data-i18n="th_company">Entreprise</th>
            <th data-i18n="th_salary">Salaire</th>
            <th data-i18n="th_link">Lien</th>
          </tr>
        </thead>
        <tbody id="markdownTableBody"></tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div id="emptyState" class="empty-state" style="display:none;">
      <div class="empty-state-icon">🔎</div>
      <h3 style="color:var(--text); margin-bottom:0.4rem; font-size:1.15rem; font-weight:700;" data-i18n="empty_title">Aucune offre correspondante</h3>
      <p style="color:var(--text-muted); font-size:0.9rem;" data-i18n="empty_sub">Essayez d'élargir vos filtres ou effectuez une recherche par mot-clé.</p>
      <button onclick="resetAllFilters()" class="btn-load-more" style="margin-top:1rem;" data-i18n="reset_filters">
        Réinitialiser tous les filtres
      </button>
    </div>
  </main>

  <!-- 6. MODALS -->
  <!-- Job Detail Modal -->
  <div id="jobModal" class="modal-backdrop">
    <div class="modal-dialog">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div id="modalAvatar" class="company-avatar"></div>
          <div>
            <div id="modalCompany" style="font-size:0.83rem; font-weight:600; color:var(--text-muted);"></div>
            <h3 id="modalTitle" style="font-size:1.05rem; font-weight:700; color:var(--text);"></h3>
          </div>
        </div>
        <button id="modalCloseBtn" class="btn-icon-header" style="width:32px; height:32px; font-size:1rem;">✕</button>
      </div>
      <div class="modal-body" id="modalBody"></div>
      <div class="modal-footer">
        <a id="modalSeoLink" href="#" target="_blank" class="btn-fav-header" title="Ouvrir la page détaillée de l'offre" data-i18n="modal_seo_btn">
          📄 Fiche dédiée
        </a>
        <button id="modalCopyBtn" class="btn-fav-header" title="Copier le lien" data-i18n="modal_copy_link">
          🔗 Copier lien
        </button>
        <a id="modalApplyBtn" href="#" target="_blank" rel="noopener noreferrer" class="btn-post-header" data-i18n="modal_apply">
          Postuler directement ↗
        </a>
      </div>
    </div>
  </div>

  <!-- Email Alerts Modal -->
  <div id="alertModal" class="modal-backdrop">
    <div class="modal-dialog" style="max-width: 520px;">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="font-size:1.4rem;">🔔</span>
          <div>
            <h3 style="font-size:1.05rem; font-weight:700; color:var(--text);" data-i18n="alert_modal_title">Créer une alerte personnalisée</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin:0;" data-i18n="alert_modal_sub">Recevez chaque matin à 08h00 les offres adaptées à vos critères.</p>
          </div>
        </div>
        <button id="alertModalCloseBtn" class="btn-icon-header" style="width:32px; height:32px;">✕</button>
      </div>
      <form id="alertForm" class="modal-body" action="javascript:void(0);" onsubmit="event.preventDefault(); handleAlertSubmit(event); return false;" style="display:flex; flex-direction:column; gap:1rem;">
        <div class="form-group">
          <label class="form-label" for="alertEmail"><span data-i18n="alert_email_lbl">Votre adresse Email :</span> <span style="color:var(--rose);">*</span></label>
          <input type="email" id="alertEmail" class="form-input" required placeholder="alex@exemple.com" />
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="form-group">
            <label class="form-label" for="alertRegion" data-i18n="alert_region_lbl">Zone géographique :</label>
            <select id="alertRegion" class="form-select">
              <option value="all">🌍 Toutes les régions</option>
              <option value="worldwide">🌍 Worldwide</option>
              <option value="france">🇫🇷 France & Francophonie</option>
              <option value="europe">🇪🇺 Europe & UK</option>
              <option value="americas">🇺🇸 Amériques</option>
              <option value="apac_mea">🌏 Asie & MEA</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="alertCategory" data-i18n="alert_cat_lbl">Métier / Domaine :</label>
            <select id="alertCategory" class="form-select">
              <option value="all">💼 Tous les métiers</option>
              <option value="tech">💻 Tech & Dev</option>
              <option value="devops">☁️ DevOps & Cloud</option>
              <option value="data_ai">🧠 Data & IA</option>
              <option value="design">🎨 Design & UX</option>
              <option value="product">🚀 Product</option>
              <option value="marketing_sales">📈 Marketing & Sales</option>
            </select>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="form-group">
            <label class="form-label" for="alertContract" data-i18n="alert_contract_lbl">Type de contrat :</label>
            <select id="alertContract" class="form-select">
              <option value="all">📋 Tous les contrats</option>
              <option value="cdi_fulltime">💼 CDI / Full-time</option>
              <option value="freelance_contract">⚡ Freelance</option>
              <option value="cdd_parttime">⏳ CDD / Part-time</option>
              <option value="internship">🎓 Stage</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="alertFrequency" data-i18n="alert_freq_lbl">Fréquence d'envoi :</label>
            <select id="alertFrequency" class="form-select">
              <option value="daily" data-i18n="alert_freq_daily">🌅 Chaque matin (08h00 UTC)</option>
              <option value="weekly" data-i18n="alert_freq_weekly">📅 Hebdomadaire (Lundi)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="alertKeywords" data-i18n="alert_kw_lbl">Mots-clés (optionnel) :</label>
          <input type="text" id="alertKeywords" class="form-input" placeholder="ex: react, golang, rust, devops..." />
        </div>
        <div id="alertFeedback" style="display:none; font-size:0.85rem; padding:0.6rem 0.8rem; border-radius:6px;"></div>
        <button type="submit" id="alertSubmitBtn" class="btn-post-header" style="justify-content:center; padding:0.75rem; font-size:0.9rem; border:none; cursor:pointer; width:100%;" data-i18n="alert_btn_submit">
          🚀 Activer mon alerte
        </button>
      </form>
    </div>
  </div>

  <!-- Newsletter Capture Section -->
  <section style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 3rem 0;">
    <div class="container" style="max-width: 620px; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 0.4rem;">📬</div>
      <h2 style="font-size: 1.45rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; color: var(--text);" data-i18n="digest_title">Le Digest Quotidien du Full Remote</h2>
      <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.55;" data-i18n="digest_sub">Recevez chaque matin à 08h00 les 10 meilleures opportunités vérifiées 100% télétravail directement dans votre boîte mail. 0 spam, désinscription en 1 clic.</p>
      <form id="quickNewsletterForm" action="javascript:void(0);" onsubmit="event.preventDefault(); handleQuickNewsletter(event); return false;" style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
        <input type="email" id="quickEmail" required placeholder="Votre adresse email (ex: alex@gmail.com)" class="form-input" style="max-width: 340px; background: var(--bg-card);" />
        <button type="submit" id="quickEmailBtn" class="btn-post-header" style="border: none; padding: 0.65rem 1.4rem; cursor: pointer;" data-i18n="digest_btn">
          🚀 S'inscrire
        </button>
      </form>
      <div id="quickFeedback" style="display: none; margin-top: 0.75rem; font-size: 0.85rem; font-weight: 600; padding: 0.5rem 1rem; border-radius: 6px; width: fit-content; margin-left: auto; margin-right: auto;"></div>
    </div>
  </section>

  <!-- 7. FOOTER -->
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="brand" style="margin-bottom:0.75rem;">
            <span>🌍</span>
            <span>FullRemote<span class="brand-accent">.Jobs</span></span>
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.55; max-width:320px;" data-i18n="footer_brand_desc" data-i18n-html="true">
            L'annuaire mondial des carrières 100% télétravail. Made with ❤️ by <a href="https://edounze.com" target="_blank" style="color:var(--primary); font-weight:600;">Charles EDOU NZE</a>.
          </p>
        </div>
        <div>
          <div class="footer-col-title" data-i18n="footer_col_plat">Plateforme</div>
          <div class="footer-col-links">
            <a href="/" data-i18n="footer_link_explore">Explorer les offres</a>
            <a href="/talents" style="color:var(--primary); font-weight:700;">🚀 Vivier Talents (Reverse)</a>
            <a href="/talents/join" id="footerTalentLink">Rejoindre le Vivier (Gratuit)</a>
            <a href="/simulateur-salaire-remote" data-i18n="footer_link_calc">Simulateur Salaire</a>
            <a href="/post-a-job" data-i18n="footer_link_post">Publier une offre (49€)</a>
            <a href="javascript:void(0);" onclick="openAlertModal()" data-i18n="footer_link_alert">Créer une alerte email</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title" data-i18n="footer_col_ai">IA & Développeurs</div>
          <div class="footer-col-links">
            <a href="/llms.txt">Standard llms.txt</a>
            <a href="/llms-full.txt">Catalogue Markdown</a>
            <a href="/api/jobs">API REST JSON</a>
            <a href="/openapi.json">Spécification OpenAPI</a>
            <a href="/mcp">Serveur MCP</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title" data-i18n="footer_col_res">Ressources</div>
          <div class="footer-col-links">
            <a href="/rss" target="_blank">Flux RSS 2.0</a>
            <a href="/sitemap.xml" target="_blank">Sitemap XML</a>
            <a href="https://github.com/flouzzy/fullremote-jobs" target="_blank">Code Source GitHub</a>
            <a href="${siteUrl}">${domainName}</a>
          </div>
        </div>
      <div class="footer-seo-tags" style="border-top:1px solid var(--border); padding-top:1.25rem; margin-top:1.5rem; display:flex; flex-wrap:wrap; gap:0.4rem; justify-content:center;">
        <span style="font-size:0.72rem; color:var(--text-dim); font-weight:700; width:100%; text-align:center; margin-bottom:0.25rem; letter-spacing:0.05em;">SPÉCIALITÉS 100% TÉLÉTRAVAIL (PÉPITES & TOP TIOBE) :</span>
        <a href="/remote-intern-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🎓 Stages Remote</a>
        <a href="/remote-alternance-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">📚 Alternance Remote</a>
        <a href="/remote-senior-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">👑 Seniors & Staff</a>
        <a href="/remote-fractional-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">⚡ Fractional CTO</a>
        <a href="/remote-freelance-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">⚡ Freelance & TJM</a>
        <a href="/remote-ai-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🤖 IA & LLM Remote</a>
        <a href="/remote-laravel-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🔴 Laravel Remote</a>
        <a href="/remote-symfony-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🎼 Symfony Remote</a>
        <a href="/remote-php-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🐘 PHP Remote</a>
        <a href="/remote-python-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🐍 Python & IA</a>
        <a href="/remote-react-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">⚛️ React & TS</a>
        <a href="/remote-rust-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🦀 Rust Remote</a>
        <a href="/remote-golang-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🐹 Go Remote</a>
        <a href="/remote-java-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">☕ Java Remote</a>
        <a href="/remote-csharp-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🎯 C# .NET</a>
        <a href="/remote-devops-jobs" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">☁️ DevOps & Cloud</a>
        <a href="/remote-jobs-france" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🇫🇷 Remote France</a>
        <a href="/remote-jobs-worldwide" style="font-size:0.78rem; color:var(--text-muted); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:4px;">🌍 Worldwide</a>
      </div>

      <div class="footer-bottom">
        <div data-i18n="footer_rights">© 2026 FullRemote.Jobs — Tous droits réservés.</div>
        <div data-i18n="footer_sources">Indexation continue • 13 sources mondiales agrégées</div>
      </div>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div id="toast" class="toast">
    <span>✓</span> <span id="toastMsg">Action effectuée</span>
  </div>

  <!-- Client-side Logic (High Performance) -->
  <script>
    const JOBS_DATA = ${jobsJson};
    let currentRegion = 'all';
    let currentContract = 'all';
    let currentCategory = 'all';
    let minSalary = 0;
    let onlyFavorites = false;
    let searchQuery = '';
    let sortMode = 'recent';

    // Favorites in localStorage
    let favorites = new Set();
    try {
      const savedFavs = JSON.parse(localStorage.getItem('fr_favs') || '[]');
      favorites = new Set(savedFavs);
    } catch (e) {}

    function updateFavCounters() {
      const fc = document.getElementById('favCount');
      if (fc) fc.textContent = favorites.size;
    }
    updateFavCounters();

    // ══════════════════════════════════════════════════
    // Internationalization (i18n) Engine (FR / EN)
    // ══════════════════════════════════════════════════
    const I18N = {
      fr: {
        nav_explore: "Explorer",
        nav_calc: "💶 Simulateur",
        nav_alerts: "🔔 Alertes",
        nav_favs: "Favoris",
        nav_post: "Publier",
        hero_title: "Trouvez votre prochain job <span class='brand-accent'>100% télétravail</span>.",
        hero_sub: "Le répertoire vérifié des meilleures opportunités sans restriction géographique (CDI, Freelance, CDD, Stage). Accès direct et sans intermédiaire.",
        search_ph: "Rechercher par titre, stack techno, entreprise (ex: Go, React, Python, Stripe, DevOps...)",
        region_all: "🌍 Toutes les régions",
        region_ww: "🌍 Worldwide (Sans limite)",
        region_fr: "🇫🇷 France & Francophonie",
        region_eu: "🇪🇺 Europe & UK",
        region_us: "🇺🇸 Amériques (USA/CA/LATAM)",
        region_apac: "🌏 Asie, Pacifique & MEA",
        cat_all: "💼 Tous les métiers",
        cat_tech: "💻 Tech & Dev",
        cat_devops: "☁️ DevOps & Cloud",
        cat_data: "🧠 Data & IA",
        cat_design: "🎨 Design & UX/UI",
        cat_product: "🚀 Product",
        cat_mktg: "📈 Marketing & Sales",
        contract_all: "📋 Tous les contrats",
        contract_cdi: "💼 CDI / Full-time",
        contract_free: "⚡ Freelance",
        contract_cdd: "⏳ CDD / Part-time",
        contract_intern: "🎓 Stage / Alternance",
        salary_all: "💰 Tous les salaires",
        salary_50: "💰 > 50k € / $",
        salary_75: "💰 > 75k € / $",
        salary_100: "💰 > 100k € / $",
        salary_130: "💰 > 130k € / $",
        chips_label: "💡 Populaire :",
        showing_jobs: "Affichage de",
        jobs_count: "offre(s)",
        reset_filters: "✕ Réinitialiser",
        sort_recent: "⚡ Plus récentes",
        sort_salary: "💰 Salaire décroissant",
        sort_company: "🏢 Entreprise (A-Z)",
        view_cards: "Cartes",
        view_md: "Markdown",
        empty_title: "Aucune offre correspondante",
        empty_sub: "Essayez d'élargir vos filtres ou effectuez une recherche par mot-clé.",
        load_more: "Charger plus d'offres",
        all_loaded: "🎉 Vous avez visualisé l'ensemble des offres.",
        md_title: "Catalogue au format Markdown (LLM & Agent friendly)",
        md_copy_btn: "📋 Copier tout le Markdown",
        th_region: "Région",
        th_type: "Type",
        th_role: "Poste",
        th_company: "Entreprise",
        th_salary: "Salaire",
        th_link: "Lien",
        digest_title: "Le Digest Quotidien du Full Remote",
        digest_sub: "Recevez chaque matin à 08h00 les 10 meilleures opportunités vérifiées 100% télétravail directement dans votre boîte mail. 0 spam, désinscription en 1 clic.",
        digest_input_ph: "Votre adresse email (ex: alex@gmail.com)",
        digest_btn: "🚀 S'inscrire",
        footer_brand_desc: "L'annuaire mondial des carrières 100% télétravail. Made with ❤️ by <a href='https://edounze.com' target='_blank' style='color:var(--primary); font-weight:600;'>Charles EDOU NZE</a>.",
        footer_col_plat: "Plateforme",
        footer_col_ai: "IA & Développeurs",
        footer_col_res: "Ressources",
        footer_link_explore: "Explorer les offres",
        footer_link_calc: "Simulateur Salaire",
        footer_link_post: "Publier une offre (49€)",
        footer_link_alert: "Créer une alerte email",
        footer_rights: "© 2026 FullRemote.Jobs — Tous droits réservés.",
        footer_sources: "Indexation continue • 9 sources mondiales agrégées",
        card_details: "Détails ↗",
        modal_apply: "Postuler directement ↗",
        modal_seo_btn: "📄 Fiche dédiée",
        modal_copy_link: "🔗 Copier lien",
        toast_fav_added: "Offre ajoutée aux favoris ❤️",
        toast_fav_removed: "Offre retirée des favoris",
        toast_link_copied: "Lien copié dans le presse-papiers ! 🔗",
        toast_md_copied: "Markdown copié dans le presse-papiers ! 📋",
        alert_modal_title: "Créer une alerte personnalisée",
        alert_modal_sub: "Recevez chaque matin à 08h00 les offres adaptées à vos critères.",
        alert_email_lbl: "Votre adresse Email :",
        alert_region_lbl: "Zone géographique :",
        alert_cat_lbl: "Métier / Domaine :",
        alert_contract_lbl: "Type de contrat :",
        alert_freq_lbl: "Fréquence d'envoi :",
        alert_freq_daily: "🌅 Chaque matin (08h00 UTC)",
        alert_freq_weekly: "📅 Hebdomadaire (Lundi)",
        alert_kw_lbl: "Mots-clés (optionnel) :",
        alert_btn_submit: "🚀 Activer mon alerte"
      },
      en: {
        nav_explore: "Explore",
        nav_calc: "💶 Calculator",
        nav_alerts: "🔔 Alerts",
        nav_favs: "Favorites",
        nav_post: "Post a Job",
        hero_title: "Find your next <span class='brand-accent'>100% remote job</span>.",
        hero_sub: "The verified global directory of top full-remote opportunities (Full-time, Contract, Freelance, Intern). Direct access, zero fluff.",
        search_ph: "Search by title, tech stack, company (e.g. Go, React, Python, Stripe, DevOps...)",
        region_all: "🌍 All Regions",
        region_ww: "🌍 Worldwide (No restrictions)",
        region_fr: "🇫🇷 France & Francophonie",
        region_eu: "🇪🇺 Europe & UK",
        region_us: "🇺🇸 Americas (USA/CA/LATAM)",
        region_apac: "🌏 Asia, Pacific & MEA",
        cat_all: "💼 All Categories",
        cat_tech: "💻 Tech & Engineering",
        cat_devops: "☁️ DevOps & Cloud",
        cat_data: "🧠 Data & AI",
        cat_design: "🎨 Design & UX/UI",
        cat_product: "🚀 Product Management",
        cat_mktg: "📈 Marketing & Sales",
        contract_all: "📋 All Contracts",
        contract_cdi: "💼 Full-time / Permanent",
        contract_free: "⚡ Freelance / Contract",
        contract_cdd: "⏳ Part-time / Fixed-term",
        contract_intern: "🎓 Internship",
        salary_all: "💰 All Salaries",
        salary_50: "💰 > $ / € 50k",
        salary_75: "💰 > $ / € 75k",
        salary_100: "💰 > $ / € 100k",
        salary_130: "💰 > $ / € 130k",
        chips_label: "💡 Popular:",
        showing_jobs: "Showing",
        jobs_count: "job(s)",
        reset_filters: "✕ Reset",
        sort_recent: "⚡ Most recent",
        sort_salary: "💰 Highest salary",
        sort_company: "🏢 Company (A-Z)",
        view_cards: "Cards",
        view_md: "Markdown",
        empty_title: "No jobs match your current filters",
        empty_sub: "Try broadening your search query or reset the active filters.",
        load_more: "Load more jobs",
        all_loaded: "🎉 You have viewed all available jobs.",
        md_title: "Markdown Catalog (LLM & Agent friendly)",
        md_copy_btn: "📋 Copy All Markdown",
        th_region: "Region",
        th_type: "Type",
        th_role: "Role",
        th_company: "Company",
        th_salary: "Salary",
        th_link: "Link",
        digest_title: "The Daily Full Remote Digest",
        digest_sub: "Get the top 10 verified 100% remote opportunities delivered directly to your inbox every morning at 8:00 AM. 0 spam, 1-click unsubscribe.",
        digest_input_ph: "Your email address (e.g. alex@gmail.com)",
        digest_btn: "🚀 Subscribe for Free",
        footer_brand_desc: "The worldwide directory for 100% remote careers. Made with ❤️ by <a href='https://edounze.com' target='_blank' style='color:var(--primary); font-weight:600;'>Charles EDOU NZE</a>.",
        footer_col_plat: "Platform",
        footer_col_ai: "AI & Developers",
        footer_col_res: "Resources",
        footer_link_explore: "Explore Jobs",
        footer_link_calc: "Salary Calculator",
        footer_link_post: "Post a Job ($49 / 49€)",
        footer_link_alert: "Create Email Alert",
        footer_rights: "© 2026 FullRemote.Jobs — All rights reserved.",
        footer_sources: "Continuous Indexing • 9 global remote sources aggregated",
        card_details: "Details ↗",
        modal_apply: "Apply directly on site ↗",
        modal_seo_btn: "📄 Direct page",
        modal_copy_link: "🔗 Copy link",
        toast_fav_added: "Job added to favorites ❤️",
        toast_fav_removed: "Job removed from favorites",
        toast_link_copied: "Link copied to clipboard! 🔗",
        toast_md_copied: "Markdown copied to clipboard! 📋",
        alert_modal_title: "Create Custom Email Alert",
        alert_modal_sub: "Receive fresh 100% remote opportunities matching your criteria every morning.",
        alert_email_lbl: "Your email address:",
        alert_region_lbl: "Geographic Region:",
        alert_cat_lbl: "Target Category:",
        alert_contract_lbl: "Contract Type:",
        alert_freq_lbl: "Digest Frequency:",
        alert_freq_daily: "🌅 Daily (08:00 AM UTC)",
        alert_freq_weekly: "📅 Weekly (Every Monday)",
        alert_kw_lbl: "Keywords (optional):",
        alert_btn_submit: "🚀 Activate My Alert"
      }
    };

    let currentLang = 'fr';
    try {
      const savedLang = localStorage.getItem('lang');
      if (savedLang === 'fr' || savedLang === 'en') {
        currentLang = savedLang;
      } else {
        const bLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        currentLang = bLang.startsWith('fr') ? 'fr' : 'en';
      }
    } catch (e) {
      currentLang = 'fr';
    }

    function applyLanguage(lang) {
      currentLang = lang === 'en' ? 'en' : 'fr';
      localStorage.setItem('lang', currentLang);
      document.documentElement.lang = currentLang;

      const dict = I18N[currentLang] || I18N.fr;

      const langBtn = document.getElementById('langToggleBtn');
      if (langBtn) {
        langBtn.textContent = currentLang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR';
      }

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
          if (el.getAttribute('data-i18n-html') === 'true') {
            el.innerHTML = dict[key];
          } else {
            el.textContent = dict[key];
          }
        }
      });

      const searchInp = document.getElementById('searchInput');
      if (searchInp) searchInp.placeholder = dict.search_ph;

      const regSelect = document.getElementById('regionSelect');
      if (regSelect) {
        const regMap = {
          all: dict.region_all,
          worldwide: dict.region_ww,
          france: dict.region_fr,
          europe: dict.region_eu,
          americas: dict.region_us,
          apac_mea: dict.region_apac
        };
        for (const opt of regSelect.options) {
          if (regMap[opt.value]) opt.textContent = regMap[opt.value];
        }
      }

      const catSelect = document.getElementById('categorySelect');
      if (catSelect) {
        const catMap = {
          all: dict.cat_all,
          tech: dict.cat_tech,
          devops: dict.cat_devops,
          data_ai: dict.cat_data,
          design: dict.cat_design,
          product: dict.cat_product,
          marketing_sales: dict.cat_mktg
        };
        for (const opt of catSelect.options) {
          if (catMap[opt.value]) opt.textContent = catMap[opt.value];
        }
      }

      const contSelect = document.getElementById('contractSelect');
      if (contSelect) {
        const contMap = {
          all: dict.contract_all,
          cdi_fulltime: dict.contract_cdi,
          freelance_contract: dict.contract_free,
          cdd_parttime: dict.contract_cdd,
          internship: dict.contract_intern
        };
        for (const opt of contSelect.options) {
          if (contMap[opt.value]) opt.textContent = contMap[opt.value];
        }
      }

      const salSelect = document.getElementById('salarySelect');
      if (salSelect) {
        const salMap = {
          '0': dict.salary_all,
          '50000': dict.salary_50,
          '75000': dict.salary_75,
          '100000': dict.salary_100,
          '130000': dict.salary_130
        };
        for (const opt of salSelect.options) {
          if (salMap[opt.value]) opt.textContent = salMap[opt.value];
        }
      }

      const sortSel = document.getElementById('sortSelect');
      if (sortSel) {
        const sortMap = {
          recent: dict.sort_recent,
          salary_desc: dict.sort_salary,
          company: dict.sort_company
        };
        for (const opt of sortSel.options) {
          if (sortMap[opt.value]) opt.textContent = sortMap[opt.value];
        }
      }

      const qEmail = document.getElementById('quickEmail');
      if (qEmail) qEmail.placeholder = dict.digest_input_ph;

      renderDynamicQuickChips();
      renderActiveView();
    }

    window.toggleLanguage = function() {
      const nextLang = currentLang === 'fr' ? 'en' : 'fr';
      applyLanguage(nextLang);
      showToast(nextLang === 'en' ? 'Switched to English 🇬🇧' : 'Passage en Français 🇫🇷');
    };

    // Theme Management
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
        // Dropdown "···"
    const moreDropdownBtn = document.getElementById('moreDropdownBtn');
    const moreDropdownMenu = document.getElementById('moreDropdownMenu');
    if (moreDropdownBtn && moreDropdownMenu) {
      moreDropdownBtn.onclick = (e) => {
        e.stopPropagation();
        moreDropdownMenu.classList.toggle('show');
      };
      document.addEventListener('click', () => {
        moreDropdownMenu.classList.remove('show');
      });
    }

    // Toast
    function showToast(msg) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      if (!toast || !toastMsg) return;
      toastMsg.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Modal Alertes
    window.openAlertModal = function() {
      const m = document.getElementById('alertModal');
      if (m) m.classList.add('open');
    };
    const alertModalCloseBtn = document.getElementById('alertModalCloseBtn');
    if (alertModalCloseBtn) {
      alertModalCloseBtn.onclick = () => document.getElementById('alertModal').classList.remove('open');
    }

    // Modal Job Details
    const jobModal = document.getElementById('jobModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    if (modalCloseBtn) {
      modalCloseBtn.onclick = () => jobModal.classList.remove('open');
    }
    if (jobModal) {
      jobModal.onclick = (e) => {
        if (e.target === jobModal) jobModal.classList.remove('open');
      };
    }

    function timeAgo(dateStr, lang = 'fr') {
      if (!dateStr) return lang === 'fr' ? 'Récemment' : 'Recently';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return lang === 'fr' ? 'Récemment' : 'Recently';
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 3600) {
        const mins = Math.max(1, Math.floor(diffSec / 60));
        return lang === 'fr' ? \`Il y a \${mins} min\` : \`\${mins}m ago\`;
      }
      if (diffSec < 86400) {
        const hours = Math.floor(diffSec / 3600);
        return lang === 'fr' ? \`Il y a \${hours} h\` : \`\${hours}h ago\`;
      }
      const days = Math.floor(diffSec / 86400);
      if (days === 1) return lang === 'fr' ? 'Hier' : 'Yesterday';
      if (days < 30) return lang === 'fr' ? \`Il y a \${days} j\` : \`\${days}d ago\`;
      const months = Math.floor(days / 30);
      return lang === 'fr' ? \`Il y a \${months} mois\` : \`\${months}mo ago\`;
    }

    function formatInlineMarkdown(str) {
      return str
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong style="font-weight:700; color:var(--text);">$1</strong>')
        .replace(/__(.*?)__/g, '<strong style="font-weight:700; color:var(--text);">$1</strong>')
        .replace(/\\*([^\\*\\n]+)\\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        .replace(new RegExp('\\x60([^\\x60]+)\\x60', 'g'), '<code style="background:var(--meta-bg); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-size:0.88em;">$1</code>');
    }

    function renderMarkdownToHtml(text) {
      if (!text) return '';
      const rawText = String(text);
      const rawLines = rawText.split('\\n');
      const htmlParts = [];
      let inList = false;
      let currentListItems = [];
      let currentParagraphLines = [];

      function flushParagraph() {
        if (currentParagraphLines.length > 0) {
          const pText = currentParagraphLines.join('<br>');
          htmlParts.push('<p style="margin-bottom:0.75rem; line-height:1.7;">' + formatInlineMarkdown(pText) + '</p>');
          currentParagraphLines = [];
        }
      }

      function flushList() {
        if (inList && currentListItems.length > 0) {
          const itemsHtml = currentListItems
            .map(function(it) { return '<li style="margin-bottom:0.35rem; line-height:1.6;">' + formatInlineMarkdown(it) + '</li>'; })
            .join('');
          htmlParts.push('<ul style="margin:0.5rem 0 0.85rem 1.25rem; padding:0; list-style-type:disc;">' + itemsHtml + '</ul>');
          currentListItems = [];
          inList = false;
        }
      }

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const trimmed = line.trim();

        if (!trimmed) {
          flushParagraph();
          continue;
        }

        if (/^#{1,4}\\s+/.test(trimmed)) {
          flushParagraph();
          flushList();
          if (/^###\\s+/.test(trimmed)) {
            htmlParts.push('<h4 style="font-size:1.05rem; font-weight:800; color:var(--text); margin:1.25rem 0 0.4rem;">' + formatInlineMarkdown(trimmed.replace(/^###\\s+/, '')) + '</h4>');
          } else if (/^##\\s+/.test(trimmed)) {
            htmlParts.push('<h3 style="font-size:1.15rem; font-weight:800; color:var(--text); margin:1.5rem 0 0.5rem;">' + formatInlineMarkdown(trimmed.replace(/^##\\s+/, '')) + '</h3>');
          } else if (/^#\\s+/.test(trimmed)) {
            htmlParts.push('<h2 style="font-size:1.25rem; font-weight:800; color:var(--text); margin:1.75rem 0 0.6rem;">' + formatInlineMarkdown(trimmed.replace(/^#\\s+/, '')) + '</h2>');
          } else {
            htmlParts.push('<h5 style="font-size:1rem; font-weight:700; color:var(--text); margin:1rem 0 0.3rem;">' + formatInlineMarkdown(trimmed.replace(/^#{4,}\\s+/, '')) + '</h5>');
          }
          continue;
        }

        if (/^([*•\\-+]\s+|\\d+\\.\\s+)/.test(trimmed)) {
          flushParagraph();
          inList = true;
          currentListItems.push(trimmed.replace(/^([*•\\-+]\s+|\\d+\\.\\s+)/, ''));
          continue;
        }

        if (inList) {
          flushList();
        }
        currentParagraphLines.push(trimmed);
      }

      flushParagraph();
      flushList();

      return htmlParts.join('');
    }

    function cleanSnippet(text) {
      if (!text) return '';
      return String(text)
        .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, '')
        .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '')
        .replace(/<br\\s*[\\/]?>/gi, '\\n')
        .replace(/<\\/p>/gi, '\\n\\n')
        .replace(/<\\/li>/gi, '\\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[ \\t]+/g, ' ')
        .trim();
    }

    function openJobModal(jobId) {
      const job = JOBS_DATA.find(j => j.id === jobId);
      if (!job) return;

      document.getElementById('modalTitle').textContent = job.title;
      document.getElementById('modalCompany').textContent = job.company;
      
      const avatar = document.getElementById('modalAvatar');
      const initial = (job.company || 'C')[0].toUpperCase();
      if (job.company_logo) {
        avatar.innerHTML = \`<img src="\${escapeAttr(job.company_logo)}" alt="\${escapeAttr(job.company)}" onerror="this.parentElement.textContent='\${escapeAttr(initial)}'" />\`;
      } else {
      avatar.textContent = initial;
      }

      const body = document.getElementById('modalBody');
      const salaryHtml = job.salary ? \`<div class="tag-badge tag-salary" style="display:inline-block; margin-bottom:0.75rem;">💰 \${escapeHtml(job.salary)}</div>\` : '';
      const tagsHtml = (job.tags || []).map(t => \`<span class="tag-badge">#\${escapeHtml(t)}</span>\`).join(' ');
      const rawCleanDesc = cleanSnippet(job.description_snippet);
      let cleanDesc = rawCleanDesc;
      if (!cleanDesc || cleanDesc.length < 120 || cleanDesc.endsWith('...')) {
        const cleanTitle = (job.title || '').replace(/\.\.\.$/, '').trim();
        const company = job.company || 'Entreprise';
        const region = job.region || 'Worldwide';
        const contract = job.contractType || 'CDI';
        const tagsStr = (job.tags && job.tags.length > 0) ? job.tags.join(', ') : '';

        if (currentLang === 'fr') {
          cleanDesc = "Opportunité 100% télétravail : " + cleanTitle + " chez " + company + " (" + region + ")." + String.fromCharCode(10) + String.fromCharCode(10) +
            "• Type de contrat : " + contract + String.fromCharCode(10) +
            (tagsStr ? "• Stack & Compétences clés : " + tagsStr + String.fromCharCode(10) : "") +
            (job.salary ? "• Rémunération indicative : " + job.salary + String.fromCharCode(10) : "") +
            String.fromCharCode(10) + "L'employeur recrute activement sur cette position 100% remote. Pour consulter le cahier des charges complet, les critères d'éligibilité et postuler, accédez directement à l'annonce officielle via le lien ci-dessous.";
        } else {
          cleanDesc = "100% Remote Opportunity: " + cleanTitle + " at " + company + " (" + region + ")." + String.fromCharCode(10) + String.fromCharCode(10) +
            "• Contract Type: " + contract + String.fromCharCode(10) +
            (tagsStr ? "• Key Skills & Tech Stack: " + tagsStr + String.fromCharCode(10) : "") +
            (job.salary ? "• Compensation: " + job.salary + String.fromCharCode(10) : "") +
            String.fromCharCode(10) + "The employer is actively hiring for this 100% telecommute position. To view the complete requirements, key responsibilities, and apply, access the official job posting via the link below.";
        }
      }

      // Geo-Arbitrage values
      const salaryStr = (job.salary || '').trim();
      let minVal = job.salary_min_eur || 0;
      let maxVal = job.salary_max_eur || 0;
      let isUsd = (job.currency === 'USD' || salaryStr.includes('$') || /\\busd\\b/i.test(salaryStr));
      let isDaily = /\\b(tjm|jour|day|j)\\b/i.test(salaryStr);
      let isHourly = /\\b(hour|hr|heure|h)\\b/i.test(salaryStr) && !/\\b(month|an|mois|year)\\b/i.test(salaryStr);

      if (salaryStr) {
        const norm = salaryStr.replace(/(\\d+[\\d\\s,.]*)\\s*[kK]\\b/g, (_, p1) => {
          return String(parseInt(p1.replace(/[\\s,.]/g, ''), 10) * 1000);
        });
        const nums = (norm.match(/\\d+[\\d\\s,.]*/g) || [])
          .map(n => parseInt(n.replace(/[\\s,.]/g, ''), 10))
          .filter(n => !isNaN(n) && n > 0);
        if (nums.length > 0) {
          minVal = nums[0];
          maxVal = nums.length > 1 ? nums[1] : minVal;
          if (isDaily && minVal < 3000) { minVal = minVal * 218; maxVal = maxVal * 218; }
          else if (isHourly && minVal < 500) { minVal = minVal * 1800; maxVal = maxVal * 1800; }
          else if (minVal < 200 && /an|year|annual/i.test(salaryStr)) { minVal = minVal * 1000; maxVal = maxVal * 1000; }
        }
      }

      const hasSpecifiedSalary = minVal > 0;
      const baseSalary = hasSpecifiedSalary ? Math.round((minVal + maxVal) / 2) : 55000;
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
      const pppEquiv = Math.round(eurGross * livingMultiplier);
      const netSalariedMonthly = Math.round((eurGross * 0.77) / 12);
      const tjmEquiv = Math.round((eurGross / 218) * 1.5);

      body.innerHTML = \`
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
          <span class="tag-badge tag-contract">\${job.contractIcon || '💼'} \${escapeHtml(job.contractType || 'CDI')}</span>
          <span class="tag-badge">\${job.regionFlag || '🌍'} \${escapeHtml(job.region || 'Worldwide')}</span>
          \${salaryHtml}
        </div>

        <!-- Radar Geo-Arbitrage -->
        <div style="background:linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(16,185,129,0.06) 100%); border:1px solid rgba(37,99,235,0.2); border-radius:10px; padding:1rem; margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <div style="font-size:0.85rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:0.35rem;">
              <span>💶</span> <span>\${currentLang === 'fr' ? 'Estimation Pouvoir d\\'Achat & Salaire Net' : 'Purchasing Power & Net Salary Estimator'}</span>
            </div>
            <a href="/simulateur-salaire-remote" target="_blank" style="font-size:0.75rem; font-weight:700; color:var(--primary);">\${currentLang === 'fr' ? 'Simulateur →' : 'Simulator →'}</a>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:0.6rem; font-size:0.8rem;">
            <div style="background:var(--bg-card); border:1px solid var(--border); padding:0.6rem; border-radius:6px;">
              <div style="color:var(--text-muted); font-size:0.7rem; text-transform:uppercase;">\${currentLang === 'fr' ? 'Niveau de vie FR' : 'Living Equiv. (FR)'}</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--primary);">≈ \${pppEquiv.toLocaleString('fr-FR')} €</div>
            </div>
            <div style="background:var(--bg-card); border:1px solid var(--border); padding:0.6rem; border-radius:6px;">
              <div style="color:var(--text-muted); font-size:0.7rem; text-transform:uppercase;">\${currentLang === 'fr' ? 'Net Estimé' : 'Estimated Net'}</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--emerald);">≈ \${netSalariedMonthly.toLocaleString('fr-FR')} €/m</div>
            </div>
            <div style="background:var(--bg-card); border:1px solid var(--border); padding:0.6rem; border-radius:6px;">
              <div style="color:var(--text-muted); font-size:0.7rem; text-transform:uppercase;">\${currentLang === 'fr' ? 'TJM Freelance' : 'Freelance Day Rate'}</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text);">~\${tjmEquiv} € / j</div>
            </div>
          </div>
        </div>

        <div style="margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">
              \${currentLang === 'fr' ? '📝 Description & Missions' : '📝 Job Description & Overview'}
            </div>
            \${job.source ? \`<span style="font-size:0.75rem; color:var(--text-dim); background:var(--meta-bg); border:1px solid var(--border); padding:2px 6px; border-radius:4px;">Source : \${escapeHtml(job.source)}</span>\` : ''}
          </div>
          <div style="font-size:0.92rem; line-height:1.65; color:var(--text); max-height:280px; overflow-y:auto; background:var(--meta-bg); border:1px solid var(--border); border-radius:8px; padding:1rem 1.25rem;">
            \${cleanDesc ? renderMarkdownToHtml(cleanDesc) : (currentLang === 'fr' ? "<p>Consultez l'offre complète sur le site de l'employeur.</p>" : "<p>View full job details directly on the employer's website.</p>")}
          </div>
          \${(cleanDesc.length < 250 || cleanDesc.endsWith('...')) ? \`
            <div style="margin-top:0.45rem; font-size:0.8rem; text-align:right;">
              <a href="\${job.url || detailsUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); font-weight:700; text-decoration:underline;">
                \${currentLang === 'fr' ? 'Consulter le texte intégral de l\\'annonce ↗' : 'Read full text on employer site ↗'}
              </a>
            </div>
          \` : ''}
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:1.25rem;">
          \${tagsHtml}
        </div>

        <!-- AI Direct-to-DM Pitch Generator -->
        <div style="background:var(--bg-card); border:2px solid var(--primary); border-radius:10px; padding:1rem; margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.65rem;">
            <div style="font-size:0.85rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:0.35rem;">
              <span>⚡</span> <span>\${currentLang === 'fr' ? 'Postuler en Direct (Court-circuitez les ATS)' : 'Direct-to-DM Pitch (Bypass ATS)'}</span>
            </div>
            <a href="https://www.google.com/search?q=site:linkedin.com/in+%22\${encodeURIComponent(job.company)}%22+(CTO+OR+%22VP+Engineering%22+OR+%22Head+of+Talent%22+OR+Recruiter+OR+Founder)" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem; font-weight:700; background:#0a66c2; color:white; padding:4px 8px; border-radius:4px; text-decoration:none;">
              🔍 \${currentLang === 'fr' ? 'CTO sur LinkedIn ↗' : 'CTO on LinkedIn ↗'}
            </a>
          </div>
          <div style="position:relative;">
            <textarea id="modalPitchTextarea" readonly style="width:100%; min-height:120px; background:var(--meta-bg); border:1px solid var(--border); border-radius:6px; padding:0.75rem; font-size:0.83rem; color:var(--text); line-height:1.5; font-family:var(--font-sans); resize:vertical;"></textarea>
            <button id="modalCopyPitchBtn" onclick="copyModalPitch()" style="position:absolute; top:6px; right:6px; background:var(--bg-card); border:1px solid var(--border); color:var(--text); padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:700; cursor:pointer;">
              📋 \${currentLang === 'fr' ? 'Copier' : 'Copy'}
            </button>
          </div>
        </div>
      \`;

      // Pre-fill modal pitch
      setTimeout(() => {
        const pText = document.getElementById('modalPitchTextarea');
        if (pText) {
          const comp = job.company || (currentLang === 'fr' ? "l'équipe" : "the team");
          const title = job.title || (currentLang === 'fr' ? "ce poste" : "this role");
          const tags = (job.tags || []).filter(t => !['Remote', 'Worldwide', 'Full-time', 'CDI'].includes(t));
          const stack = tags.slice(0, 3).join(', ') || (currentLang === 'fr' ? "votre stack technique" : "your tech stack");

          if (currentLang === 'fr') {
            pText.value = [
              'Bonjour,',
              '',
              'J\\'ai vu que ' + comp + ' recrute un(e) ' + title + ' en 100% télétravail.',
              'Fort(e) d\\'une solide expertise sur ' + stack + ', j\\'ai développé des architectures scalables et livré des features critiques en totale autonomie à distance.',
              '',
              'Seriez-vous ouvert(e) à un bref échange informel de 10 min cette semaine ?',
              '',
              'Bien à vous,',
              '[Votre Prénom] [Votre Nom] — [Lien GitHub / Portfolio]'
            ].join(String.fromCharCode(10));
          } else {
            pText.value = [
              'Hi,',
              '',
              'I noticed that ' + comp + ' is looking for a ' + title + ' (100% Remote).',
              'With strong hands-on expertise in ' + stack + ', I have designed scalable architectures and shipped mission-critical features in fully distributed async setups.',
              '',
              'Would you be open for a quick 10-minute intro chat this week?',
              '',
              'Best regards,',
              '[Your Name] — [GitHub / Portfolio URL]'
            ].join(String.fromCharCode(10));
          }
        }
      }, 20);

      window.copyModalPitch = function() {
        const pText = document.getElementById('modalPitchTextarea');
        if (!pText) return;
        navigator.clipboard.writeText(pText.value).then(() => {
          showToast(currentLang === 'fr' ? 'Pitch copié ! Prêt à envoyer au Hiring Manager 🚀' : 'Pitch copied! Ready to send 🚀');
        });
      };

      const detailsUrl = \`\${window.location.origin}/jobs/\${encodeURIComponent(job.id)}\`;
      document.getElementById('modalSeoLink').href = detailsUrl;
      document.getElementById('modalApplyBtn').href = job.url || detailsUrl;

      document.getElementById('modalCopyBtn').onclick = () => {
        navigator.clipboard.writeText(detailsUrl).then(() => showToast(currentLang === 'fr' ? 'Lien copié dans le presse-papiers ! 🔗' : 'Link copied to clipboard! 🔗'));
      };

      jobModal.classList.add('open');
    }

    // Toggle Favorite
    window.toggleFavorite = function(e, jobId) {
      e.stopPropagation();
      if (favorites.has(jobId)) {
        favorites.delete(jobId);
        showToast(currentLang === 'fr' ? 'Offre retirée des favoris' : 'Removed from favorites');
      } else {
        favorites.add(jobId);
        showToast(currentLang === 'fr' ? 'Offre ajoutée aux favoris ❤️' : 'Added to favorites ❤️');
      }
      localStorage.setItem('fr_favs', JSON.stringify(Array.from(favorites)));
      updateFavCounters();
      renderActiveView();
    };

    // Toggle Favorites Filter in Header
    const favHeaderBtn = document.getElementById('favHeaderBtn');
    if (favHeaderBtn) {
      favHeaderBtn.onclick = () => {
        onlyFavorites = !onlyFavorites;
        favHeaderBtn.classList.toggle('active', onlyFavorites);
        renderActiveView();
      };
    }

    // Dynamic Quick Chips Calculation from real dataset
    function renderDynamicQuickChips() {
      const container = document.getElementById('quickChipsContainer');
      if (!container) return;

      const techKeywords = [
        'Python', 'PHP', 'Laravel', 'Symfony', 'Java', 'C#', 'C++', 'Go', 'Rust',
        'Ruby', 'React', 'TypeScript', 'JavaScript', 'Node', 'Vue', 'SQL', 'Swift',
        'Kotlin', 'Scala', 'Elixir', 'Flutter', 'Solidity', 'ABAP', 'OCaml', 'Haskell',
        'Clojure', 'DevOps', 'Kubernetes', 'AWS', 'Docker', 'AI', 'Fullstack', 'Backend'
      ];

      const counts = {};
      for (const kw of techKeywords) {
        counts[kw] = 0;
      }

      for (const job of JOBS_DATA) {
        const text = ((job.title || "") + " " + (job.company || "") + " " + (job.tags || []).join(" ")).toLowerCase();
        for (const kw of techKeywords) {
          if (text.includes(kw.toLowerCase())) {
            counts[kw]++;
          }
        }
      }

      const topKeywords = Object.entries(counts)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

      const chipsLabel = currentLang === 'fr' ? '💡 Populaire :' : '💡 Popular:';
      let html = \`<span class="chips-label">\${escapeHtml(chipsLabel)}</span>\`;
      for (const [kw, count] of topKeywords) {
        html += \`<button class="quick-chip" onclick="applyQuickChip('\${escapeAttr(kw)}')">\${escapeHtml(kw)} <span style="font-size:0.7rem; opacity:0.75;">(\${count})</span></button>\`;
      }
      html += \`<button class="quick-chip" onclick="applyQuickChip('CDI')">💼 \${currentLang === 'fr' ? 'CDI' : 'Full-time'}</button>\`;
      html += \`<button class="quick-chip" onclick="applyQuickChip('Freelance')">⚡ \${currentLang === 'fr' ? 'Freelance' : 'Contract'}</button>\`;

      container.innerHTML = html;
    }
    renderDynamicQuickChips();

    // Quick Chip Click Handler
    window.applyQuickChip = function(query) {
      const searchInput = document.getElementById('searchInput');
      if (!searchInput) return;

      if (query === 'CDI') {
        document.getElementById('contractSelect').value = 'cdi_fulltime';
        currentContract = 'cdi_fulltime';
      } else if (query === 'Freelance') {
        document.getElementById('contractSelect').value = 'freelance_contract';
        currentContract = 'freelance_contract';
      } else {
        searchInput.value = query;
        searchQuery = query.toLowerCase();
      }
      renderActiveView();
    };

    // Reset All Filters
    window.resetAllFilters = function() {
      searchQuery = '';
      currentRegion = 'all';
      currentCategory = 'all';
      currentContract = 'all';
      minSalary = 0;
      onlyFavorites = false;

      document.getElementById('searchInput').value = '';
      document.getElementById('regionSelect').value = 'all';
      document.getElementById('categorySelect').value = 'all';
      document.getElementById('contractSelect').value = 'all';
      document.getElementById('salarySelect').value = '0';
      if (favHeaderBtn) favHeaderBtn.classList.remove('active');

      renderActiveView();
    };

    // Filter Listeners
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (searchClear) searchClear.style.display = searchQuery ? 'block' : 'none';
        renderActiveView();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        renderActiveView();
      });
    }

    document.getElementById('regionSelect').addEventListener('change', (e) => {
      currentRegion = e.target.value;
      renderActiveView();
    });
    document.getElementById('categorySelect').addEventListener('change', (e) => {
      currentCategory = e.target.value;
      renderActiveView();
    });
    document.getElementById('contractSelect').addEventListener('change', (e) => {
      currentContract = e.target.value;
      renderActiveView();
    });
    document.getElementById('salarySelect').addEventListener('change', (e) => {
      minSalary = parseInt(e.target.value, 10) || 0;
      renderActiveView();
    });
    document.getElementById('sortSelect').addEventListener('change', (e) => {
      sortMode = e.target.value;
      renderActiveView();
    });

    // Keyboard shortcut (/)
    document.addEventListener('keydown', (e) => {
      if ((e.key === '/' || (e.metaKey && e.key === 'k')) && document.activeElement !== searchInput) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
    });

    // Filtering & Infinite Scroll Engine
    const PAGE_SIZE = 24;
    let filteredJobs = [];
    let currentRenderCount = 0;

    function getFilteredJobs() {
      return JOBS_DATA.filter(j => {
        if (onlyFavorites && !favorites.has(j.id)) return false;
        if (currentRegion !== 'all' && j.regionId !== currentRegion && j.regionId !== 'worldwide') return false;
        if (currentCategory !== 'all' && j.categoryId !== currentCategory) return false;
        if (currentContract !== 'all' && j.contractTypeId !== currentContract) return false;
        if (minSalary > 0 && (j.salary_min || 0) < minSalary && (j.salary_max || 0) < minSalary) return false;

        if (searchQuery) {
          const text = \`\${j.title} \${j.company} \${j.description_snippet || ''} \${(j.tags || []).join(' ')}\`.toLowerCase();
          if (!text.includes(searchQuery)) return false;
        }
        return true;
      }).sort((a, b) => {
        if (sortMode === 'salary_desc') return (b.salary_min || 0) - (a.salary_min || 0);
        if (sortMode === 'company') return (a.company || '').localeCompare(b.company || '');
        return new Date(b.published_at || 0) - new Date(a.published_at || 0);
      });
    }

    function renderActiveView() {
      filteredJobs = getFilteredJobs();
      const visibleCount = document.getElementById('visibleCount');
      if (visibleCount) visibleCount.textContent = filteredJobs.length;

      const resetBtn = document.getElementById('resetAllFiltersBtn');
      const hasActiveFilters = searchQuery || currentRegion !== 'all' || currentCategory !== 'all' || currentContract !== 'all' || minSalary > 0 || onlyFavorites;
      if (resetBtn) resetBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';

      const emptyState = document.getElementById('emptyState');
      const jobsGrid = document.getElementById('jobsGrid');
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      const allLoadedNotice = document.getElementById('allLoadedNotice');

      if (filteredJobs.length === 0) {
        if (jobsGrid) jobsGrid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        if (allLoadedNotice) allLoadedNotice.style.display = 'none';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      // Reset Progressive Render
      currentRenderCount = Math.min(PAGE_SIZE, filteredJobs.length);
      const initialChunk = filteredJobs.slice(0, currentRenderCount);
      if (jobsGrid) {
        jobsGrid.innerHTML = initialChunk.map(renderJobCardHtml).join('');
      }

      if (loadMoreBtn) {
        if (currentRenderCount >= filteredJobs.length) {
          loadMoreBtn.style.display = 'none';
          if (allLoadedNotice) allLoadedNotice.style.display = 'block';
        } else {
          loadMoreBtn.style.display = 'inline-block';
          loadMoreBtn.textContent = \`Charger plus d'offres (\${currentRenderCount} / \${filteredJobs.length}) ⬇\`;
          if (allLoadedNotice) allLoadedNotice.style.display = 'none';
        }
      }

      renderMarkdownTable(filteredJobs);
    }

    function renderJobCardHtml(j) {
      const isFav = favorites.has(j.id);
      const initial = (j.company || 'C')[0].toUpperCase();
      const avatarHtml = j.company_logo
        ? \`<img src="\${escapeAttr(j.company_logo)}" alt="\${escapeAttr(j.company)}" loading="lazy" onerror="this.parentElement.textContent='\${escapeAttr(initial)}'" />\`
        : escapeHtml(initial);

      const salaryTag = j.salary
        ? \`<span class="tag-badge tag-salary">💰 \${escapeHtml(j.salary)}</span>\`
        : '';

      const contractTag = \`<span class="tag-badge tag-contract">\${j.contractIcon || '💼'} \${escapeHtml(j.contractType || 'CDI')}</span>\`;
      const regionTag = \`<span class="tag-badge">\${j.regionFlag || '🌍'} \${escapeHtml(j.region || 'Worldwide')}</span>\`;

      const favTitle = currentLang === 'fr' ? "Sauvegarder l'offre" : "Save job";
      const detailsLabel = currentLang === 'fr' ? 'Détails ↗' : 'Details ↗';
      const tagsHtml = (j.tags || []).slice(0, 3).map(t => \`<span class="tag-badge">#\${escapeHtml(t)}</span>\`).join('');

      return \`
        <div class="job-card" onclick="openJobModal('\${escapeAttr(j.id)}')">
          <div>
            <button class="btn-card-fav \${isFav ? 'active' : ''}" onclick="toggleFavorite(event, '\${escapeAttr(j.id)}')" title="\${escapeAttr(favTitle)}">
              \${isFav ? '❤️' : '🤍'}
            </button>
            <div class="job-card-header">
              <div class="company-avatar">\${avatarHtml}</div>
              <div class="company-info">
                <div class="company-name">\${escapeHtml(j.company)}</div>
                <div class="job-title">\${escapeHtml(j.title)}</div>
              </div>
            </div>

            <div class="job-tags">
              \${contractTag}
              \${regionTag}
              \${salaryTag}
            </div>

            \${j.description_snippet ? \`<div style="font-size:0.83rem; color:var(--text-muted); line-height:1.45; margin-bottom:0.75rem; max-height:40px; overflow:hidden;">\${escapeHtml(cleanSnippet(j.description_snippet))}</div>\` : ''}
          </div>

          <div>
            <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:0.65rem;">
              \${tagsHtml}
            </div>
            <div class="job-card-footer">
              <span style="font-size:0.75rem; color:var(--text-dim); display:flex; align-items:center; gap:0.25rem;">⏱️ \${escapeHtml(timeAgo(j.published_at, currentLang))}</span>
              <span class="btn-apply-card">\${escapeHtml(detailsLabel)}</span>
            </div>
          </div>
        </div>
      \`;
    }

    window.loadMoreJobs = function() {
      if (currentRenderCount >= filteredJobs.length) return;
      const nextCount = Math.min(currentRenderCount + PAGE_SIZE, filteredJobs.length);
      const nextChunk = filteredJobs.slice(currentRenderCount, nextCount);
      currentRenderCount = nextCount;

      const jobsGrid = document.getElementById('jobsGrid');
      if (jobsGrid) {
        jobsGrid.insertAdjacentHTML('beforeend', nextChunk.map(renderJobCardHtml).join(''));
      }

      const loadMoreBtn = document.getElementById('loadMoreBtn');
      const allLoadedNotice = document.getElementById('allLoadedNotice');
      if (currentRenderCount >= filteredJobs.length) {
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        if (allLoadedNotice) allLoadedNotice.style.display = 'block';
      } else if (loadMoreBtn) {
        loadMoreBtn.textContent = currentLang === 'fr' ? \`Charger plus d'offres (\${currentRenderCount} / \${filteredJobs.length}) ⬇\` : \`Load more jobs (\${currentRenderCount} / \${filteredJobs.length}) ⬇\`;
      }
    };

    // IntersectionObserver for Infinite Scroll
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && currentRenderCount < filteredJobs.length) {
        loadMoreJobs();
      }
    }, { rootMargin: '300px' });

    const sentinel = document.getElementById('infiniteSentinel');
    if (sentinel) observer.observe(sentinel);

    // Markdown Table Renderer
    function renderMarkdownTable(list) {
      const tbody = document.getElementById('markdownTableBody');
      if (!tbody) return;
      const applyLabel = currentLang === 'fr' ? 'Postuler ↗' : 'Apply ↗';
      tbody.innerHTML = list.slice(0, 100).map(j => \`
        <tr>
          <td>\${j.regionFlag || '🌍'} \${escapeHtml(j.region || '')}</td>
          <td>\${escapeHtml(j.contractType || '')}</td>
          <td><strong>\${escapeHtml(j.title)}</strong></td>
          <td>\${escapeHtml(j.company)}</td>
          <td>\${escapeHtml(j.category || '')}</td>
          <td>\${escapeHtml(j.salary || '-')}</td>
          <td><a href="\${escapeAttr(j.url)}" target="_blank" style="color:var(--primary); font-weight:600;">\${escapeHtml(applyLabel)}</a></td>
        </tr>
      \`).join('');
    }

    // Markdown Copy Button
    const copyMdBtn = document.getElementById('copyMdBtn');
    if (copyMdBtn) {
      copyMdBtn.onclick = () => {
        const rows = filteredJobs.slice(0, 100).map(j => \`| \${j.region || 'Worldwide'} | \${j.contractType || 'CDI'} | [\${j.title}](\${j.url}) | \${j.company} | \${j.salary || '-'} |\`);
        const header = currentLang === 'fr'
          ? ['| Région | Type | Poste | Entreprise | Salaire |', '|---|---|---|---|---|'].join(String.fromCharCode(10))
          : ['| Region | Type | Role | Company | Salary |', '|---|---|---|---|---|'].join(String.fromCharCode(10));
        const md = header + String.fromCharCode(10) + rows.join(String.fromCharCode(10));
        navigator.clipboard.writeText(md).then(() => {
          showToast(currentLang === 'fr' ? 'Markdown copié dans le presse-papiers ! 📋' : 'Markdown copied to clipboard! 📋');
        });
      };
    }

    // View Switcher (Cards vs Markdown)
    const viewCardsBtn = document.getElementById('viewCardsBtn');
    const viewMdBtn = document.getElementById('viewMdBtn');
    const jobsGrid = document.getElementById('jobsGrid');
    const markdownView = document.getElementById('markdownView');
    const infiniteContainer = document.querySelector('.infinite-container');

    if (viewCardsBtn && viewMdBtn) {
      viewCardsBtn.onclick = () => {
        viewCardsBtn.classList.add('active');
        viewMdBtn.classList.remove('active');
        if (jobsGrid) jobsGrid.style.display = 'grid';
        if (markdownView) markdownView.style.display = 'none';
        if (infiniteContainer) infiniteContainer.style.display = 'block';
      };

      viewMdBtn.onclick = () => {
        viewMdBtn.classList.add('active');
        viewCardsBtn.classList.remove('active');
        if (jobsGrid) jobsGrid.style.display = 'none';
        if (markdownView) markdownView.style.display = 'block';
        if (infiniteContainer) infiniteContainer.style.display = 'none';
      };
    }

    // Quick Newsletter Handler
    window.handleQuickNewsletter = async function(e) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }
      const emailInput = document.getElementById('quickEmail');
      const email = emailInput ? emailInput.value.trim() : '';
      const btn = document.getElementById('quickEmailBtn');
      const feedback = document.getElementById('quickFeedback');

      if (!email) return false;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Inscription...';
      }

      try {
        const res = await fetch('/api/alerts/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, region_id: 'all', category_id: 'all', contract_type_id: 'all', frequency: 'daily' })
        });
        const data = await res.json().catch(() => ({}));

        if (feedback) feedback.style.display = 'block';
        if (res.ok && data.success) {
          if (feedback) {
            feedback.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
            feedback.style.color = '#10b981';
            feedback.textContent = '✓ Félicitations ! Vous recevrez le digest chaque matin à 08h00.';
          }
          showToast('Inscription au digest confirmée ! 📬');
          if (emailInput) emailInput.value = '';
          if (btn) { btn.disabled = false; btn.textContent = '✓ Inscrit'; }
        } else {
          if (feedback) {
            feedback.style.backgroundColor = 'rgba(225, 29, 72, 0.15)';
            feedback.style.color = '#e11d48';
            feedback.textContent = '✕ ' + (data.error || "Erreur lors de l'inscription.");
          }
          if (btn) { btn.disabled = false; btn.textContent = "🚀 S'inscrire"; }
        }
      } catch (err) {
        if (feedback) {
          feedback.style.display = 'block';
          feedback.style.backgroundColor = 'rgba(225, 29, 72, 0.15)';
          feedback.style.color = '#e11d48';
          feedback.textContent = '✕ Erreur : ' + err.message;
        }
        if (btn) { btn.disabled = false; btn.textContent = "🚀 S'inscrire"; }
      }
      return false;
    };

    // Alert Modal Submit Handler
    window.handleAlertSubmit = async function(e) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }
      const email = document.getElementById('alertEmail').value.trim();
      const region_id = document.getElementById('alertRegion').value;
      const category_id = document.getElementById('alertCategory').value;
      const contract_type_id = document.getElementById('alertContract').value;
      const frequency = document.getElementById('alertFrequency').value;
      const keywords = document.getElementById('alertKeywords').value.trim();
      const submitBtn = document.getElementById('alertSubmitBtn');
      const feedback = document.getElementById('alertFeedback');

      if (!email) return false;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enregistrement...';

      try {
        const res = await fetch('/api/alerts/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, region_id, category_id, contract_type_id, frequency, keywords })
        });
        const data = await res.json().catch(() => ({}));

        feedback.style.display = 'block';
        if (res.ok && data.success) {
          feedback.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
          feedback.style.color = '#10b981';
          feedback.textContent = '✓ Alerte configurée avec succès ! Un email de confirmation vous a été envoyé.';
          submitBtn.textContent = '✓ Alerte active';
          showToast('Alerte email activée ! 🔔');
          setTimeout(() => document.getElementById('alertModal').classList.remove('open'), 1500);
        } else {
          feedback.style.backgroundColor = 'rgba(225, 29, 72, 0.15)';
          feedback.style.color = '#e11d48';
          feedback.textContent = '✕ ' + (data.error || "Erreur lors de l'enregistrement.");
          submitBtn.disabled = false;
          submitBtn.textContent = '🚀 Enregistrer mon alerte';
        }
      } catch (err) {
        feedback.style.display = 'block';
        feedback.style.backgroundColor = 'rgba(225, 29, 72, 0.15)';
        feedback.style.color = '#e11d48';
        feedback.textContent = '✕ Erreur de connexion : ' + err.message;
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Enregistrer mon alerte';
      }
      return false;
    };

    function escapeHtml(str = '') {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    function escapeAttr(str = '') {
      return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    try {
      const tTok = localStorage.getItem('fullremote_talent_token');
      if (tTok) {
        const fLink = document.getElementById('footerTalentLink');
        if (fLink) {
          fLink.href = '/talents/manage?token=' + encodeURIComponent(tTok);
          fLink.textContent = '⚙️ Mon Espace Talent';
        }
        const mLink = document.getElementById('menuTalentLink');
        if (mLink) {
          mLink.href = '/talents/manage?token=' + encodeURIComponent(tTok);
          mLink.innerHTML = '⚙️ Mon Espace Talent';
          mLink.style.fontWeight = '700';
          mLink.style.color = 'var(--primary)';
        }
      }
    } catch (_) {}

    // Initial render & i18n boot
    applyLanguage(currentLang);
  </script>
</body>
</html>`;
}

/**
 * Page de confirmation de désinscription
 */
export function renderUnsubscribePage({ success, email, siteUrl = "https://remote-jobs.app" }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Désinscription — FullRemote Jobs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    body {
      margin: 0; padding: 0; background: #0b0f19; color: #f8fafc; font-family: 'Inter', system-ui, sans-serif;
      display: flex; align-items: center; justify-content: center; min-height: 100vh;
    }
    .box {
      background: #111726; border: 1px solid #1e293b; border-radius: 16px; padding: 40px 32px;
      max-width: 480px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px 0; color: #f8fafc; }
    p { font-size: 15px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0; }
    .btn {
      display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 600;
      padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">${success ? "👋" : "⚠️"}</div>
    <h1>${success ? "Désinscription confirmée" : "Lien invalide ou expiré"}</h1>
    <p>
      ${
        success
          ? `L'adresse <strong>${email}</strong> a bien été retirée de nos listes de diffusion. Vous ne recevrez plus aucune alerte quotidienne.`
          : "Ce lien de désinscription est invalide ou cette adresse a déjà été retirée."
      }
    </p>
    <a href="${siteUrl}" class="btn">Retourner sur FullRemote.Jobs ↗</a>
  </div>
</body>
</html>`;
}
