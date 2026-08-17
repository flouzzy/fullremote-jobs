/**
 * FullRemote-Jobs - Modern Responsive HTML/CSS/JS Interface
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
  <title>Full Remote Jobs — Offres d'emploi 100% Télétravail (FR / EN)</title>
  <meta name="description" content="Répertoire des meilleures offres de travail 100% full remote en anglais et en français classées par région. Accès libre, direct et sans inscription." />
  <meta property="og:title" content="Full Remote Jobs — 100% Télétravail" />
  <meta property="og:description" content="Trouvez votre prochain job 100% remote en France, Europe, Amériques ou Worldwide sans inscription." />
  <meta property="og:url" content="https://fullremote-jobs.edounze.com" />
  <meta property="og:type" content="website" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌍</text></svg>">
  <style>
    :root {
      --bg: #0b0f19;
      --bg-card: #131a29;
      --bg-card-hover: #1a2337;
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
      --purple: #8b5cf6;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
      --radius: 12px;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

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

    a {
      color: inherit;
      text-decoration: none;
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      width: 100%;
    }

    /* Header */
    header {
      border-bottom: 1px solid var(--border);
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
    }

    .brand-logo {
      font-size: 1.6rem;
      line-height: 1;
    }

    .brand-tag {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-muted);
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }

    .nav-btn:hover {
      color: var(--text);
      background: var(--bg-card);
      border-color: var(--border);
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
      padding: 3rem 0 2rem;
      text-align: center;
      border-bottom: 1px solid rgba(30, 41, 59, 0.5);
      background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 0.35rem 1rem;
      border-radius: 999px;
      font-size: 0.8125rem;
      color: var(--accent);
      margin-bottom: 1.25rem;
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
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 1rem;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero h1 span {
      color: #60a5fa;
    }

    .hero p {
      font-size: 1.125rem;
      color: var(--text-muted);
      max-width: 650px;
      margin: 0 auto 1.75rem;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
      font-size: 0.875rem;
      color: var(--text-dim);
    }

    .hero-stat-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .hero-stat-item strong {
      color: var(--text);
    }

    /* Controls & Filters */
    .controls-section {
      padding: 2rem 0 1rem;
      position: sticky;
      top: 70px;
      background: rgba(11, 15, 25, 0.95);
      backdrop-filter: blur(10px);
      z-index: 30;
      border-bottom: 1px solid var(--border);
    }

    .search-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
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
      font-size: 1.1rem;
    }

    .search-input {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.75rem 2.5rem 0.75rem 2.75rem;
      border-radius: var(--radius);
      font-size: 0.95rem;
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

    .search-clear:hover {
      color: var(--text);
    }

    .view-toggle-btns {
      display: flex;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 4px;
    }

    .view-btn {
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      border: none;
      background: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.875rem;
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

    /* Filter Pills */
    .filter-groups {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .filter-pills {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .filter-pills::-webkit-scrollbar {
      display: none;
    }

    .pill {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 0.45rem 0.95rem;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
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

    .pill-count {
      background: rgba(255, 255, 255, 0.15);
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 0.7rem;
    }

    /* Main Content */
    main {
      flex: 1;
      padding: 2rem 0 4rem;
    }

    .results-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .results-bar strong {
      color: var(--text);
    }

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
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      position: relative;
    }

    .job-card:hover {
      transform: translateY(-2px);
      border-color: #334155;
      box-shadow: var(--shadow-lg);
      background: var(--bg-card-hover);
    }

    .job-card-top {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 0.85rem;
    }

    .company-avatar {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      color: #94a3b8;
      flex-shrink: 0;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .company-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .job-title-wrap {
      flex: 1;
    }

    .job-company {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .job-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.35;
      margin-top: 0.15rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .job-meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 0.9rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 500;
    }

    .badge-region {
      background: rgba(59, 130, 246, 0.1);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .badge-category {
      background: rgba(139, 92, 246, 0.1);
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.2);
    }

    .badge-salary {
      background: var(--emerald-bg);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.25);
      font-weight: 600;
    }

    .badge-lang {
      background: rgba(148, 163, 184, 0.1);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .job-snippet {
      font-size: 0.85rem;
      color: var(--text-dim);
      line-height: 1.5;
      margin-bottom: 1.1rem;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .job-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 1.1rem;
    }

    .tag-item {
      background: #0f172a;
      border: 1px solid #1e293b;
      color: #94a3b8;
      font-size: 0.7rem;
      padding: 2px 7px;
      border-radius: 4px;
      font-family: var(--font-mono);
    }

    .job-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.9rem;
      border-top: 1px solid rgba(30, 41, 59, 0.7);
      font-size: 0.78rem;
      color: var(--text-dim);
    }

    .job-source-tag {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: #64748b;
    }

    .job-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-apply {
      background: var(--primary);
      color: white;
      font-weight: 600;
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      font-size: 0.8125rem;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      transition: background 0.15s ease;
    }

    .btn-apply:hover {
      background: var(--primary-hover);
    }

    .btn-icon {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--text-muted);
    }

    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: var(--text);
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    /* Markdown View */
    .markdown-view-wrapper {
      display: none;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      overflow-x: auto;
    }

    .markdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .markdown-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      text-align: left;
    }

    .markdown-table th {
      background: #0f172a;
      color: var(--text-muted);
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      font-weight: 600;
    }

    .markdown-table td {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      color: var(--text);
    }

    .markdown-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 2.5rem 0;
      margin-top: auto;
      background: #080c14;
      font-size: 0.85rem;
      color: var(--text-dim);
    }

    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-links {
      display: flex;
      gap: 1.5rem;
    }

    .footer-links a:hover {
      color: var(--text);
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #1e293b;
      color: white;
      border: 1px solid #334155;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      font-size: 0.875rem;
      z-index: 100;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 1.85rem;
      }
      .jobs-grid {
        grid-template-columns: 1fr;
      }
      .controls-section {
        top: 60px;
      }
      .header-inner {
        height: 60px;
      }
      .brand-title {
        font-size: 1.1rem;
      }
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
        <a href="/api/jobs" target="_blank" class="nav-btn">
          <span>⚡</span> API JSON
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
        <span>${totalCount} postes 100% télétravail indexés</span>
      </div>
      <h1>Les meilleures offres <span>Full Remote</span> en direct.</h1>
      <p>Agrégateur intelligent de postes en télétravail en français et en anglais. Accès libre, direct et sans inscription.</p>
      
      <div class="hero-stats">
        <div class="hero-stat-item">
          <span>🕒</span> Actualisé le <strong>${dateFormatted} UTC</strong>
        </div>
        <div class="hero-stat-item">
          <span>🤖</span> Ingestion quotidienne <strong>Cron Cloudflare (6h00 UTC)</strong>
        </div>
        <div class="hero-stat-item">
          <span>📡</span> Sources : <strong>Remotive • Jobicy • Arbeitnow</strong>
        </div>
      </div>
    </div>
  </section>

  <!-- Controls & Filters Sticky Bar -->
  <div class="controls-section">
    <div class="container">
      <!-- Search Row -->
      <div class="search-row">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            id="searchInput"
            class="search-input"
            placeholder="Rechercher par titre, techno, entreprise (ex: React, Python, DevOps, Stripe, Senior...)"
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

      <!-- Filter Pills -->
      <div class="filter-groups">
        <!-- Region Pills -->
        <div class="filter-pills" id="regionFilters">
          <button class="pill active" data-region="all">🌍 Toutes les régions</button>
          <button class="pill" data-region="worldwide">🌍 Worldwide</button>
          <button class="pill" data-region="france">🇫🇷 France & Francophonie</button>
          <button class="pill" data-region="europe">🇪🇺 Europe</button>
          <button class="pill" data-region="americas">🇺🇸 Amériques</button>
          <button class="pill" data-region="apac_mea">🌏 Asie & MEA</button>
        </div>

        <!-- Category & Lang Pills -->
        <div class="filter-pills" id="categoryFilters">
          <button class="pill active" data-cat="all">💼 Tous les métiers</button>
          <button class="pill" data-cat="tech">💻 Tech & Dev</button>
          <button class="pill" data-cat="devops">☁️ DevOps & Cloud</button>
          <button class="pill" data-cat="data_ai">🧠 Data & IA</button>
          <button class="pill" data-cat="design">🎨 Design & UX</button>
          <button class="pill" data-cat="product">🚀 Product</button>
          <button class="pill" data-cat="marketing_sales">📈 Marketing & Sales</button>
          <button class="pill" data-lang="fr">🇫🇷 Offres FR</button>
          <button class="pill" data-lang="en">🇬🇧 Offres EN</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="container">
    <div class="results-bar">
      <div>
        Affichage de <strong id="visibleCount">${totalCount}</strong> offre(s)
      </div>
      <div id="activeFilterLabel" style="color:var(--accent);"></div>
    </div>

    <!-- Cards Grid -->
    <div id="jobsGrid" class="jobs-grid"></div>

    <!-- Markdown Table View -->
    <div id="markdownView" class="markdown-view-wrapper">
      <div class="markdown-header">
        <h2 style="font-size:1.15rem; font-weight:700;">Catalogue au format Markdown</h2>
        <button id="copyMdBtn" class="btn-apply" style="cursor:pointer; border:none;">
          📋 Copier tout le Markdown
        </button>
      </div>
      <div style="overflow-x:auto;">
        <table class="markdown-table" id="markdownTable">
          <thead>
            <tr>
              <th>Région</th>
              <th>Poste</th>
              <th>Entreprise</th>
              <th>Catégorie</th>
              <th>Salaire</th>
              <th>Langue</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="markdownTableBody"></tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div id="emptyState" class="empty-state" style="display:none;">
      <div class="empty-state-icon">🔎</div>
      <h3>Aucune offre ne correspond à vos critères</h3>
      <p>Essayez d'élargir vos filtres ou de réinitialiser la recherche.</p>
      <button id="resetFiltersBtn" class="pill active" style="margin-top:1rem; cursor:pointer;">
        Réinitialiser les filtres
      </button>
    </div>
  </main>

  <!-- Footer -->
  <footer>
    <div class="container footer-inner">
      <div>
        <strong>FullRemote.Jobs</strong> — Projet Open Source propulsé par Cloudflare Workers.
      </div>
      <div class="footer-links">
        <a href="https://fullremote-jobs.edounze.com">fullremote-jobs.edounze.com</a>
        <a href="/api/jobs" target="_blank">Endpoint /api/jobs</a>
        <a href="https://github.com/flouzzy/fullremote-jobs" target="_blank">GitHub Repository</a>
      </div>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div id="toast" class="toast">
    <span>✓</span> <span id="toastMsg">Lien copié dans le presse-papiers !</span>
  </div>

  <!-- Client-side script -->
  <script>
    const JOBS_DATA = ${jobsJson};
    let currentRegion = 'all';
    let currentCategory = 'all';
    let currentLang = 'all';
    let searchQuery = '';

    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const jobsGrid = document.getElementById('jobsGrid');
    const markdownView = document.getElementById('markdownView');
    const markdownTableBody = document.getElementById('markdownTableBody');
    const visibleCount = document.getElementById('visibleCount');
    const emptyState = document.getElementById('emptyState');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const viewCardsBtn = document.getElementById('viewCardsBtn');
    const viewMdBtn = document.getElementById('viewMdBtn');
    const copyMdBtn = document.getElementById('copyMdBtn');

    function showToast(msg) {
      toastMsg.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function timeAgo(dateString) {
      if (!dateString) return '';
      const now = new Date();
      const past = new Date(dateString);
      const diffMs = now - past;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return "À l'instant";
      if (diffHrs < 24) return \`Il y a \${diffHrs}h\`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return "Hier";
      return \`Il y a \${diffDays}j\`;
    }

    function escapeHtml(str = '') {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderJobs() {
      const q = searchQuery.toLowerCase().trim();

      const filtered = JOBS_DATA.filter(job => {
        // Region filter
        if (currentRegion !== 'all' && job.regionId !== currentRegion) {
          return false;
        }
        // Category filter
        if (currentCategory !== 'all' && job.categoryId !== currentCategory) {
          return false;
        }
        // Lang filter
        if (currentLang !== 'all' && job.language !== currentLang) {
          return false;
        }
        // Search query
        if (q) {
          const matchTitle = (job.title || '').toLowerCase().includes(q);
          const matchCompany = (job.company || '').toLowerCase().includes(q);
          const matchLocation = (job.location || '').toLowerCase().includes(q);
          const matchCategory = (job.category || '').toLowerCase().includes(q);
          const matchTags = (job.tags || []).some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchCompany && !matchLocation && !matchCategory && !matchTags) {
            return false;
          }
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
        const initial = (job.company || 'C').charAt(0).toUpperCase();
        const avatarHtml = job.company_logo
          ? \`<img src="\${escapeHtml(job.company_logo)}" alt="\${escapeHtml(job.company)}" onerror="this.parentElement.innerHTML='\${initial}'">\`
          : initial;
        
        const salaryBadge = job.salary
          ? \`<span class="badge badge-salary">💰 \${escapeHtml(job.salary)}</span>\`
          : '';

        const langBadge = job.language === 'fr'
          ? \`<span class="badge badge-lang">🇫🇷 Français</span>\`
          : \`<span class="badge badge-lang">🇬🇧 English</span>\`;

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
                  <h3 class="job-title">\${escapeHtml(job.title)}</h3>
                </div>
              </div>

              <div class="job-meta-badges">
                <span class="badge badge-region">\${job.regionFlag || '🌍'} \${escapeHtml(job.location || job.region)}</span>
                <span class="badge badge-category">\${job.categoryIcon || '💼'} \${escapeHtml(job.category)}</span>
                \${salaryBadge}
                \${langBadge}
              </div>

              <p class="job-snippet">\${escapeHtml(job.description_snippet || '')}</p>

              \${tagsHtml ? \`<div class="job-tags">\${tagsHtml}</div>\` : ''}
            </div>

            <div class="job-card-footer">
              <div class="job-source-tag">
                \${timeAgo(job.published_at)} • via \${escapeHtml(job.source)}
              </div>
              <div class="job-actions">
                <button class="btn-icon" title="Copier le lien" onclick="copyJobLink('\${job.url}', '\${escapeHtml(job.title)}')">
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
          <td><strong>\${escapeHtml(job.title)}</strong></td>
          <td>\${escapeHtml(job.company)}</td>
          <td>\${escapeHtml(job.category)}</td>
          <td>\${escapeHtml(job.salary || '—')}</td>
          <td>\${job.language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</td>
          <td><a href="\${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); font-weight:600;">Postuler ↗</a></td>
        </tr>
      \`).join('');
    }

    window.copyJobLink = function(url, title) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showToast(\`Lien de "\${title.slice(0, 25)}..." copié !\`);
        });
      }
    };

    // Search events
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

    // Category & Lang Pills
    document.querySelectorAll('#categoryFilters .pill').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.lang) {
          // Toggle language
          if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            currentLang = 'all';
          } else {
            document.querySelectorAll('#categoryFilters .pill[data-lang]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
          }
        } else if (btn.dataset.cat) {
          // Category
          document.querySelectorAll('#categoryFilters .pill[data-cat]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCategory = btn.dataset.cat;
        }
        renderJobs();
      });
    });

    // Reset filters
    resetFiltersBtn.addEventListener('click', () => {
      currentRegion = 'all';
      currentCategory = 'all';
      currentLang = 'all';
      searchQuery = '';
      searchInput.value = '';
      searchClear.style.display = 'none';
      document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
      document.querySelector('#regionFilters .pill[data-region="all"]').classList.add('active');
      document.querySelector('#categoryFilters .pill[data-cat="all"]').classList.add('active');
      renderJobs();
    });

    // View Switcher
    viewCardsBtn.addEventListener('click', () => {
      viewCardsBtn.classList.add('active');
      viewMdBtn.classList.remove('active');
      jobsGrid.style.display = 'grid';
      markdownView.style.display = 'none';
    });

    viewMdBtn.addEventListener('click', () => {
      viewMdBtn.classList.add('active');
      viewCardsBtn.classList.remove('active');
      jobsGrid.style.display = 'none';
      markdownView.style.display = 'block';
    });

    // Copy full Markdown
    copyMdBtn.addEventListener('click', () => {
      let md = '# Full Remote Jobs Catalog\\n\\n| Région | Poste | Entreprise | Salaire | Lien |\\n|---|---|---|---|---|\\n';
      JOBS_DATA.forEach(j => {
        md += \`| \${j.regionFlag || '🌍'} \${j.region} | \${j.title} | \${j.company} | \${j.salary || '—'} | [\${j.company}](\${j.url}) |\\n\`;
      });
      if (navigator.clipboard) {
        navigator.clipboard.writeText(md).then(() => {
          showToast('Markdown complet copié dans le presse-papiers !');
        });
      }
    });

    // Initial render
    renderJobs();
  </script>
</body>
</html>`;
}
