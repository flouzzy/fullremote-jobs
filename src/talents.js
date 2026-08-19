/**
 * FullRemote-Jobs - Module Reverse Recruiting & Talent Drops
 * Showcase anonymisé, Vetting, Inscription Candidat et Contact Recruteur Direct
 */

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const SENIORITY_MAP = {
  junior: { label_fr: "Junior (1-2 ans)", label_en: "Junior (1-2 yrs)", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  mid: { label_fr: "Confirmé (3-5 ans)", label_en: "Mid-level (3-5 yrs)", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  senior: { label_fr: "Senior (5-8 ans)", label_en: "Senior (5-8 yrs)", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  lead: { label_fr: "Lead / Staff (8+ ans)", label_en: "Lead / Staff (8+ yrs)", color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  principal: { label_fr: "Principal / Architecte", label_en: "Principal / Architect", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

const AVAILABILITY_MAP = {
  immediate: { label_fr: "🟢 Disponible immédiatement", label_en: "🟢 Available immediately", color: "#10b981" },
  "30_days": { label_fr: "🟡 Dispo sous 30 jours", label_en: "🟡 Available in 30 days", color: "#f59e0b" },
  "60_days": { label_fr: "🔵 Dispo sous 60 jours", label_en: "🔵 Available in 60 days", color: "#3b82f6" },
  passive: { label_fr: "🟣 À l'écoute discrète", label_en: "🟣 Passively looking", color: "#8b5cf6" },
};

/**
 * 1. Vitrine de l'Annuaire des Talents : /talents
 */
export function renderTalentsDirectoryPage(talents = [], meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.edounze.com";
  const canonicalUrl = `${siteUrl}/talents`;
  const count = talents.length;

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vivier de Talents 100% Télétravail (Reverse Recruiting) — FullRemote.Jobs</title>
  <meta name="description" content="Découvrez les meilleurs développeurs, ingénieurs et profils tech 100% télétravail disponibles. Contactez-les en direct sans intermédiaire ni commission." />
  <link rel="canonical" href="${canonicalUrl}" />

  <meta property="og:title" content="Vivier de Talents 100% Télétravail — FullRemote.Jobs" />
  <meta property="og:description" content="Profils seniors et confirmés prêts pour le télétravail. Contactez directement les talents." />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">
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
      --radius: 14px;
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
      background: linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(139,92,246,0.06) 100%);
      border: 1px solid rgba(37,99,235,0.25);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      margin-bottom: 2.5rem;
    }
    .talent-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3rem;
    }
    .talent-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      transition: all 0.18s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .talent-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(37,99,235,0.08);
    }
    .btn-contact {
      background: var(--primary);
      color: white;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: background 0.15s ease;
    }
    .btn-contact:hover { background: var(--primary-hover); }

    /* Modal Backdrop */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-backdrop.open { display: flex; }
    .modal-dialog {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      max-width: 540px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .form-group { margin-bottom: 1rem; }
    .form-label { display: block; font-size: 0.82rem; font-weight: 700; color: var(--text); margin-bottom: 0.35rem; }
    .form-input, .form-textarea {
      width: 100%;
      background: var(--meta-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      font-size: 0.9rem;
      color: var(--text);
      font-family: inherit;
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
        <a href="/" style="font-size:0.88rem; font-weight:600; color:var(--text-muted);">← Annuaire des offres</a>
        <a href="/talents/join" style="font-size:0.85rem; font-weight:700; background:var(--primary); color:white; padding:0.5rem 1rem; border-radius:8px;">
          🚀 Rejoindre le Vivier (Gratuit)
        </a>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero-box">
      <div style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(37,99,235,0.12); color:var(--primary); padding:4px 12px; border-radius:999px; font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem;">
        ⚡ Reverse Recruiting & Talent Drops
      </div>
      <h1 style="font-size:2.2rem; font-weight:800; line-height:1.2; color:var(--text); letter-spacing:-0.03em; margin-bottom:0.75rem;">
        Les Meilleurs Talents 100% Télétravail
      </h1>
      <p style="font-size:1.05rem; color:var(--text-muted); max-width:780px; line-height:1.6; margin-bottom:1.5rem;">
        Consultez les profils confirmés et seniors prêts à démarrer en télétravail. Contactez directement les candidats sans passer par des intermédiaires ni commissions d'agences.
      </p>

      <div style="display:flex; gap:1rem; flex-wrap:wrap; align-items:center;">
        <div style="background:var(--bg-card); border:1px solid var(--border); padding:0.5rem 1rem; border-radius:8px; font-size:0.9rem; font-weight:700; color:var(--emerald);">
          ✨ ${count} profil(s) vérifié(s) disponible(s)
        </div>
        <a href="/talents/join" style="font-size:0.88rem; font-weight:700; color:var(--primary); text-decoration:underline;">
          Vous cherchez un job remote ? Créez votre profil anonyme en 2 minutes →
        </a>
      </div>
    </section>

    <!-- Grille des Talents -->
    <section>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2 style="font-size:1.35rem; font-weight:800; color:var(--text);">
          Profils disponibles cette semaine
        </h2>
        <span style="font-size:0.85rem; color:var(--text-dim);">
          Triés par récence
        </span>
      </div>

      ${count === 0 ? `
        <div style="text-align:center; background:var(--bg-card); border:1px dashed var(--border); border-radius:16px; padding:3rem 1.5rem;">
          <div style="font-size:2.5rem; margin-bottom:0.5rem;">🚀</div>
          <h3 style="font-size:1.2rem; font-weight:700; color:var(--text); margin-bottom:0.5rem;">Le premier Talent Drop arrive !</h3>
          <p style="font-size:0.92rem; color:var(--text-muted); max-width:480px; margin:0 auto 1.5rem auto;">
            Soyez parmi les premiers développeurs à rejoindre le vivier et être contacté en direct par les entreprises remote-first.
          </p>
          <a href="/talents/join" style="background:var(--primary); color:white; font-weight:700; padding:0.75rem 1.5rem; border-radius:8px; font-size:0.9rem;">
            Créer mon profil anonyme gratuit ↗
          </a>
        </div>
      ` : `
        <div class="talent-grid">
          ${talents.map((t, idx) => {
            const seniority = SENIORITY_MAP[t.seniority] || SENIORITY_MAP.senior;
            const availability = AVAILABILITY_MAP[t.availability] || AVAILABILITY_MAP["30_days"];
            const tags = Array.isArray(t.tags) ? t.tags : [];
            const tagsHtml = tags.slice(0, 5).map(tag => `<span style="font-size:0.72rem; color:var(--text-dim); background:var(--meta-bg); border:1px solid var(--border); padding:2px 6px; border-radius:4px;">#${escapeHtml(tag)}</span>`).join(" ");

            return `
            <div class="talent-card">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                  <div>
                    <span style="font-size:0.75rem; font-weight:800; color:var(--text-dim); letter-spacing:0.05em; text-transform:uppercase;">Talent #${idx + 1}</span>
                    <h3 style="font-size:1.1rem; font-weight:800; color:var(--text); margin-top:0.15rem;">${escapeHtml(t.title)}</h3>
                  </div>
                  <span style="font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:6px; background:${seniority.bg}; color:${seniority.color};">
                    ${escapeHtml(seniority.label_fr)}
                  </span>
                </div>

                <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.85rem;">
                  <span style="font-size:0.75rem; font-weight:600; padding:3px 8px; border-radius:6px; background:rgba(37,99,235,0.08); color:var(--primary);">
                    🌍 ${escapeHtml(t.location || "France / Europe")}
                  </span>
                  <span style="font-size:0.75rem; font-weight:600; padding:3px 8px; border-radius:6px; background:rgba(16,185,129,0.08); color:var(--emerald);">
                    ${escapeHtml(availability.label_fr)}
                  </span>
                  ${t.salary_expectation ? `<span style="font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:6px; background:rgba(245,158,11,0.08); color:#d97706;">💰 ${escapeHtml(t.salary_expectation)}</span>` : ""}
                </div>

                ${t.bio_snippet ? `<p style="font-size:0.86rem; color:var(--text-muted); line-height:1.5; margin-bottom:0.85rem; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(t.bio_snippet)}</p>` : ""}
              </div>

              <div>
                <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:1rem;">
                  ${tagsHtml}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:0.85rem;">
                  <span style="font-size:0.75rem; color:var(--text-dim);">🔒 Coordonnées protégées</span>
                  <button class="btn-contact" onclick="openContactModal('${escapeAttr(t.id)}', '${escapeAttr(t.title)}')">
                    ✉️ Contacter en direct ↗
                  </button>
                </div>
              </div>
            </div>
            `;
          }).join("")}
        </div>
      `}
    </section>
  </main>

  <!-- Modal de Contact Direct Recruteur -> Talent -->
  <div id="contactModal" class="modal-backdrop">
    <div class="modal-dialog">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
        <div>
          <h3 style="font-size:1.15rem; font-weight:800; color:var(--text);" id="modalTalentTitle">Contacter ce Talent</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">Votre message sera directement transmis au candidat par email.</p>
        </div>
        <button onclick="closeContactModal()" style="background:none; border:none; font-size:1.25rem; color:var(--text-muted); cursor:pointer;">✕</button>
      </div>

      <form id="contactForm" onsubmit="submitTalentContact(event)">
        <input type="hidden" id="contactTalentId" name="talent_id" value="" />
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="form-group">
            <label class="form-label">Votre Nom *</label>
            <input type="text" id="recruiterName" name="recruiter_name" required class="form-input" placeholder="ex: Jean Dupont" />
          </div>
          <div class="form-group">
            <label class="form-label">Votre Entreprise *</label>
            <input type="text" id="recruiterCompany" name="recruiter_company" required class="form-input" placeholder="ex: Qonto, Dashlane..." />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Votre Email Professionnel *</label>
          <input type="email" id="recruiterEmail" name="recruiter_email" required class="form-input" placeholder="jean@entreprise.com" />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="form-group">
            <label class="form-label">Titre du Poste proposé</label>
            <input type="text" id="jobTitle" name="job_title" class="form-input" placeholder="ex: Lead Backend Laravel" />
          </div>
          <div class="form-group">
            <label class="form-label">Lien de l'offre (optionnel)</label>
            <input type="url" id="jobUrl" name="job_url" class="form-input" placeholder="https://..." />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Message personnalisé pour le candidat *</label>
          <textarea id="contactMessage" name="message" required class="form-textarea" rows="4" placeholder="Présentez brièvement votre entreprise, la stack technique et pourquoi son profil correspond à vos besoins..."></textarea>
        </div>

        <button type="submit" id="submitContactBtn" style="width:100%; background:var(--primary); color:white; font-weight:700; padding:0.75rem; border-radius:8px; border:none; cursor:pointer; font-size:0.95rem;">
          🚀 Envoyer ma proposition au Talent
        </button>
        <div id="contactFeedback" style="display:none; margin-top:0.75rem; font-size:0.85rem; font-weight:600; text-align:center;"></div>
      </form>
    </div>
  </div>

  <script>
    function openContactModal(talentId, title) {
      document.getElementById('contactTalentId').value = talentId;
      document.getElementById('modalTalentTitle').textContent = 'Contacter : ' + title;
      document.getElementById('contactModal').classList.add('open');
    }

    function closeContactModal() {
      document.getElementById('contactModal').classList.remove('open');
      document.getElementById('contactFeedback').style.display = 'none';
    }

    async function submitTalentContact(e) {
      e.preventDefault();
      const btn = document.getElementById('submitContactBtn');
      const feedback = document.getElementById('contactFeedback');
      const talentId = document.getElementById('contactTalentId').value;

      btn.disabled = true;
      btn.textContent = 'Envoi en cours...';

      const payload = {
        talent_id: talentId,
        recruiter_name: document.getElementById('recruiterName').value,
        recruiter_company: document.getElementById('recruiterCompany').value,
        recruiter_email: document.getElementById('recruiterEmail').value,
        job_title: document.getElementById('jobTitle').value,
        job_url: document.getElementById('jobUrl').value,
        message: document.getElementById('contactMessage').value,
      };

      try {
        const res = await fetch('/api/talents/' + encodeURIComponent(talentId) + '/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          feedback.style.display = 'block';
          feedback.style.color = '#10b981';
          feedback.textContent = '✅ Votre message a été transmis avec succès au candidat !';
          setTimeout(() => { closeContactModal(); }, 2500);
        } else {
          feedback.style.display = 'block';
          feedback.style.color = '#ef4444';
          feedback.textContent = '❌ Erreur : ' + (data.error || 'Impossible d\\'envoyer le message.');
        }
      } catch (err) {
        feedback.style.display = 'block';
        feedback.style.color = '#ef4444';
        feedback.textContent = '❌ Erreur réseau. Veuillez réessayer.';
      } finally {
        btn.disabled = false;
        btn.textContent = '🚀 Envoyer ma proposition au Talent';
      }
    }
  </script>
</body>
</html>`;
}

/**
 * 2. Formulaire d'inscription Candidat au Vivier : /talents/join
 */
export function renderJoinTalentPoolPage(meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.edounze.com";

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rejoindre le Vivier de Talents 100% Télétravail — FullRemote.Jobs</title>
  <meta name="description" content="Inscrivez-vous gratuitement au vivier vérifié de talents full remote. Profil anonymisé, sollicitations directes par des entreprises sans intermédiaire." />
  <link rel="canonical" href="${siteUrl}/talents/join" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">
  <style>
    :root {
      --bg: #f8fafc;
      --bg-card: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --emerald: #10b981;
      --meta-bg: #f1f5f9;
      --font-sans: 'Inter', system-ui, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
    header { border-bottom: 1px solid var(--border); background: var(--bg-card); padding: 1rem 0; }
    .header-inner { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .form-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .form-group { margin-bottom: 1.25rem; }
    .form-label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text); margin-bottom: 0.35rem; }
    .form-hint { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem; }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      background: var(--meta-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.92rem;
      color: var(--text);
      font-family: inherit;
    }
    .btn-submit {
      background: var(--primary);
      color: white;
      font-weight: 800;
      font-size: 1rem;
      padding: 0.9rem 1.75rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      width: 100%;
      transition: background 0.15s ease;
    }
    .btn-submit:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" style="font-weight:800; font-size:1.15rem; color:var(--text); text-decoration:none;">
        <span>🌍</span> FullRemote<span style="color:var(--primary);">.Jobs</span>
      </a>
      <a href="/talents" style="font-size:0.85rem; font-weight:600; color:var(--primary); text-decoration:none;">
        ← Voir l'annuaire des talents
      </a>
    </div>
  </header>

  <main class="container">
    <div class="form-card">
      <div style="text-align:center; margin-bottom:2rem;">
        <div style="font-size:2.5rem; margin-bottom:0.5rem;">🚀</div>
        <h1 style="font-size:1.85rem; font-weight:800; color:var(--text); letter-spacing:-0.02em;">
          Rejoindre le Vivier de Talents 100% Remote
        </h1>
        <p style="font-size:0.95rem; color:var(--text-muted); margin-top:0.4rem;">
          Créez votre profil anonyme vérifié et laissez les meilleures entreprises remote-first vous contacter en direct.
        </p>
      </div>

      <form id="talentJoinForm" onsubmit="submitTalentProfile(event)">
        <div class="form-group">
          <label class="form-label">Titre professionnel visé *</label>
          <input type="text" id="talentTitle" name="title" required class="form-input" placeholder="ex: Senior Backend Engineer (Laravel / Go) ou Lead DevOps" />
          <div class="form-hint">Exemples : Senior Fullstack React/Node, Lead Symfony & Cloud, Staff Data Engineer, Fractional CTO...</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Niveau d'expérience / Séniorité *</label>
            <select id="talentSeniority" name="seniority" required class="form-select">
              <option value="junior">Junior (1 - 2 ans d'expérience)</option>
              <option value="mid">Confirmé (3 - 5 ans d'expérience)</option>
              <option value="senior" selected>Senior (5 - 8 ans d'expérience)</option>
              <option value="lead">Lead / Staff (8+ ans d'expérience)</option>
              <option value="principal">Principal / Architecte</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Disponibilité *</label>
            <select id="talentAvailability" name="availability" required class="form-select">
              <option value="immediate">🟢 Immédiate</option>
              <option value="30_days" selected>🟡 Sous 30 jours (Préavis court)</option>
              <option value="60_days">🔵 Sous 60 jours</option>
              <option value="passive">🟣 À l'écoute discrète d'opportunités</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Zone géographique & Fuseau de travail *</label>
            <select id="talentLocation" name="location" required class="form-select">
              <option value="France & Francophonie (UTC+1 / CET)" selected>🇫🇷 France & Francophonie (UTC+1 / CET)</option>
              <option value="Europe & UK (UTC±0 à UTC+2)">🇪🇺 Europe & UK (UTC±0 à UTC+2)</option>
              <option value="Worldwide (Global / Anywhere)">🌍 Worldwide / Sans limite (Global Anywhere)</option>
              <option value="Amériques (EST / PST / UTC-5 à UTC-8)">🇺🇸 Amériques (EST / PST / UTC-5 à UTC-8)</option>
              <option value="Asie & Pacifique (UTC+7 à UTC+10)">🌏 Asie & Pacifique (UTC+7 à UTC+10)</option>
              <option value="MEA & Afrique (UTC+0 à UTC+4)">🌍 MEA / Afrique & Moyen-Orient (UTC+0 à UTC+4)</option>
              <option value="Digital Nomad (Flexible / Async-First)">🏝️ Nomade Digital (Fuseau flexible / Async)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Prétentions salariales ou TJM visé *</label>
            <select id="talentSalary" name="salary_expectation" required class="form-select">
              <option value="45k - 55k € / an">💼 CDI : 45k - 55k € / an</option>
              <option value="55k - 65k € / an">💼 CDI : 55k - 65k € / an</option>
              <option value="65k - 80k € / an" selected>💼 CDI : 65k - 80k € / an</option>
              <option value="80k - 100k € / an">💼 CDI : 80k - 100k € / an</option>
              <option value="100k - 130k € / an">💼 CDI : 100k - 130k € / an</option>
              <option value="130k - 160k € / an (US Tech)">💼 CDI : 130k - 160k € / an (US Tech / Scale-up)</option>
              <option value="> 160k € / an (Staff / Principal)">💼 CDI : > 160k € / an (Staff / Principal)</option>
              <option value="TJM : 350€ - 450€ / jour">⚡ Freelance : 350€ - 450€ / jour (TJM)</option>
              <option value="TJM : 450€ - 600€ / jour">⚡ Freelance : 450€ - 600€ / jour (TJM)</option>
              <option value="TJM : 600€ - 800€ / jour">⚡ Freelance : 600€ - 800€ / jour (TJM)</option>
              <option value="TJM : > 800€ / jour">⚡ Freelance : > 800€ / jour (Expert / Architect)</option>
              <option value="Gratification Stage / Alternance">🎓 Stage & Alternance : Gratification / Salaire légal</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Stack technique principale *</label>
          <input type="text" id="talentStack" name="primary_stack" required class="form-input" placeholder="ex: PHP, Laravel, Vue.js, PostgreSQL, Docker, AWS" />
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.45rem;">
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700; align-self:center;">+ Suggestions :</span>
            ${["PHP", "Laravel", "Symfony", "React", "TypeScript", "Vue.js", "Python", "Go", "Rust", "Java", "C#", "Docker", "Kubernetes", "AWS", "PostgreSQL", "IA/LLM", "Node.js"].map(tag => `
              <button type="button" onclick="addStackTag('${tag}')" style="font-size:0.72rem; font-weight:600; padding:2px 7px; border-radius:6px; border:1px solid var(--border); background:var(--meta-bg); color:var(--text); cursor:pointer; transition:all 0.15s ease;">
                + ${tag}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Bio synthétique & Réalisations (Proof-of-Work) *</label>
          <textarea id="talentBio" name="bio_snippet" required class="form-textarea" rows="4" placeholder="Décrivez en 3-4 phrases votre valeur ajoutée : ex-entreprises, défis d'échelle résolus, autonomie en remote, architecture conçue..."></textarea>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Lien GitHub (optionnel mais recommandé)</label>
            <input type="url" id="talentGithub" name="github_url" class="form-input" placeholder="https://github.com/votreprofil" />
          </div>
          <div class="form-group">
            <label class="form-label">Lien Portfolio / LinkedIn (optionnel)</label>
            <input type="url" id="talentPortfolio" name="portfolio_url" class="form-input" placeholder="https://votre-site.com ou linkedin..." />
          </div>
        </div>

        <div class="form-group" style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:1.25rem; margin-top:1.5rem;">
          <label class="form-label" style="color:#1e40af;">Votre Adresse Email Réelle (Privée & Protégée) *</label>
          <input type="email" id="talentEmail" name="email" required class="form-input" style="background:white;" placeholder="votre.email@domaine.com" />
          <div class="form-hint" style="color:#3b82f6;">
            🔒 Jamais rendue publique. Utilisée exclusivement pour vous envoyer les sollicitations d'entreprises et votre lien privé de gestion.
          </div>
        </div>

        <button type="submit" id="submitTalentBtn" class="btn-submit" style="margin-top:1rem;">
          🚀 Activer mon Profil Talent Gratuitement
        </button>

        <div id="joinFeedback" style="display:none; margin-top:1rem; font-size:0.9rem; font-weight:700; text-align:center; padding:0.75rem; border-radius:8px;"></div>
      </form>
    </div>
  </main>

  <script>
    function addStackTag(tag) {
      const input = document.getElementById('talentStack');
      if (!input) return;
      const current = input.value.split(',').map(s => s.trim()).filter(Boolean);
      if (!current.includes(tag)) {
        current.push(tag);
        input.value = current.join(', ');
      }
    }

    async function submitTalentProfile(e) {
      e.preventDefault();
      const btn = document.getElementById('submitTalentBtn');
      const feedback = document.getElementById('joinFeedback');

      btn.disabled = true;
      btn.textContent = 'Création du profil en cours...';

      const stackRaw = document.getElementById('talentStack').value;
      const tags = stackRaw.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        title: document.getElementById('talentTitle').value,
        seniority: document.getElementById('talentSeniority').value,
        availability: document.getElementById('talentAvailability').value,
        primary_stack: stackRaw,
        tags,
        salary_expectation: document.getElementById('talentSalary').value,
        location: document.getElementById('talentLocation').value,
        bio_snippet: document.getElementById('talentBio').value,
        github_url: document.getElementById('talentGithub').value,
        portfolio_url: document.getElementById('talentPortfolio').value,
        email: document.getElementById('talentEmail').value,
      };

      try {
        const res = await fetch('/api/talents/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          feedback.style.display = 'block';
          feedback.style.background = 'rgba(16,185,129,0.12)';
          feedback.style.color = '#047857';
          feedback.textContent = '🎉 Félicitations ! Votre profil est activé. Un email de confirmation contenant votre lien de gestion vous a été envoyé.';
          document.getElementById('talentJoinForm').reset();
          setTimeout(() => { window.location.href = '/talents'; }, 3000);
        } else {
          feedback.style.display = 'block';
          feedback.style.background = 'rgba(239,68,68,0.12)';
          feedback.style.color = '#b91c1c';
          feedback.textContent = '❌ Erreur : ' + (data.error || 'Impossible d\\'enregistrer le profil.');
        }
      } catch (err) {
        feedback.style.display = 'block';
        feedback.style.background = 'rgba(239,68,68,0.12)';
        feedback.style.color = '#b91c1c';
        feedback.textContent = '❌ Erreur réseau. Veuillez réessayer.';
      } finally {
        btn.disabled = false;
        btn.textContent = '🚀 Activer mon Profil Talent Gratuitement';
      }
    }
  </script>
</body>
</html>`;
}

/**
 * 3. Page de Gestion Candidat (Mettre en pause ou réactiver) : /talents/manage?token=...
 */
export function renderManageTalentPage(talent, successMsg = "", errorMsg = "", meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.edounze.com";

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gestion de Profil Talent — FullRemote.Jobs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #f8fafc; --bg-card: #ffffff; --border: #e2e8f0; --text: #0f172a; --text-muted: #64748b;
      --primary: #2563eb; --emerald: #10b981; --font-sans: 'Inter', system-ui, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); padding: 2rem 1rem; }
    .card { max-width: 600px; margin: 0 auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 2.5rem; }
    .btn { padding: 0.65rem 1.25rem; font-size: 0.9rem; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-pause { background: #f59e0b; color: white; }
    .btn-hired { background: #10b981; color: white; }
  </style>
</head>
<body>
  <div class="card">
    <div style="text-align:center; margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;">⚙️</div>
      <h1 style="font-size:1.5rem; font-weight:800; margin-top:0.25rem;">Espace Gestion Talent</h1>
      <p style="font-size:0.88rem; color:var(--text-muted);">Gérez la visibilité de votre profil sur FullRemote.Jobs</p>
    </div>

    ${successMsg ? `<div style="background:rgba(16,185,129,0.12); color:#047857; padding:0.75rem; border-radius:8px; font-weight:700; margin-bottom:1.5rem; text-align:center;">${escapeHtml(successMsg)}</div>` : ""}
    ${errorMsg ? `<div style="background:rgba(239,68,68,0.12); color:#b91c1c; padding:0.75rem; border-radius:8px; font-weight:700; margin-bottom:1.5rem; text-align:center;">${escapeHtml(errorMsg)}</div>` : ""}

    <div style="background:#f8fafc; border:1px solid var(--border); border-radius:12px; padding:1.25rem; margin-bottom:1.5rem;">
      <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Statut Actuel</div>
      <div style="font-size:1.15rem; font-weight:800; color:${talent.status === 'active' ? '#10b981' : '#f59e0b'}; margin-top:0.25rem;">
        ${talent.status === 'active' ? '🟢 Actif (Visible par les recruteurs)' : (talent.status === 'hired' ? '🎉 Recruté / Hired' : '⏸️ En pause')}
      </div>
      <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem;">
        Poste : <strong>${escapeHtml(talent.title)}</strong><br>
        Email : <strong>${escapeHtml(talent.email)}</strong><br>
        Sollicitations reçues : <strong>${talent.contact_count || 0}</strong>
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:0.75rem;">
      ${talent.status !== 'active' ? `
        <form method="POST" action="/api/talents/manage/status">
          <input type="hidden" name="token" value="${escapeAttr(talent.manage_token)}" />
          <input type="hidden" name="status" value="active" />
          <button type="submit" class="btn btn-primary" style="width:100%;">▶️ Réactiver mon profil</button>
        </form>
      ` : `
        <form method="POST" action="/api/talents/manage/status">
          <input type="hidden" name="token" value="${escapeAttr(talent.manage_token)}" />
          <input type="hidden" name="status" value="paused" />
          <button type="submit" class="btn btn-pause" style="width:100%;">⏸️ Mettre mon profil en pause</button>
        </form>
        <form method="POST" action="/api/talents/manage/status">
          <input type="hidden" name="token" value="${escapeAttr(talent.manage_token)}" />
          <input type="hidden" name="status" value="hired" />
          <button type="submit" class="btn btn-hired" style="width:100%;">🎉 J'ai trouvé un job (Retirer du vivier)</button>
        </form>
      `}
      <a href="/talents" style="text-align:center; font-size:0.85rem; color:var(--primary); font-weight:600; margin-top:0.5rem;">
        ← Retour à l'annuaire des talents
      </a>
    </div>
  </div>
</body>
</html>`;
}
