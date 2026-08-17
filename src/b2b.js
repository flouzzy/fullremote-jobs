/**
 * FullRemote-Jobs - Page de Publication d'Offre Recruteurs (/post-a-job)
 */

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderPostJobPage(meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.edounze.com";

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Publier une offre d'emploi Full Remote — FullRemote.Jobs</title>
  <meta name="description" content="Recrutez les meilleurs talents en 100% télétravail. Diffusion immédiate, mise en avant en tête de liste et inclusion dans le digest email quotidien." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌍</text></svg>">
  <style>
    :root {
      --bg: #f8fafc;
      --bg-card: #ffffff;
      --bg-card-hover: #f1f5f9;
      --border: #e2e8f0;
      --border-focus: #3b82f6;
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
    .container { max-width: 960px; margin: 0 auto; padding: 0 1.5rem; width: 100%; }

    header {
      border-bottom: 1px solid var(--border);
      background: var(--bg-card);
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

    .theme-toggle-btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
    }

    .hero-post {
      padding: 3rem 0 2rem;
      text-align: center;
    }
    .hero-post h1 {
      font-size: 2.3rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      letter-spacing: -0.03em;
    }
    .hero-post p {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 680px;
      margin: 0 auto;
    }

    .pricing-box {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .pricing-features {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.9rem;
    }
    .pricing-feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .pricing-feature-item span { color: var(--emerald); font-weight: 700; }

    .pricing-badge {
      text-align: right;
    }
    .price-amount {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
    }
    .price-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .form-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2.25rem;
      margin-bottom: 3rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .form-section-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1.25rem;
    }
    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
    }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.65rem 0.9rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .form-textarea { resize: vertical; min-height: 110px; }

    .btn-submit-post {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      font-weight: 700;
      font-size: 1.05rem;
      padding: 0.85rem 2rem;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      width: 100%;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .btn-submit-post:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
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

    @media (max-width: 640px) {
      .form-grid-2 { grid-template-columns: 1fr; }
      .pricing-box { flex-direction: column; text-align: center; }
      .pricing-badge { text-align: center; }
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
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <a href="/" class="nav-btn">← Retour aux offres</a>
        <button id="themeToggleBtn" class="theme-toggle-btn" title="Changer le thème">🌙</button>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero-post">
      <h1>Diffusez votre offre en <span>100% Télétravail</span>.</h1>
      <p>Touchez des milliers de développeurs, DevOps, Data Engineers et profils tech seniors recherchant activement un poste sans contrainte géographique.</p>
    </section>

    <div class="pricing-box">
      <div class="pricing-features">
        <div class="pricing-feature-item"><span>✓</span> <strong>Mise en avant "⭐ Featured"</strong> pendant 30 jours en tête de liste</div>
        <div class="pricing-feature-item"><span>✓</span> <strong>Diffusion prioritaire</strong> dans le Digest Email quotidien matinal</div>
        <div class="pricing-feature-item"><span>✓</span> <strong>Alerte Web Push instantanée</strong> auprès des abonnés actifs</div>
        <div class="pricing-feature-item"><span>✓</span> <strong>Fiche dédiée Google Jobs SEO</strong> & Schema.org JobPosting</div>
        <div class="pricing-feature-item"><span>✓</span> <strong>Lien direct</strong> vers votre ATS / page de candidature (0 intermédiaire)</div>
      </div>
      <div class="pricing-badge">
        <div class="price-amount">49 €</div>
        <div class="price-desc">Paiement unique • 30 jours de visibilité</div>
      </div>
    </div>

    <form id="postJobForm" class="form-card" onsubmit="handlePostJob(event)">
      <div class="form-section-title">1. Votre Entreprise</div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="companyName">Nom de l'entreprise *</label>
          <input type="text" id="companyName" class="form-input" required placeholder="ex: Acme Corp" />
        </div>
        <div class="form-group">
          <label class="form-label" for="companyLogo">URL du Logo (optionnel)</label>
          <input type="url" id="companyLogo" class="form-input" placeholder="https://votresite.com/logo.png" />
        </div>
      </div>

      <div class="form-section-title">2. L'Offre d'Emploi</div>
      <div class="form-group">
        <label class="form-label" for="jobTitle">Intitulé du poste *</label>
        <input type="text" id="jobTitle" class="form-input" required placeholder="ex: Senior Fullstack Engineer (TypeScript / Node / Go)" />
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="jobCategory">Catégorie / Métier *</label>
          <select id="jobCategory" class="form-select" required>
            <option value="tech">💻 Tech & Développement</option>
            <option value="devops">☁️ DevOps & Cloud</option>
            <option value="data_ai">🧠 Data & Intelligence Artificielle</option>
            <option value="design">🎨 Design & UX/UI</option>
            <option value="product">🚀 Product Management</option>
            <option value="marketing_sales">📈 Marketing & Sales</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="jobRegion">Région géographique admise *</label>
          <select id="jobRegion" class="form-select" required>
            <option value="worldwide">🌍 Worldwide (Partout dans le monde)</option>
            <option value="france">🇫🇷 France & Francophonie</option>
            <option value="europe">🇪🇺 Europe & UK</option>
            <option value="americas">🇺🇸 Amériques (USA / Canada / LATAM)</option>
            <option value="apac_mea">🌏 Asie, Pacifique & MEA</option>
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="jobContract">Type de contrat *</label>
          <select id="jobContract" class="form-select" required>
            <option value="cdi_fulltime">💼 CDI / Full-time</option>
            <option value="freelance_contract">⚡ Freelance / Contractuel</option>
            <option value="cdd_parttime">⏳ CDD / Part-time</option>
            <option value="internship">🎓 Stage / Alternance</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="jobSalary">Salaire / Rémunération indicative</label>
          <input type="text" id="jobSalary" class="form-input" placeholder="ex: 65 000 € - 85 000 € / an ou 550 € / jour" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="jobApplyUrl">Lien direct pour postuler (URL ATS ou email) *</label>
        <input type="url" id="jobApplyUrl" class="form-input" required placeholder="https://careers.acme.com/jobs/senior-dev" />
      </div>

      <div class="form-group">
        <label class="form-label" for="jobDescription">Description concise du poste & missions *</label>
        <textarea id="jobDescription" class="form-textarea" required placeholder="Présentez les missions principales, la stack technique et les avantages du poste..."></textarea>
      </div>

      <div class="form-section-title">3. Contact & Facturation</div>
      <div class="form-group">
        <label class="form-label" for="billingEmail">Votre adresse Email professionnelle *</label>
        <input type="email" id="billingEmail" class="form-input" required placeholder="recrutement@acme.com" />
        <span style="font-size:0.75rem; color:var(--text-muted);">Un lien de modification et le reçu de facturation vous seront envoyés à cette adresse.</span>
      </div>

      <div id="postFeedback" style="display:none; padding:1rem; border-radius:8px; margin-bottom:1rem; font-size:0.9rem;"></div>

      <button type="submit" id="postSubmitBtn" class="btn-submit-post">
        <span>🚀</span> Valider et publier mon offre (49 €)
      </button>
    </form>
  </main>

  <footer>
    <div class="container">
      <strong>FullRemote.Jobs</strong> — Plateforme indépendante opérée par <a href="https://edounze.com" target="_blank" style="color:var(--primary);">Charles EDOU NZE</a>.
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

    async function handlePostJob(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('postSubmitBtn');
      const feedback = document.getElementById('postFeedback');

      const payload = {
        company: document.getElementById('companyName').value.trim(),
        company_logo: document.getElementById('companyLogo').value.trim(),
        title: document.getElementById('jobTitle').value.trim(),
        category: document.getElementById('jobCategory').value,
        region: document.getElementById('jobRegion').value,
        contract: document.getElementById('jobContract').value,
        salary: document.getElementById('jobSalary').value.trim(),
        url: document.getElementById('jobApplyUrl').value.trim(),
        description: document.getElementById('jobDescription').value.trim(),
        email: document.getElementById('billingEmail').value.trim(),
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Création du brouillon en cours...';

      try {
        const res = await fetch('/api/jobs/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        feedback.style.display = 'block';
        if (res.ok && data.success) {
          feedback.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
          feedback.style.color = '#10b981';
          feedback.style.border = '1px solid rgba(16, 185, 129, 0.3)';
          feedback.innerHTML = '✓ <strong>Offre enregistrée !</strong> ' + (data.message || 'Votre annonce est prête pour la mise en ligne.');
          submitBtn.textContent = '✓ Offre validée';
        } else {
          feedback.style.backgroundColor = 'rgba(225, 29, 72, 0.15)';
          feedback.style.color = '#e11d48';
          feedback.style.border = '1px solid rgba(225, 29, 72, 0.3)';
          feedback.textContent = '✕ ' + (data.error || 'Erreur lors de la validation.');
          submitBtn.disabled = false;
          submitBtn.textContent = '🚀 Valider et publier mon offre (49 €)';
        }
      } catch (err) {
        feedback.style.display = 'block';
        feedback.style.backgroundColor = 'rgba(225, 29, 72, 0.15)';
        feedback.style.color = '#e11d48';
        feedback.style.border = '1px solid rgba(225, 29, 72, 0.3)';
        feedback.textContent = '✕ Erreur de connexion : ' + err.message;
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Valider et publier mon offre (49 €)';
      }
    }
  </script>
</body>
</html>`;
}
