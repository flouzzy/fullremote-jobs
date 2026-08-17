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
  <meta property="og:url" content="https://remote-jobs.edounze.com" />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="https://remote-jobs.edounze.com" />
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
      letter-spacing: -0.02em;
    }
    .brand-accent { color: var(--primary); }

    .live-count-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 999px;
      background: var(--emerald-subtle);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.25);
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
    }
    .nav-link {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-muted);
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      transition: all 0.15s ease;
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
      gap: 0.6rem;
    }

    .btn-fav-header {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.45rem 0.8rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-muted);
      cursor: pointer;
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
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.45rem 0.95rem;
      border-radius: 8px;
      background: var(--primary);
      color: #ffffff !important;
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
      margin-bottom: 2rem;
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
      <nav class="header-nav">
        <a href="/" class="nav-link active">Explorer</a>
        <a href="/simulateur-salaire-remote" class="nav-link">💶 Simulateur</a>
        <button class="nav-link" style="border:none; background:transparent; cursor:pointer;" onclick="openAlertModal()">🔔 Alertes</button>
      </nav>

      <!-- Right: Action CTA & Utilities -->
      <div class="header-right">
        <button id="favHeaderBtn" class="btn-fav-header" title="Afficher mes offres sauvegardées">
          <span>❤️</span> <span class="hide-mobile">Favoris</span> (<span id="favCount">0</span>)
        </button>

        <a href="/post-a-job" class="btn-post-header">
          <span>+</span> <span>Publier <span class="hide-mobile">(49€)</span></span>
        </a>

        <button id="themeToggleBtn" class="btn-icon-header" title="Changer de thème">
          🌙
        </button>

        <!-- Dropdown "···" for secondary developer resources -->
        <div class="dropdown-container">
          <button id="moreDropdownBtn" class="btn-icon-header" title="Plus d'outils (API, RSS, Docs)">
            ···
          </button>
          <div id="moreDropdownMenu" class="dropdown-menu">
            <a href="/simulateur-salaire-remote" class="dropdown-item">💶 Simulateur Salaire</a>
            <a href="/llms.txt" class="dropdown-item">🤖 Index llms.txt</a>
            <a href="/rss" target="_blank" class="dropdown-item">📡 Flux RSS 2.0</a>
            <a href="/api/jobs" target="_blank" class="dropdown-item">⚡ API REST JSON</a>
            <a href="/openapi.json" target="_blank" class="dropdown-item">📑 Schéma OpenAPI</a>
            <a href="https://github.com/flouzzy/fullremote-jobs" target="_blank" class="dropdown-item">★ GitHub Repo</a>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- 2. HERO SECTION -->
  <main class="container">
    <section class="hero-section">
      <h1 class="hero-title">Trouvez votre prochain job <span class="brand-accent">100% télétravail</span>.</h1>
      <p class="hero-subtitle">Le répertoire vérifié des meilleures opportunités sans restriction géographique (CDI, Freelance, CDD, Stage). Accès direct et sans intermédiaire.</p>
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

      <!-- Quick Chips Suggestions -->
      <div class="quick-chips-row">
        <span class="chips-label">💡 Populaire :</span>
        <button class="quick-chip" onclick="applyQuickChip('React')">React</button>
        <button class="quick-chip" onclick="applyQuickChip('Go')">Go / Golang</button>
        <button class="quick-chip" onclick="applyQuickChip('Python')">Python</button>
        <button class="quick-chip" onclick="applyQuickChip('DevOps')">DevOps</button>
        <button class="quick-chip" onclick="applyQuickChip('AI')">IA & LLM</button>
        <button class="quick-chip" onclick="applyQuickChip('Stripe')">Stripe</button>
        <button class="quick-chip" onclick="applyQuickChip('CDI')">💼 CDI</button>
        <button class="quick-chip" onclick="applyQuickChip('Freelance')">⚡ Freelance</button>
      </div>
    </section>

    <!-- 4. TOOLBAR SECTION -->
    <section class="toolbar-section">
      <div class="results-count-wrapper">
        <span>Affichage de <span class="count-number" id="visibleCount">0</span> offre(s)</span>
        <button id="resetAllFiltersBtn" class="reset-all-btn" onclick="resetAllFilters()">✕ Réinitialiser</button>
      </div>

      <div class="view-controls">
        <div class="segmented-control">
          <button id="viewCardsBtn" class="segment-btn active" title="Vue Cartes">
            <span>🗂️</span> <span class="hide-mobile">Cartes</span>
          </button>
          <button id="viewMdBtn" class="segment-btn" title="Vue Markdown">
            <span>📋</span> <span class="hide-mobile">Markdown</span>
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
        <h2 style="font-size:1.05rem; font-weight:700;">Catalogue au format Markdown (LLM & Agent friendly)</h2>
        <button id="copyMdBtn" class="btn-post-header" style="border:none; cursor:pointer;">
          📋 Copier tout le Markdown
        </button>
      </div>
      <table class="markdown-table" id="markdownTable">
        <thead>
          <tr>
            <th>Région</th>
            <th>Type</th>
            <th>Poste</th>
            <th>Entreprise</th>
            <th>Catégorie</th>
            <th>Salaire</th>
            <th>Lien</th>
          </tr>
        </thead>
        <tbody id="markdownTableBody"></tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div id="emptyState" class="empty-state" style="display:none;">
      <div class="empty-state-icon">🔎</div>
      <h3 style="color:var(--text); margin-bottom:0.4rem; font-size:1.15rem; font-weight:700;">Aucune offre correspondante</h3>
      <p style="color:var(--text-muted); font-size:0.9rem;">Essayez d'élargir vos filtres ou effectuez une recherche par mot-clé.</p>
      <button onclick="resetAllFilters()" class="btn-load-more" style="margin-top:1rem;">
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
        <a id="modalSeoLink" href="#" target="_blank" class="btn-fav-header" title="Ouvrir la page détaillée de l'offre">
          📄 Fiche détaillée
        </a>
        <button id="modalCopyBtn" class="btn-fav-header" title="Copier le lien">
          🔗 Copier lien
        </button>
        <a id="modalApplyBtn" href="#" target="_blank" rel="noopener noreferrer" class="btn-post-header">
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
            <h3 style="font-size:1.05rem; font-weight:700; color:var(--text);">Créer une alerte personnalisée</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">Recevez chaque matin à 08h00 les offres adaptées à vos critères.</p>
          </div>
        </div>
        <button id="alertModalCloseBtn" class="btn-icon-header" style="width:32px; height:32px;">✕</button>
      </div>
      <form id="alertForm" class="modal-body" action="javascript:void(0);" onsubmit="event.preventDefault(); handleAlertSubmit(event); return false;" style="display:flex; flex-direction:column; gap:1rem;">
        <div class="form-group">
          <label class="form-label" for="alertEmail">Votre adresse Email <span style="color:var(--rose);">*</span></label>
          <input type="email" id="alertEmail" class="form-input" required placeholder="alex@exemple.com" />
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="form-group">
            <label class="form-label" for="alertRegion">Région autorisée</label>
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
            <label class="form-label" for="alertCategory">Métier / Domaine</label>
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
            <label class="form-label" for="alertContract">Type de contrat</label>
            <select id="alertContract" class="form-select">
              <option value="all">📋 Tous les contrats</option>
              <option value="cdi_fulltime">💼 CDI / Full-time</option>
              <option value="freelance_contract">⚡ Freelance</option>
              <option value="cdd_parttime">⏳ CDD / Part-time</option>
              <option value="internship">🎓 Stage</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="alertFrequency">Fréquence</label>
            <select id="alertFrequency" class="form-select">
              <option value="daily">🌅 Chaque matin (08h00)</option>
              <option value="weekly">📅 Hebdomadaire (Lundi)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="alertKeywords">Mots-clés optionnels</label>
          <input type="text" id="alertKeywords" class="form-input" placeholder="ex: react, golang, rust, devops..." />
        </div>
        <div id="alertFeedback" style="display:none; font-size:0.85rem; padding:0.6rem 0.8rem; border-radius:6px;"></div>
        <button type="submit" id="alertSubmitBtn" class="btn-post-header" style="justify-content:center; padding:0.75rem; font-size:0.9rem; border:none; cursor:pointer; width:100%;">
          🚀 Enregistrer mon alerte gratuite
        </button>
      </form>
    </div>
  </div>

  <!-- Newsletter Capture Section -->
  <section style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 3rem 0;">
    <div class="container" style="max-width: 620px; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 0.4rem;">📬</div>
      <h2 style="font-size: 1.45rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; color: var(--text);">Le Digest Quotidien du Full Remote</h2>
      <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.55;">Recevez chaque matin à 08h00 les 10 meilleures opportunités vérifiées 100% télétravail directement dans votre boîte mail. 0 spam, désinscription en 1 clic.</p>
      <form id="quickNewsletterForm" action="javascript:void(0);" onsubmit="event.preventDefault(); handleQuickNewsletter(event); return false;" style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
        <input type="email" id="quickEmail" required placeholder="Votre adresse email (ex: alex@gmail.com)" class="form-input" style="max-width: 340px; background: var(--bg-card);" />
        <button type="submit" id="quickEmailBtn" class="btn-post-header" style="border: none; padding: 0.65rem 1.4rem; cursor: pointer;">
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
          <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.55; max-width:320px;">
            L'annuaire mondial des carrières 100% télétravail. Développé et maintenu par <a href="https://edounze.com" target="_blank" style="color:var(--primary); font-weight:600;">Charles EDOU NZE</a>.
          </p>
        </div>
        <div>
          <div class="footer-col-title">Plateforme</div>
          <div class="footer-col-links">
            <a href="/">Explorer les offres</a>
            <a href="/simulateur-salaire-remote">Simulateur Salaire</a>
            <a href="/post-a-job">Publier une offre (49€)</a>
            <a href="javascript:void(0);" onclick="openAlertModal()">Créer une alerte email</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title">IA & Développeurs</div>
          <div class="footer-col-links">
            <a href="/llms.txt">Standard llms.txt</a>
            <a href="/llms-full.txt">Catalogue Markdown</a>
            <a href="/api/jobs">API REST JSON</a>
            <a href="/openapi.json">Spécification OpenAPI</a>
            <a href="/mcp">Serveur MCP</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title">Ressources</div>
          <div class="footer-col-links">
            <a href="/rss" target="_blank">Flux RSS 2.0</a>
            <a href="/sitemap.xml" target="_blank">Sitemap XML</a>
            <a href="https://github.com/flouzzy/fullremote-jobs" target="_blank">Code Source GitHub</a>
            <a href="https://remote-jobs.edounze.com">remote-jobs.edounze.com</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div>© 2026 FullRemote.Jobs — Tous droits réservés.</div>
        <div>Indexation continue • 9 sources mondiales agrégées</div>
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

    function cleanSnippet(text) {
      if (!text) return '';
      try {
        const div = document.createElement('div');
        div.innerHTML = String(text);
        return (div.textContent || div.innerText || '').replace(/\\s+/g, ' ').trim();
      } catch (e) {
        return String(text).replace(/<[^>]+>/g, ' ').trim();
      }
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

      const cleanDesc = cleanSnippet(job.description_snippet);

      body.innerHTML = \`
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
          <span class="tag-badge tag-contract">\${job.contractIcon || '💼'} \${escapeHtml(job.contractType || 'CDI')}</span>
          <span class="tag-badge">\${job.regionFlag || '🌍'} \${escapeHtml(job.region || 'Worldwide')}</span>
          \${salaryHtml}
        </div>
        <div style="font-size:0.92rem; line-height:1.6; color:var(--text); margin-bottom:1.25rem;">
          \${cleanDesc ? escapeHtml(cleanDesc) : "Consultez l'offre complète sur le site de l'employeur."}
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:1rem;">
          \${tagsHtml}
        </div>
      \`;

      const detailsUrl = \`https://remote-jobs.edounze.com/jobs/\${encodeURIComponent(job.id)}\`;
      document.getElementById('modalSeoLink').href = detailsUrl;
      document.getElementById('modalApplyBtn').href = job.url || detailsUrl;

      document.getElementById('modalCopyBtn').onclick = () => {
        navigator.clipboard.writeText(detailsUrl).then(() => showToast('Lien copié dans le presse-papiers ! 🔗'));
      };

      jobModal.classList.add('open');
    }

    // Toggle Favorite
    window.toggleFavorite = function(e, jobId) {
      e.stopPropagation();
      if (favorites.has(jobId)) {
        favorites.delete(jobId);
        showToast('Offre retirée des favoris');
      } else {
        favorites.add(jobId);
        showToast('Offre ajoutée aux favoris ❤️');
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

      const tagsHtml = (j.tags || []).slice(0, 3).map(t => \`<span class="tag-badge">#\${escapeHtml(t)}</span>\`).join('');

      return \`
        <div class="job-card" onclick="openJobModal('\${escapeAttr(j.id)}')">
          <div>
            <button class="btn-card-fav \${isFav ? 'active' : ''}" onclick="toggleFavorite(event, '\${escapeAttr(j.id)}')" title="Sauvegarder l'offre">
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

          <div class="job-card-footer">
            <div>\${tagsHtml}</div>
            <span class="btn-apply-card">Détails ↗</span>
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
        loadMoreBtn.textContent = \`Charger plus d'offres (\${currentRenderCount} / \${filteredJobs.length}) ⬇\`;
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
      tbody.innerHTML = list.slice(0, 100).map(j => \`
        <tr>
          <td>\${j.regionFlag || '🌍'} \${escapeHtml(j.region || '')}</td>
          <td>\${escapeHtml(j.contractType || '')}</td>
          <td><strong>\${escapeHtml(j.title)}</strong></td>
          <td>\${escapeHtml(j.company)}</td>
          <td>\${escapeHtml(j.category || '')}</td>
          <td>\${escapeHtml(j.salary || '-')}</td>
          <td><a href="\${escapeAttr(j.url)}" target="_blank" style="color:var(--primary); font-weight:600;">Postuler ↗</a></td>
        </tr>
      \`).join('');
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

    // Initial render
    renderActiveView();
  </script>
</body>
</html>`;
}

/**
 * Page de confirmation de désinscription
 */
export function renderUnsubscribePage({ success, email, siteUrl = "https://remote-jobs.edounze.com" }) {
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
