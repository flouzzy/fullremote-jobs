/**
 * FullRemote-Jobs - Interface Utilisateur Web Réactive & Moderne
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
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Full Remote Jobs — Les meilleurs emplois 100% Télétravail (FR / EN)</title>
  <meta name="description" content="Annuaire des meilleures offres d'emploi 100% full remote (CDI, Freelance, CDD, Stage) en anglais et en français. Accès libre, direct et sans inscription." />
  <meta property="og:title" content="Full Remote Jobs — 100% Télétravail (CDI / Freelance / CDD)" />
  <meta property="og:description" content="Trouvez votre prochain job 100% remote en CDI, Freelance, CDD ou Stage en France, Europe et Worldwide." />
  <meta property="og:url" content="https://fullremote-jobs.edounze.com" />
  <meta property="og:type" content="website" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌍</text></svg>">
  <style>
    :root {
      --bg: #090d16;
      --bg-card: #111726;
      --bg-card-hover: #172033;
      --border: #1e293b;
      --border-focus: #3b82f6;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --accent: #06b6d4;
      --emerald: #10b981;
      --emerald-bg: rgba(16, 185, 129, 0.12);
      --amber: #f59e0b;
      --amber-bg: rgba(245, 158, 11, 0.12);
      --rose: #f43f5e;
      --radius: 12px;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
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
    }

    a { color: inherit; text-decoration: none; }

    .container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 1.5rem;
      width: 100%;
    }

    /* Header */
    header {
      border-bottom: 1px solid var(--border);
      background: rgba(9, 13, 22, 0.88);
      backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 68px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      font-size: 1.2rem;
      letter-spacing: -0.02em;
    }

    .brand-logo { font-size: 1.5rem; line-height: 1; }

    .brand-tag {
      background: rgba(59, 130, 246, 0.12);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
      border: 1px solid transparent;
      transition: all 0.15s ease;
      cursor: pointer;
    }

    .nav-btn:hover {
      color: var(--text);
      background: var(--bg-card);
      border-color: var(--border);
    }

    .nav-btn-fav {
      background: rgba(244, 63, 94, 0.1);
      color: #fb7185;
      border-color: rgba(244, 63, 94, 0.2);
    }

    .nav-btn-fav:hover {
      background: rgba(244, 63, 94, 0.2);
      color: #f43f5e;
    }

    .nav-btn-primary {
      background: var(--primary);
      color: white;
    }

    .nav-btn-primary:hover {
      background: var(--primary-hover);
      color: white;
    }

    /* Hero */
    .hero {
      padding: 2.75rem 0 2rem;
      text-align: center;
      border-bottom: 1px solid rgba(30, 41, 59, 0.6);
      background: radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 65%);
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 0.35rem 0.95rem;
      border-radius: 999px;
      font-size: 0.8125rem;
      color: var(--accent);
      margin-bottom: 1.15rem;
      font-weight: 500;
    }

    .hero-badge .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: var(--emerald);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--emerald);
    }

    .hero h1 {
      font-size: 2.4rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 0.85rem;
      max-width: 840px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero h1 span {
      background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 720px;
      margin: 0 auto;
    }

    /* Controls Bar */
    .controls-section {
      padding: 1.5rem 0 1rem;
      position: sticky;
      top: 68px;
      background: rgba(9, 13, 22, 0.95);
      backdrop-filter: blur(12px);
      z-index: 30;
      border-bottom: 1px solid var(--border);
    }

    .search-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
      align-items: center;
    }

    .search-wrapper {
      position: relative;
      flex: 1;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-dim);
      font-size: 1.05rem;
    }

    .search-input {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.7rem 2.5rem 0.7rem 2.65rem;
      border-radius: var(--radius);
      font-size: 0.92rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .search-input:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .search-clear {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-dim);
      cursor: pointer;
      font-size: 1.1rem;
      display: none;
    }

    .search-clear:hover { color: var(--text); }

    .view-toggle-btns {
      display: flex;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 3px;
    }

    .view-btn {
      padding: 0.45rem 0.8rem;
      border-radius: 8px;
      border: none;
      background: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.825rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.15s ease;
    }

    .view-btn.active {
      background: var(--primary);
      color: white;
    }

    /* Filter Groups */
    .filter-groups {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .filter-pills {
      display: flex;
      gap: 0.45rem;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }

    .filter-pills::-webkit-scrollbar { display: none; }

    .pill {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .pill:hover {
      border-color: #334155;
      color: var(--text);
      background: var(--bg-card-hover);
    }

    .pill.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    .pill.pill-contract.active {
      background: #4f46e5;
      border-color: #6366f1;
      color: white;
    }

    .pill.pill-toggle.active {
      background: #059669;
      border-color: #10b981;
      color: white;
    }

    /* Main Content */
    main {
      flex: 1;
      padding: 1.75rem 0 3.5rem;
    }

    .results-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .results-bar strong { color: var(--text); }

    /* Job Grid */
    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.25rem;
    }

    /* Job Card */
    .job-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      position: relative;
    }

    .job-card:hover {
      transform: translateY(-2px);
      border-color: #334155;
      box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.4);
      background: var(--bg-card-hover);
    }

    .job-card-top {
      display: flex;
      gap: 0.9rem;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .company-avatar {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.05rem;
      color: #94a3b8;
      flex-shrink: 0;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .company-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .job-title-wrap { flex: 1; min-width: 0; }

    .job-company {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .job-title {
      font-size: 1.02rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.35;
      margin-top: 0.15rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .btn-fav {
      background: none;
      border: none;
      color: var(--text-dim);
      font-size: 1.25rem;
      cursor: pointer;
      transition: transform 0.15s ease, color 0.15s ease;
      line-height: 1;
      padding: 2px;
    }

    .btn-fav:hover { transform: scale(1.15); color: #f43f5e; }
    .btn-fav.faved { color: #f43f5e; }

    .job-meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 0.75rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: 5px;
      font-weight: 500;
    }

    .badge-contract {
      background: rgba(99, 102, 241, 0.12);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.25);
      font-weight: 600;
    }

    .badge-region {
      background: rgba(59, 130, 246, 0.1);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .badge-category {
      background: rgba(168, 85, 247, 0.1);
      color: #d8b4fe;
      border: 1px solid rgba(168, 85, 247, 0.2);
    }

    .badge-salary {
      background: var(--emerald-bg);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.25);
      font-weight: 600;
    }

    .badge-lang {
      background: rgba(148, 163, 184, 0.08);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.18);
    }

    .job-snippet {
      font-size: 0.835rem;
      color: var(--text-dim);
      line-height: 1.5;
      margin-bottom: 0.9rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .job-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-bottom: 1rem;
    }

    .tag-item {
      background: #0d1424;
      border: 1px solid #1e293b;
      color: #94a3b8;
      font-size: 0.68rem;
      padding: 1px 6px;
      border-radius: 4px;
      font-family: var(--font-mono);
    }

    .job-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.85rem;
      border-top: 1px solid rgba(30, 41, 59, 0.7);
      font-size: 0.76rem;
      color: var(--text-dim);
    }

    .job-verified-tag {
      font-size: 0.75rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .job-actions {
      display: flex;
      gap: 0.4rem;
    }

    .btn-apply {
      background: var(--primary);
      color: white;
      font-weight: 600;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.78rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      transition: background 0.15s ease;
    }

    .btn-apply:hover { background: var(--primary-hover); }

    .btn-icon {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      color: var(--text-muted);
      width: 30px;
      height: 30px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 0.85rem;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text);
    }

    /* Markdown View */
    .markdown-view-wrapper {
      display: none;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.75rem;
      overflow-x: auto;
    }

    .markdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    .markdown-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.84rem;
      text-align: left;
    }

    .markdown-table th {
      background: #0d1424;
      color: var(--text-muted);
      padding: 0.65rem 0.9rem;
      border: 1px solid var(--border);
      font-weight: 600;
    }

    .markdown-table td {
      padding: 0.65rem 0.9rem;
      border: 1px solid var(--border);
      color: var(--text);
    }

    .markdown-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    /* Modal / Drawer */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-dialog {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      max-width: 680px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
      font-size: 0.9rem;
      line-height: 1.6;
      color: #cbd5e1;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--text-muted);
    }

    .empty-state-icon { font-size: 3rem; margin-bottom: 1rem; }

    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 2.25rem 0;
      margin-top: auto;
      background: #060910;
      font-size: 0.825rem;
      color: var(--text-dim);
    }

    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-links { display: flex; gap: 1.25rem; }
    .footer-links a:hover { color: var(--text); }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #1e293b;
      color: white;
      border: 1px solid #334155;
      padding: 0.65rem 1.15rem;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
      font-size: 0.85rem;
      z-index: 120;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .toast.show { transform: translateY(0); opacity: 1; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 1.8rem; }
      .jobs-grid { grid-template-columns: 1fr; }
      .controls-section { top: 60px; }
      .header-inner { height: 60px; }
      .hide-mobile { display: none; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="container header-inner">
      <a href="/" class="brand">
        <span class="brand-logo">🌍</span>
        <span class="brand-title">FullRemote<span style="color:var(--primary);">.Jobs</span></span>
        <span class="brand-tag">100% Remote</span>
      </a>

      <nav class="nav-links">
        <button id="navFavBtn" class="nav-btn nav-btn-fav" title="Voir mes favoris">
          <span>❤️</span> <span class="hide-mobile">Favoris</span> (<span id="favCount">0</span>)
        </button>
        <a href="/api/jobs" target="_blank" class="nav-btn">
          <span>⚡</span> <span class="hide-mobile">API JSON</span>
        </a>
        <a href="https://github.com/flouzzy/fullremote-jobs" target="_blank" class="nav-btn nav-btn-primary">
          <span>★</span> GitHub
        </a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="hero-badge">
        <span class="pulse-dot"></span>
        <span id="heroBadgeCount">${totalCount} offres 100% full remote disponibles</span>
      </div>
      <h1>L'annuaire mondial des jobs <span>100% Télétravail</span>.</h1>
      <p>Le répertoire vérifié des meilleures opportunités de carrière sans restriction de localisation (CDI, Freelance, CDD, Stage). Accès direct et sans inscription.</p>
    </div>
  </section>

  <!-- Controls Bar -->
  <div class="controls-section">
    <div class="container">
      <!-- Search Input & View Mode -->
      <div class="search-row">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            id="searchInput"
            class="search-input"
            placeholder="Filtrer par titre, techno, entreprise (ex: Go, React, Python, Stripe, DevOps, Freelance, CDI...)"
            autocomplete="off"
          />
          <button id="searchClear" class="search-clear" title="Effacer">✕</button>
        </div>

        <div class="view-toggle-btns">
          <button id="viewCardsBtn" class="view-btn active" title="Vue Cartes">
            <span>🗂️</span> <span class="hide-mobile">Cartes</span>
          </button>
          <button id="viewMdBtn" class="view-btn" title="Vue Markdown">
            <span>📋</span> <span class="hide-mobile">Markdown</span>
          </button>
        </div>
      </div>

      <!-- Filters Pills -->
      <div class="filter-groups">
        <!-- Regions -->
        <div class="filter-pills" id="regionFilters">
          <button class="pill active" data-region="all">🌍 Toutes les régions</button>
          <button class="pill" data-region="worldwide">🌍 Worldwide</button>
          <button class="pill" data-region="france">🇫🇷 France & Francophonie</button>
          <button class="pill" data-region="europe">🇪🇺 Europe</button>
          <button class="pill" data-region="americas">🇺🇸 Amériques</button>
          <button class="pill" data-region="apac_mea">🌏 Asie & MEA</button>
        </div>

        <!-- Contract Types (CDI, Freelance, CDD, Stage) -->
        <div class="filter-pills" id="contractFilters">
          <button class="pill pill-contract active" data-contract="all">📋 Tous les contrats</button>
          <button class="pill pill-contract" data-contract="cdi_fulltime">💼 CDI / Full-time</button>
          <button class="pill pill-contract" data-contract="freelance_contract">⚡ Freelance / Contract</button>
          <button class="pill pill-contract" data-contract="cdd_parttime">⏱️ CDD / Part-time</button>
          <button class="pill pill-contract" data-contract="internship">🎓 Stage / Alternance</button>
        </div>

        <!-- Categories, Lang, Salary -->
        <div class="filter-pills" id="categoryFilters">
          <button class="pill active" data-cat="all">💼 Tous métiers</button>
          <button class="pill" data-cat="tech">💻 Tech & Dev</button>
          <button class="pill" data-cat="devops">☁️ DevOps & Cloud</button>
          <button class="pill" data-cat="data_ai">🧠 Data & IA</button>
          <button class="pill" data-cat="design">🎨 Design & UX</button>
          <button class="pill" data-cat="product">🚀 Product</button>
          <button class="pill" data-cat="marketing_sales">📈 Marketing & Sales</button>
          <button class="pill" data-lang="fr">🇫🇷 Offres FR</button>
          <button class="pill" data-lang="en">🇬🇧 Offres EN</button>
          <button class="pill pill-toggle" id="salaryToggleBtn">💰 Salaire affiché</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="container">
    <div class="results-bar">
      <div>
        Affichage de <strong id="visibleCount">${totalCount}</strong> offre(s) vérifiée(s)
      </div>
      <div style="font-size:0.8rem; color:var(--text-dim);">
        Actualisé le : <strong>${dateFormatted} UTC</strong>
      </div>
    </div>

    <!-- Cards Grid -->
    <div id="jobsGrid" class="jobs-grid"></div>

    <!-- Markdown Table View -->
    <div id="markdownView" class="markdown-view-wrapper">
      <div class="markdown-header">
        <h2 style="font-size:1.1rem; font-weight:700;">Catalogue au format Markdown</h2>
        <button id="copyMdBtn" class="btn-apply" style="cursor:pointer; border:none;">
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
      <h3 style="color:var(--text); margin-bottom:0.5rem;">Aucune offre trouvée</h3>
      <p>Essayez de réinitialiser vos critères de recherche.</p>
      <button id="resetFiltersBtn" class="pill active" style="margin-top:1rem; cursor:pointer;">
        Réinitialiser tous les filtres
      </button>
    </div>
  </main>

  <!-- Job Detail Modal -->
  <div id="jobModal" class="modal-backdrop">
    <div class="modal-dialog">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div id="modalAvatar" class="company-avatar"></div>
          <div>
            <div id="modalCompany" style="font-size:0.85rem; font-weight:600; color:var(--text-muted);"></div>
            <h3 id="modalTitle" style="font-size:1.05rem; font-weight:700; color:var(--text);"></h3>
          </div>
        </div>
        <button id="modalCloseBtn" class="btn-icon" style="font-size:1.1rem;">✕</button>
      </div>
      <div class="modal-body" id="modalBody"></div>
      <div class="modal-footer">
        <button id="modalCopyBtn" class="btn-icon" title="Copier le lien" style="width:auto; padding:0 0.75rem; gap:0.3rem;">
          🔗 Copier le lien
        </button>
        <a id="modalApplyBtn" href="#" target="_blank" rel="noopener noreferrer" class="btn-apply">
          Postuler directement ↗
        </a>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer>
    <div class="container footer-inner">
      <div>
        <strong>FullRemote.Jobs</strong> — Développé et maintenu par <a href="https://edounze.com" target="_blank" style="color:var(--primary); font-weight:600;">Charles EDOU NZE</a>.
      </div>
      <div class="footer-links">
        <a href="https://fullremote-jobs.edounze.com">fullremote-jobs.edounze.com</a>
        <a href="/api/jobs" target="_blank">Endpoint JSON</a>
        <a href="https://github.com/flouzzy/fullremote-jobs" target="_blank">GitHub</a>
      </div>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div id="toast" class="toast">
    <span>✓</span> <span id="toastMsg">Action effectuée avec succès !</span>
  </div>

  <!-- Client-side Logic -->
  <script>
    const JOBS_DATA = ${jobsJson};
    let currentRegion = 'all';
    let currentContract = 'all';
    let currentCategory = 'all';
    let currentLang = 'all';
    let onlySalary = false;
    let onlyFavorites = false;
    let searchQuery = '';

    // Favorites in localStorage
    let favorites = new Set();
    try {
      const saved = JSON.parse(localStorage.getItem('fr_favs') || '[]');
      favorites = new Set(saved);
    } catch(e) {}

    function updateFavCount() {
      document.getElementById('favCount').textContent = favorites.size;
    }
    updateFavCount();

    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const jobsGrid = document.getElementById('jobsGrid');
    const markdownView = document.getElementById('markdownView');
    const markdownTableBody = document.getElementById('markdownTableBody');
    const visibleCount = document.getElementById('visibleCount');
    const emptyState = document.getElementById('emptyState');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const salaryToggleBtn = document.getElementById('salaryToggleBtn');
    const navFavBtn = document.getElementById('navFavBtn');
    const viewCardsBtn = document.getElementById('viewCardsBtn');
    const viewMdBtn = document.getElementById('viewMdBtn');
    const copyMdBtn = document.getElementById('copyMdBtn');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    // Modal elements
    const jobModal = document.getElementById('jobModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalAvatar = document.getElementById('modalAvatar');
    const modalCompany = document.getElementById('modalCompany');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalApplyBtn = document.getElementById('modalApplyBtn');
    const modalCopyBtn = document.getElementById('modalCopyBtn');

    function showToast(msg) {
      toastMsg.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function timeAgo(dateString) {
      if (!dateString) return '';
      const now = new Date();
      const past = new Date(dateString);
      const diffHrs = Math.floor((now - past) / (1000 * 60 * 60));
      if (diffHrs < 1) return "À l'instant";
      if (diffHrs < 24) return \`Il y a \${diffHrs}h\`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return "Hier";
      return \`Il y a \${diffDays}j\`;
    }

    function escapeHtml(str = '') {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function toggleFavorite(id) {
      if (favorites.has(id)) {
        favorites.delete(id);
        showToast('Offre retirée des favoris');
      } else {
        favorites.add(id);
        showToast('Offre ajoutée aux favoris ❤️');
      }
      try {
        localStorage.setItem('fr_favs', JSON.stringify(Array.from(favorites)));
      } catch(e) {}
      updateFavCount();
      renderJobs();
    }
    window.toggleFavorite = toggleFavorite;

    function openModal(jobId) {
      const job = JOBS_DATA.find(j => j.id === jobId);
      if (!job) return;

      const initial = (job.company || 'C').charAt(0).toUpperCase();
      modalAvatar.innerHTML = job.company_logo
        ? \`<img src="\${escapeHtml(job.company_logo)}" alt="\${escapeHtml(job.company)}" onerror="this.parentElement.innerHTML='\${initial}'">\`
        : initial;

      modalCompany.textContent = job.company;
      modalTitle.textContent = job.title;

      modalBody.innerHTML = \`
        <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:1rem;">
          <span class="badge badge-contract">\${job.contractIcon || '💼'} \${escapeHtml(job.contractType || 'CDI / Full-time')}</span>
          <span class="badge badge-region">\${job.regionFlag || '🌍'} \${escapeHtml(job.location || job.region)}</span>
          <span class="badge badge-category">\${job.categoryIcon || '💼'} \${escapeHtml(job.category)}</span>
          \${job.salary ? \`<span class="badge badge-salary">💰 \${escapeHtml(job.salary)}</span>\` : ''}
          <span class="badge badge-lang">\${job.language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}</span>
          <span class="badge badge-lang">100% Télétravail</span>
        </div>
        <p style="margin-bottom:1.25rem;">\${escapeHtml(job.description_snippet || 'Aucun aperçu disponible.')}</p>
        <div style="font-size:0.8rem; color:var(--text-dim);">Date de publication : \${new Date(job.published_at).toLocaleString('fr-FR')}</div>
      \`;

      modalApplyBtn.href = job.url;
      modalCopyBtn.onclick = () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(job.url).then(() => showToast('Lien de candidature copié !'));
        }
      };

      jobModal.style.display = 'flex';
    }
    window.openModal = openModal;

    modalCloseBtn.onclick = () => jobModal.style.display = 'none';
    jobModal.onclick = (e) => { if (e.target === jobModal) jobModal.style.display = 'none'; };

    function renderJobs() {
      const q = searchQuery.toLowerCase().trim();

      const filtered = JOBS_DATA.filter(job => {
        if (onlyFavorites && !favorites.has(job.id)) return false;
        if (currentRegion !== 'all' && job.regionId !== currentRegion) return false;
        if (currentContract !== 'all' && (job.contractTypeId || 'cdi_fulltime') !== currentContract) return false;
        if (currentCategory !== 'all' && job.categoryId !== currentCategory) return false;
        if (currentLang !== 'all' && job.language !== currentLang) return false;
        if (onlySalary && (!job.salary || job.salary.trim() === '')) return false;

        if (q) {
          const matchTitle = (job.title || '').toLowerCase().includes(q);
          const matchCompany = (job.company || '').toLowerCase().includes(q);
          const matchLocation = (job.location || '').toLowerCase().includes(q);
          const matchContract = (job.contractType || '').toLowerCase().includes(q);
          const matchTags = (job.tags || []).some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchCompany && !matchLocation && !matchContract && !matchTags) return false;
        }
        return true;
      });

      visibleCount.textContent = filtered.length;

      if (filtered.length === 0) {
        jobsGrid.innerHTML = '';
        markdownTableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
      }

      emptyState.style.display = 'none';

      // Render Cards
      jobsGrid.innerHTML = filtered.map(job => {
        const isFaved = favorites.has(job.id);
        const initial = (job.company || 'C').charAt(0).toUpperCase();
        const avatarHtml = job.company_logo
          ? \`<img src="\${escapeHtml(job.company_logo)}" alt="\${escapeHtml(job.company)}" onerror="this.parentElement.innerHTML='\${initial}'">\`
          : initial;

        const contractBadge = \`<span class="badge badge-contract">\${job.contractIcon || '💼'} \${escapeHtml(job.contractType || 'CDI / Full-time')}</span>\`;

        const salaryBadge = job.salary
          ? \`<span class="badge badge-salary">💰 \${escapeHtml(job.salary)}</span>\`
          : '';

        const langBadge = job.language === 'fr'
          ? \`<span class="badge badge-lang">🇫🇷 FR</span>\`
          : \`<span class="badge badge-lang">🇬🇧 EN</span>\`;

        const tagsHtml = (job.tags || [])
          .map(t => \`<span class="tag-item">\${escapeHtml(t)}</span>\`)
          .join('');

        return \`
          <article class="job-card" id="\${escapeHtml(job.id)}">
            <div>
              <div class="job-card-top">
                <div class="company-avatar">\${avatarHtml}</div>
                <div class="job-title-wrap">
                  <div class="job-company">\${escapeHtml(job.company)}</div>
                  <h3 class="job-title" style="cursor:pointer;" onclick="openModal('\${escapeHtml(job.id)}')">\${escapeHtml(job.title)}</h3>
                </div>
                <button class="btn-fav \${isFaved ? 'faved' : ''}" onclick="toggleFavorite('\${escapeHtml(job.id)}')" title="\${isFaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                  \${isFaved ? '❤️' : '🤍'}
                </button>
              </div>

              <div class="job-meta-badges">
                \${contractBadge}
                <span class="badge badge-region">\${job.regionFlag || '🌍'} \${escapeHtml(job.location || job.region)}</span>
                <span class="badge badge-category">\${job.categoryIcon || '💼'} \${escapeHtml(job.category)}</span>
                \${salaryBadge}
                \${langBadge}
              </div>

              <p class="job-snippet">\${escapeHtml(job.description_snippet || '')}</p>

              \${tagsHtml ? \`<div class="job-tags">\${tagsHtml}</div>\` : ''}
            </div>

            <div class="job-card-footer">
              <div class="job-verified-tag">
                \${timeAgo(job.published_at)} • 100% Télétravail
              </div>
              <div class="job-actions">
                <button class="btn-icon" title="Détails" onclick="openModal('\${escapeHtml(job.id)}')">
                  👁️
                </button>
                <button class="btn-icon" title="Copier le lien" onclick="copyUrl('\${escapeHtml(job.url)}')">
                  🔗
                </button>
                <a href="\${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" class="btn-apply">
                  Postuler ↗
                </a>
              </div>
            </div>
          </article>
        \`;
      }).join('');

      // Render Markdown Table
      markdownTableBody.innerHTML = filtered.map(job => \`
        <tr>
          <td>\${job.regionFlag || '🌍'} \${escapeHtml(job.region)}</td>
          <td>\${job.contractIcon || '💼'} \${escapeHtml(job.contractType || 'CDI')}</td>
          <td><strong>\${escapeHtml(job.title)}</strong></td>
          <td>\${escapeHtml(job.company)}</td>
          <td>\${escapeHtml(job.category)}</td>
          <td>\${escapeHtml(job.salary || '—')}</td>
          <td><a href="\${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); font-weight:600;">Postuler ↗</a></td>
        </tr>
      \`).join('');
    }

    window.copyUrl = function(url) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => showToast('Lien copié dans le presse-papiers !'));
      }
    };

    // Events
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      searchClear.style.display = searchQuery ? 'block' : 'none';
      renderJobs();
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClear.style.display = 'none';
      renderJobs();
      searchInput.focus();
    });

    // Region Pills
    document.querySelectorAll('#regionFilters .pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#regionFilters .pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRegion = btn.dataset.region;
        renderJobs();
      });
    });

    // Contract Pills
    document.querySelectorAll('#contractFilters .pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#contractFilters .pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentContract = btn.dataset.contract;
        renderJobs();
      });
    });

    // Category & Lang
    document.querySelectorAll('#categoryFilters .pill:not(#salaryToggleBtn)').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.lang) {
          if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            currentLang = 'all';
          } else {
            document.querySelectorAll('#categoryFilters .pill[data-lang]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
          }
        } else if (btn.dataset.cat) {
          document.querySelectorAll('#categoryFilters .pill[data-cat]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCategory = btn.dataset.cat;
        }
        renderJobs();
      });
    });

    // Salary Toggle
    salaryToggleBtn.addEventListener('click', () => {
      onlySalary = !onlySalary;
      salaryToggleBtn.classList.toggle('active', onlySalary);
      renderJobs();
    });

    // Favorites Nav Button
    navFavBtn.addEventListener('click', () => {
      onlyFavorites = !onlyFavorites;
      navFavBtn.classList.toggle('active', onlyFavorites);
      if (onlyFavorites) showToast('Affichage des offres favorites');
      renderJobs();
    });

    // Reset Filters
    resetFiltersBtn.addEventListener('click', () => {
      currentRegion = 'all';
      currentContract = 'all';
      currentCategory = 'all';
      currentLang = 'all';
      onlySalary = false;
      onlyFavorites = false;
      searchQuery = '';
      searchInput.value = '';
      searchClear.style.display = 'none';
      salaryToggleBtn.classList.remove('active');
      navFavBtn.classList.remove('active');
      document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
      document.querySelector('#regionFilters .pill[data-region="all"]').classList.add('active');
      document.querySelector('#contractFilters .pill[data-contract="all"]').classList.add('active');
      document.querySelector('#categoryFilters .pill[data-cat="all"]').classList.add('active');
      renderJobs();
    });

    // View switcher
    viewCardsBtn.onclick = () => {
      viewCardsBtn.classList.add('active');
      viewMdBtn.classList.remove('active');
      jobsGrid.style.display = 'grid';
      markdownView.style.display = 'none';
    };

    viewMdBtn.onclick = () => {
      viewMdBtn.classList.add('active');
      viewCardsBtn.classList.remove('active');
      jobsGrid.style.display = 'none';
      markdownView.style.display = 'block';
    };

    copyMdBtn.onclick = () => {
      let md = '# Full Remote Jobs Catalog\\n\\n| Région | Contrat | Poste | Entreprise | Salaire | Lien |\\n|---|---|---|---|---|---|\\n';
      JOBS_DATA.forEach(j => {
        md += \`| \${j.regionFlag || '🌍'} \${j.region} | \${j.contractIcon || '💼'} \${j.contractType || 'CDI'} | \${j.title} | \${j.company} | \${j.salary || '—'} | [\${j.company}](\${j.url}) |\\n\`;
      });
      if (navigator.clipboard) {
        navigator.clipboard.writeText(md).then(() => showToast('Markdown complet copié !'));
      }
    };

    // Initial render
    renderJobs();
  </script>
</body>
</html>`;
}
