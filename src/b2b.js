/**
 * FullRemote-Jobs - Page de Publication d'Offre Recruteurs (/post-a-job)
 * Intégration Stripe Checkout 49 € pour la publication d'offres sponsorisées (30 jours)
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
  <title>Publier une offre d'emploi 100% Full Remote (49 €) — FullRemote.Jobs</title>
  <meta name="description" content="Recrutez les meilleurs talents en 100% télétravail. Diffusion immédiate pendant 30 jours, mise en avant en tête de liste et inclusion dans la newsletter quotidienne." />
  <link rel="canonical" href="${siteUrl}/post-a-job" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💼</text></svg>">
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
    .container { max-width: 960px; margin: 0 auto; padding: 0 1.5rem; width: 100%; }

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

    .hero-post {
      padding: 3rem 0 2rem;
      text-align: center;
    }
    .hero-post h1 {
      font-size: 2.4rem;
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
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%);
      border: 1px solid rgba(37, 99, 235, 0.25);
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
      font-size: 2.4rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
      font-family: var(--font-mono);
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
      box-shadow: var(--card-shadow);
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
      padding: 0.95rem 1.75rem;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn-submit-post:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }

    .payment-notice {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .banner-status {
      padding: 1.25rem 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      display: none;
      font-size: 0.95rem;
      line-height: 1.6;
    }
    .banner-success {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #065f46;
    }
    html.dark .banner-success { color: #34d399; }
    
    .banner-canceled {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #92400e;
    }
    html.dark .banner-canceled { color: #fbbf24; }

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
      .pricing-box { flex-direction: column; align-items: flex-start; }
      .pricing-badge { text-align: left; }
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
        <a href="/" class="nav-btn">← Annuaire des offres</a>
        <a href="/simulateur-salaire-remote" class="nav-btn">💶 Simulateur</a>
        <button id="themeToggleBtn" class="nav-btn" title="Changer de thème">🌙</button>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero-post">
      <h1>💼 Publier une offre <span>100% Full Remote</span></h1>
      <p>Touchez directement des milliers de profils qualifiés (Tech, DevOps, Data, Product, Marketing) à la recherche exclusive de postes sans contrainte géographique.</p>
    </section>

    <!-- Banner Status (Success / Canceled) -->
    <div id="successBanner" class="banner-status banner-success">
      <h3 style="font-weight:700; margin-bottom:0.25rem; font-size:1.05rem;">🎉 Paiement confirmé avec succès !</h3>
      <p>Votre offre d'emploi a bien été enregistrée et est désormais mise en avant sur FullRemote.Jobs. Un email de confirmation et votre reçu Stripe vous ont été adressés.</p>
      <a href="/" style="display:inline-block; margin-top:0.75rem; font-weight:700; color:var(--primary); text-decoration:underline;">Voir mon annonce sur l'annuaire →</a>
    </div>

    <div id="canceledBanner" class="banner-status banner-canceled">
      <strong>⚠️ Paiement annulé.</strong> Votre formulaire a été conservé. Vous pouvez modifier vos informations ou relancer la validation lorsque vous êtes prêt.
    </div>

    <div class="pricing-box">
      <div class="pricing-features">
        <div class="pricing-feature-item">
          <span>✓</span> <strong>Mise en avant sponsorisée pendant 30 jours</strong> en tête de liste
        </div>
        <div class="pricing-feature-item">
          <span>✓</span> <strong>Inclusion dans la Newsletter Quotidienne</strong> envoyée chaque matin à 08h00
        </div>
        <div class="pricing-feature-item">
          <span>✓</span> <strong>Indexation prioritaire pour les IA & LLMs</strong> (Perplexity, ChatGPT, Claude)
        </div>
        <div class="pricing-feature-item">
          <span>✓</span> <strong>Bouton direct vers votre ATS / formulaire</strong> (sans commission)
        </div>
      </div>
      <div class="pricing-badge">
        <div class="price-amount">49 €</div>
        <div class="price-desc">Paiement unique • 30 jours de diffusion</div>
      </div>
    </div>

    <form class="form-card" id="postJobForm" action="javascript:void(0);" onsubmit="event.preventDefault(); handlePostJob(event); return false;">
      <div class="form-section-title">1. Votre Entreprise</div>
      
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="companyName">Nom de l'entreprise *</label>
          <input type="text" id="companyName" class="form-input" required placeholder="ex: Stripe, Notion, Alan, Qonto..." />
        </div>
        <div class="form-group">
          <label class="form-label" for="companyLogo">URL du Logo (carré ou SVG)</label>
          <input type="url" id="companyLogo" class="form-input" placeholder="https://votresite.com/logo.png" />
        </div>
      </div>

      <div class="form-section-title">2. L'Opportunité</div>

      <div class="form-group">
        <label class="form-label" for="jobTitle">Intitulé précis du poste *</label>
        <input type="text" id="jobTitle" class="form-input" required placeholder="ex: Senior Go Backend Engineer, Lead DevOps Kubernetes, Product Designer..." />
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="jobCategory">Domaine d'activité *</label>
          <select id="jobCategory" class="form-select" required>
            <option value="tech">💻 Tech & Développement</option>
            <option value="devops">☁️ DevOps & Cloud</option>
            <option value="data_ai">🧠 Data & IA</option>
            <option value="design">🎨 Design & UX/UI</option>
            <option value="product">🚀 Product Management</option>
            <option value="marketing_sales">📈 Marketing & Sales</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="jobRegion">Zone géographique autorisée *</label>
          <select id="jobRegion" class="form-select" required>
            <option value="worldwide">🌍 Worldwide (Partout dans le monde)</option>
            <option value="france">🇫🇷 France & Francophonie</option>
            <option value="europe">🇪🇺 Europe & UK</option>
            <option value="americas">🇺🇸 Amériques (USA / Canada / LATAM)</option>
            <option value="apac_mea">🌏 Asie & MEA</option>
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
          <input type="text" id="jobSalary" class="form-input" placeholder="ex: 65 000 € - 85 000 € / an ou 600 € / jour" />
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
        <span style="font-size:0.75rem; color:var(--text-muted);">Un lien de gestion et le reçu officiel Stripe vous seront envoyés à cette adresse.</span>
      </div>

      <div id="postFeedback" style="display:none; padding:1rem; border-radius:8px; margin-bottom:1rem; font-size:0.9rem;"></div>

      <button type="submit" id="postSubmitBtn" class="btn-submit-post">
        <span>🔒</span> Passer au paiement sécurisé Stripe (49 €)
      </button>

      <div class="payment-notice">
        <span>🛡️</span> Paiement sécurisé chiffré par Stripe • Facture avec TVA téléchargeable immédiatement.
      </div>
    </form>
  </main>

  <footer>
    <div class="container">
      <strong>FullRemote.Jobs</strong> — Plateforme opérée par <a href="https://edounze.com" target="_blank" style="color:var(--primary);">Charles EDOU NZE</a>.
    </div>
  </footer>

  <script>
    // URL Query Params Check (Success / Canceled)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const sb = document.getElementById('successBanner');
      if (sb) sb.style.display = 'block';
    } else if (urlParams.get('canceled') === 'true') {
      const cb = document.getElementById('canceledBanner');
      if (cb) cb.style.display = 'block';
    }

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
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }

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
      submitBtn.innerHTML = '<span>⏳</span> Redirection vers Stripe Checkout...';

      try {
        const res = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success && data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          feedback.style.display = 'block';
          feedback.style.backgroundColor = 'rgba(225, 29, 72, 0.15)';
          feedback.style.color = '#e11d48';
          feedback.style.border = '1px solid rgba(225, 29, 72, 0.3)';
          feedback.textContent = '✕ ' + (data.error || 'Erreur lors de la création de la session de paiement.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>🔒</span> Passer au paiement sécurisé Stripe (49 €)';
        }
      } catch (err) {
        feedback.style.display = 'block';
        feedback.style.backgroundColor = 'rgba(225, 29, 72, 0.15)';
        feedback.style.color = '#e11d48';
        feedback.style.border = '1px solid rgba(225, 29, 72, 0.3)';
        feedback.textContent = '✕ Erreur de connexion : ' + err.message;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🔒</span> Passer au paiement sécurisé Stripe (49 €)';
      }
      return false;
    }
  </script>
</body>
</html>`;
}
