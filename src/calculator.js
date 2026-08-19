/**
 * FullRemote-Jobs - Simulateur de Salaire & Télétravail International
 * Convertit et simule le Net Français pour des contrats US ($), UK (£), Europe (€) et Suisse (CHF)
 */

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderSalaryCalculatorPage(meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.app";

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Simulateur Salaire Télétravail International (US, UK, Suisse vers France) — FullRemote.Jobs</title>
  <meta name="description" content="Calculez votre salaire net en France pour une entreprise américaine (USD), britannique (GBP), suisse (CHF) ou européenne. Comparez Portage Salarial (Deel, Remote), Micro-Entreprise et SASU." />
  <link rel="canonical" href="${siteUrl}/simulateur-salaire-remote" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💶</text></svg>">
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
      --accent: #0284c7;
      --emerald: #10b981;
      --emerald-bg: rgba(16, 185, 129, 0.1);
      --amber: #f59e0b;
      --amber-bg: rgba(245, 158, 11, 0.1);
      --rose: #e11d48;
      --radius: 12px;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --header-bg: rgba(255, 255, 255, 0.92);
      --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    html.dark {
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
      --header-bg: rgba(9, 13, 22, 0.88);
      --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
    .container { max-width: 1080px; margin: 0 auto; padding: 0 1.5rem; width: 100%; }

    header {
      border-bottom: 1px solid var(--border);
      background: var(--header-bg);
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

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
      border: 1px solid var(--border);
      background: var(--bg-card);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .nav-btn:hover { color: var(--text); background: var(--bg-card-hover); }

    .hero-calc {
      padding: 3rem 0 2rem;
      text-align: center;
    }
    .hero-calc h1 {
      font-size: 2.3rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      letter-spacing: -0.03em;
    }
    .hero-calc p {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 720px;
      margin: 0 auto;
    }

    .calc-layout {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 2rem;
      margin-bottom: 3.5rem;
    }

    .calc-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.75rem;
      box-shadow: var(--card-shadow);
      height: fit-content;
    }

    .form-group {
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
    }
    .form-input, .form-select {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.65rem 0.9rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .form-input:focus, .form-select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .results-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .result-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .result-box.featured {
      border-color: var(--primary);
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
    }

    .result-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 0.75rem;
      width: fit-content;
    }
    .badge-portage { background: rgba(37, 99, 235, 0.15); color: var(--primary); }
    .badge-micro { background: rgba(16, 185, 129, 0.15); color: var(--emerald); }
    .badge-sasu { background: rgba(245, 158, 11, 0.15); color: var(--amber); }
    .badge-cdi { background: rgba(99, 102, 241, 0.15); color: #6366f1; }

    .result-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .net-amount {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text);
      font-family: var(--font-mono);
      margin: 0.5rem 0 0.25rem;
    }

    .net-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .stat-list {
      list-style: none;
      font-size: 0.82rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      padding-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .stat-list li { display: flex; justify-content: space-between; }
    .stat-list li strong { color: var(--text); }

    .tax-explainer {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      margin-top: 2rem;
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.7;
    }
    .tax-explainer h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 1rem;
    }

    footer {
      border-top: 1px solid var(--border);
      padding: 2rem 0;
      margin-top: auto;
      background: var(--bg-card);
      font-size: 0.85rem;
      color: var(--text-muted);
      text-align: center;
    }

    @media (max-width: 840px) {
      .calc-layout { grid-template-columns: 1fr; }
      .results-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container header-inner">
      <a href="/" class="brand">
        <span>🌍</span>
        <span>FullRemote<span style="color:var(--primary);">.Jobs</span></span>
      </a>
      <div style="display:flex; align-items:center; gap:0.6rem;">
        <a href="/" class="nav-btn">← Annuaire des offres</a>
        <a href="/talents/login" class="nav-btn">Connexion</a>
        <a href="/talents/join" class="nav-btn" style="font-weight:700; color:var(--primary);">✨ S'inscrire</a>
        <a href="/post-a-job" class="nav-btn" style="background:var(--primary); color:white; border:none;">Publier</a>
        <button id="themeToggleBtn" class="nav-btn" title="Changer de thème">🌙</button>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero-calc">
      <h1>💶 Simulateur de Salaire & <span>Télétravail International</span></h1>
      <p>Vous avez une proposition en télétravail d'une entreprise américaine (USD $), britannique (GBP £), suisse (CHF) ou européenne ? Calculez exactement combien vous toucherez <strong>net dans votre poche chaque mois en France</strong>.</p>
    </section>

    <div class="calc-layout">
      <!-- Input Card -->
      <div class="calc-card">
        <h2 style="font-size:1.15rem; font-weight:700; margin-bottom:1.25rem; color:var(--text);">Vos données de contrat</h2>

        <div class="form-group">
          <label class="form-label" for="calcCurrency">Devise de l'offre</label>
          <select id="calcCurrency" class="form-select" onchange="calculateSalary()">
            <option value="USD" selected>🇺🇸 Dollar US (USD $)</option>
            <option value="EUR">🇪🇺 Euro (EUR €)</option>
            <option value="GBP">🇬🇧 Livre Sterling (GBP £)</option>
            <option value="CHF">🇨🇭 Franc Suisse (CHF)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="calcType">Type de montant</label>
          <select id="calcType" class="form-select" onchange="calculateSalary()">
            <option value="annual" selected>Rémunération annuelle brute (ex: 90 000 $)</option>
            <option value="tjm">Taux Journalier Moyen (TJM / Freelance ex: 600 €)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="calcAmount" id="calcAmountLabel">Rémunération brute annuelle ($)</label>
          <input type="number" id="calcAmount" class="form-input" value="95000" min="1000" step="1000" oninput="calculateSalary()" />
        </div>

        <div class="form-group">
          <label class="form-label" for="calcDays">Jours travaillés / an (Base standard : 218 j)</label>
          <input type="number" id="calcDays" class="form-input" value="218" min="100" max="300" oninput="calculateSalary()" />
        </div>

        <div style="font-size:0.78rem; color:var(--text-dim); margin-top:0.5rem; line-height:1.5;">
          * Taux de change appliqués : 1 USD = 0.92 € • 1 GBP = 1.17 € • 1 CHF = 1.04 €.
        </div>
      </div>

      <!-- Results Grid -->
      <div class="results-grid">
        <!-- 1. Portage Salarial / EOR (Deel, Remote) -->
        <div class="result-box featured">
          <div>
            <span class="result-badge badge-portage">Recommandé • Sécurité Maximale</span>
            <h3 class="result-title">Portage Salarial / EOR</h3>
            <p style="font-size:0.8rem; color:var(--text-muted);">CDI Français via Deel, Remote.com ou société de portage salarial.</p>
            <div class="net-amount" id="netPortage">3 850 € <span style="font-size:0.9rem; font-weight:500;">/ mois</span></div>
            <div class="net-sub" id="netPortageYear">~46 200 € net / an</div>
          </div>
          <ul class="stat-list">
            <li><span>Protection sociale :</span> <strong>100% (Chômage + Sécu + Retraite Cadre)</strong></li>
            <li><span>Frais de gestion EOR :</span> <strong>~5% inclus</strong></li>
            <li><span>Dossier bancaire (Immobilier) :</span> <strong>Facile (Fiches de paie CDI)</strong></li>
          </ul>
        </div>

        <!-- 2. Micro-Entreprise / Auto-Entrepreneur -->
        <div class="result-box">
          <div>
            <span class="result-badge badge-micro">Revenu Max • Simplicité</span>
            <h3 class="result-title">Micro-Entreprise (BNC)</h3>
            <p style="font-size:0.8rem; color:var(--text-muted);">Facturation directe B2B en prestation de services.</p>
            <div class="net-amount" id="netMicro" style="color:var(--emerald);">5 620 € <span style="font-size:0.9rem; font-weight:500;">/ mois</span></div>
            <div class="net-sub" id="netMicroYear">~67 440 € net / an</div>
          </div>
          <ul class="stat-list">
            <li><span>Cotisations URSSAF :</span> <strong>21.1% du CA</strong></li>
            <li><span>Plafond franchise TVA :</span> <strong>39 100 € (TVA facturée au-delà)</strong></li>
            <li><span>Protection chômage :</span> <strong>Nulle (Option privée)</strong></li>
          </ul>
        </div>

        <!-- 3. Société SASU / EURL -->
        <div class="result-box">
          <div>
            <span class="result-badge badge-sasu">Optimisation Fiscale</span>
            <h3 class="result-title">Société SASU / SARL (IS)</h3>
            <p style="font-size:0.8rem; color:var(--text-muted);">Mix Salaire président + Dividendes avec déduction des frais pros.</p>
            <div class="net-amount" id="netSasu">4 450 € <span style="font-size:0.9rem; font-weight:500;">/ mois</span></div>
            <div class="net-sub" id="netSasuYear">~53 400 € net / an</div>
          </div>
          <ul class="stat-list">
            <li><span>Frais professionnels :</span> <strong>Déductibles (Matériel, Bureau, Coworking)</strong></li>
            <li><span>Flat Tax Dividendes :</span> <strong>30%</strong></li>
            <li><span>Comptabilité :</span> <strong>Bilan annuel obligatoire (~1 200 €/an)</strong></li>
          </ul>
        </div>

        <!-- 4. CDI Français Direct -->
        <div class="result-box">
          <div>
            <span class="result-badge badge-cdi">Standard Français</span>
            <h3 class="result-title">CDI Entreprise Française</h3>
            <p style="font-size:0.8rem; color:var(--text-muted);">Filiale française de l'entreprise internationale.</p>
            <div class="net-amount" id="netCdi">4 120 € <span style="font-size:0.9rem; font-weight:500;">/ mois</span></div>
            <div class="net-sub" id="netCdiYear">~49 440 € net / an</div>
          </div>
          <ul class="stat-list">
            <li><span>Cotisations salariales :</span> <strong>~22% à 25%</strong></li>
            <li><span>Prélèvement à la source (IR) :</span> <strong>Selon barème fiscal individuel</strong></li>
            <li><span>Mutuelle d'entreprise :</span> <strong>Obligatoire (50% employeur)</strong></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Educational Guide -->
    <article class="tax-explainer">
      <h2>💡 Comment travailler en France pour une entreprise internationale sans filiale ?</h2>
      <p>
        Lorsqu'une entreprise étrangère (américaine, anglaise, allemande...) souhaite vous recruter en 100% full remote sans disposer d'entité légale en France, 2 solutions principales existent :
      </p>
      <br />
      <p>
        <strong>1. L'EOR (Employer of Record) ou Portage Salarial International :</strong> L'entreprise mandate un tiers (comme <em>Deel, Remote.com, OysterHR, Jump</em> ou une société de portage salarial française). Vous signez un véritable <strong>contrat CDI de droit français</strong>, recevez des fiches de paie conformes et bénéficiez de la sécurité sociale, de la retraite cadre et des indemnités chômage France Travail.
      </p>
      <br />
      <p>
        <strong>2. Le Contrat Freelance / Contractor (B2B) :</strong> Vous facturez directement l'entreprise chaque mois via votre Micro-entreprise ou SASU. L'entreprise vous verse 100% du montant convenu en USD ou EUR sans retenir de cotisations, et vous réglez vos cotisations sociales en France (21.1% à l'URSSAF en auto-entreprise). C'est la solution qui laisse <strong>le plus d'argent net en poche</strong>.
      </p>
    </article>
  </main>

  <footer>
    <div class="container">
      <strong>FullRemote.Jobs</strong> — Built with ❤️ by <a href="https://edounze.com" target="_blank" style="color:var(--primary);">Charles EDOU NZE</a>.
    </div>
  </footer>

  <script>
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

    const FX_RATES = {
      USD: 0.92,
      EUR: 1.0,
      GBP: 1.17,
      CHF: 1.04,
    };

    function calculateSalary() {
      const currency = document.getElementById('calcCurrency').value;
      const type = document.getElementById('calcType').value;
      const amount = parseFloat(document.getElementById('calcAmount').value) || 0;
      const days = parseInt(document.getElementById('calcDays').value, 10) || 218;

      const rate = FX_RATES[currency] || 1.0;
      let totalEurYear = 0;

      if (type === 'annual') {
        totalEurYear = amount * rate;
        document.getElementById('calcAmountLabel').textContent = 'Rémunération brute annuelle (' + currency + ')';
      } else {
        totalEurYear = (amount * days) * rate;
        document.getElementById('calcAmountLabel').textContent = 'TJM / Tarif Journalier Moyen (' + currency + ')';
      }

      // 1. Portage Salarial / EOR (~52% net du chiffre d'affaires / budget total)
      const portageNetYear = totalEurYear * 0.51;
      const portageNetMonth = Math.round(portageNetYear / 12);
      document.getElementById('netPortage').innerHTML = portageNetMonth.toLocaleString('fr-FR') + ' € <span style="font-size:0.9rem; font-weight:500;">/ mois</span>';
      document.getElementById('netPortageYear').textContent = '~' + Math.round(portageNetYear).toLocaleString('fr-FR') + ' € net / an';

      // 2. Micro-Entreprise (~76% net après URSSAF 21.1% + impôt libératoire ~2.2%)
      const microNetYear = totalEurYear * 0.76;
      const microNetMonth = Math.round(microNetYear / 12);
      document.getElementById('netMicro').innerHTML = microNetMonth.toLocaleString('fr-FR') + ' € <span style="font-size:0.9rem; font-weight:500;">/ mois</span>';
      document.getElementById('netMicroYear').textContent = '~' + Math.round(microNetYear).toLocaleString('fr-FR') + ' € net / an';

      // 3. SASU (~60% net après IS 15/25% et Flat Tax 30% ou charges sociales président)
      const sasuNetYear = totalEurYear * 0.60;
      const sasuNetMonth = Math.round(sasuNetYear / 12);
      document.getElementById('netSasu').innerHTML = sasuNetMonth.toLocaleString('fr-FR') + ' € <span style="font-size:0.9rem; font-weight:500;">/ mois</span>';
      document.getElementById('netSasuYear').textContent = '~' + Math.round(sasuNetYear).toLocaleString('fr-FR') + ' € net / an';

      // 4. CDI Français (~76% net du brut contractuel)
      const cdiNetYear = totalEurYear * 0.75;
      const cdiNetMonth = Math.round(cdiNetYear / 12);
      document.getElementById('netCdi').innerHTML = cdiNetMonth.toLocaleString('fr-FR') + ' € <span style="font-size:0.9rem; font-weight:500;">/ mois</span>';
      document.getElementById('netCdiYear').textContent = '~' + Math.round(cdiNetYear).toLocaleString('fr-FR') + ' € net / an';
    }

    calculateSalary();
  </script>
</body>
</html>`;
}
