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
        ${meta.talentToken ? `
          <a href="/talents/manage?token=${encodeURIComponent(meta.talentToken)}" id="talentHeaderAuthBtn" style="font-size:0.85rem; font-weight:700; background:rgba(37,99,235,0.1); color:var(--primary); border:1px solid var(--primary); padding:0.5rem 1rem; border-radius:8px; text-decoration:none;">
            ⚙️ Mon Espace Talent
          </a>
        ` : `
          <a href="/talents/join" id="talentHeaderAuthBtn" style="font-size:0.85rem; font-weight:700; background:var(--primary); color:white; padding:0.5rem 1rem; border-radius:8px; text-decoration:none;">
            🚀 Rejoindre le Vivier (Gratuit)
          </a>
        `}
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
        ${meta.talentToken ? `
          <a href="/talents/manage?token=${encodeURIComponent(meta.talentToken)}" id="talentHeroAuthLink" style="font-size:0.88rem; font-weight:700; color:var(--primary); text-decoration:underline;">
            Accéder à votre espace privé Talent →
          </a>
        ` : `
          <a href="/talents/join" id="talentHeroAuthLink" style="font-size:0.88rem; font-weight:700; color:var(--primary); text-decoration:underline;">
            Vous cherchez un job remote ? Créez votre profil anonyme en 2 minutes →
          </a>
        `}
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
                  ${(t.cv_data || t.cv_url) ? `<span style="font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:6px; background:rgba(16,185,129,0.1); color:var(--emerald); border:1px solid rgba(16,185,129,0.25);">📄 CV vérifié</span>` : ""}
                </div>

                ${t.bio_snippet ? `<p style="font-size:0.86rem; color:var(--text-muted); line-height:1.5; margin-bottom:0.85rem; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(t.bio_snippet)}</p>` : ""}
              </div>

              <div>
                <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:1rem;">
                  ${tagsHtml}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:0.85rem; flex-wrap:wrap; gap:0.5rem;">
                  ${(t.cv_data || t.cv_url) ? `
                    <a href="/api/talents/${encodeURIComponent(t.id)}/cv" target="_blank" rel="noopener noreferrer" style="font-size:0.78rem; font-weight:700; color:var(--primary); text-decoration:none; display:inline-flex; align-items:center; gap:0.25rem;">
                      📄 Voir le CV ↗
                    </a>
                  ` : `
                    <span style="font-size:0.75rem; color:var(--text-dim);">🔒 Contact protégé</span>
                  `}
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

    // Vérification de la session Talent locale
    document.addEventListener('DOMContentLoaded', () => {
      try {
        const savedTalentToken = localStorage.getItem('fullremote_talent_token');
        if (savedTalentToken) {
          const btn = document.getElementById('talentHeaderAuthBtn');
          if (btn) {
            btn.href = '/talents/manage?token=' + encodeURIComponent(savedTalentToken);
            btn.innerHTML = '⚙️ Mon Espace Talent';
            btn.style.background = 'rgba(37,99,235,0.12)';
            btn.style.color = 'var(--primary)';
            btn.style.border = '1px solid rgba(37,99,235,0.3)';
          }
          const heroLink = document.getElementById('talentHeroAuthLink');
          if (heroLink) {
            heroLink.href = '/talents/manage?token=' + encodeURIComponent(savedTalentToken);
            heroLink.innerHTML = 'Accéder à votre espace privé Talent →';
          }
        }
      } catch (_) {}
    });
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
        <div style="margin-top:0.75rem; font-size:0.85rem;">
          <span style="color:var(--text-muted);">Déjà inscrit au vivier ?</span>
          <a href="/talents/login" style="color:var(--primary); font-weight:700; text-decoration:none; margin-left:0.35rem;">
            🔑 Me connecter par email (Magic Link) →
          </a>
        </div>
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

        <!-- CV Upload / Lien CV -->
        <div class="form-group" style="border: 2px dashed var(--border); border-radius: 12px; padding: 1.5rem; text-align: center; background: var(--meta-bg); margin-top: 1rem;">
          <div style="font-size: 1.8rem; margin-bottom: 0.25rem;">📄</div>
          <label class="form-label" style="font-size: 0.92rem; margin-bottom: 0.25rem;">
            Curriculum Vitae / CV (Optionnel mais fortement valorisé)
          </label>
          <p style="font-size: 0.78rem; color: var(--text-muted); max-width: 520px; margin: 0 auto 0.75rem auto;">
            Téléversez votre CV au format PDF ou Word (max 3 Mo) ou renseignez un lien public (Google Drive, Notion, Portfolio).
          </p>

          <input type="file" id="talentCvFile" accept=".pdf,.docx,.doc" style="display:none;" onchange="handleCvFileSelect(event)" />
          
          <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap; align-items:center;">
            <button type="button" onclick="document.getElementById('talentCvFile').click()" style="background:var(--bg-card); border:1px solid var(--border); color:var(--text); font-weight:700; font-size:0.82rem; padding:0.5rem 1rem; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:0.35rem;">
              📁 Déposer un fichier PDF / Word
            </button>
            <span style="font-size:0.8rem; color:var(--text-dim);">ou</span>
            <input type="url" id="talentCvUrl" name="cv_url" placeholder="Lien CV web (Drive, Notion...)" class="form-input" style="max-width:280px; font-size:0.82rem; padding:0.45rem 0.75rem;" />
          </div>

          <div id="cvFilePreview" style="display:none; margin-top:0.75rem; font-size:0.85rem; color:var(--emerald); font-weight:700; align-items:center; justify-content:center; gap:0.5rem;">
            <span>✅ <span id="cvFileNameDisplay">mon_cv.pdf</span> (<span id="cvFileSizeDisplay">120 Ko</span>)</span>
            <button type="button" onclick="removeCvFile()" style="background:none; border:none; color:#ef4444; font-size:0.8rem; cursor:pointer; font-weight:600; text-decoration:underline;">Supprimer</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem;">
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
          <div class="form-hint" style="color:#3b82f6; line-height:1.5;">
            🔒 Jamais rendue publique. Utilisée exclusivement pour vous envoyer les sollicitations d'entreprises et votre lien privé de gestion.
          </div>
          <div style="margin-top:0.6rem; font-size:0.78rem; color:#1e40af; background:rgba(255,255,255,0.7); padding:0.5rem 0.75rem; border-radius:6px; border:1px solid #dbeafe; display:flex; align-items:center; gap:0.4rem;">
            <span>📬</span>
            <span><strong>Anti-Spam :</strong> Lors du premier email, pensez à vérifier votre dossier <em>Courrier indésirable / Spams</em> et cliquez sur <strong>"Non-spam"</strong> pour recevoir toutes les opportunités.</span>
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
    let cvBase64 = null;
    let cvFilename = null;

    function handleCvFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 3 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (maximum 3 Mo).');
        e.target.value = '';
        return;
      }
      cvFilename = file.name;
      const reader = new FileReader();
      reader.onload = function(evt) {
        cvBase64 = evt.target.result;
        document.getElementById('cvFileNameDisplay').textContent = file.name;
        document.getElementById('cvFileSizeDisplay').textContent = Math.round(file.size / 1024) + ' Ko';
        document.getElementById('cvFilePreview').style.display = 'flex';
      };
      reader.readAsDataURL(file);
    }

    function removeCvFile() {
      cvBase64 = null;
      cvFilename = null;
      document.getElementById('talentCvFile').value = '';
      document.getElementById('cvFilePreview').style.display = 'none';
    }

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
        cv_url: document.getElementById('talentCvUrl')?.value || '',
        cv_data: cvBase64 || '',
        cv_filename: cvFilename || '',
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
          const manageUrl = data.manage_token ? '/talents/manage?token=' + encodeURIComponent(data.manage_token) + '&welcome=1' : '/talents';
          feedback.style.display = 'block';
          feedback.style.background = 'rgba(16,185,129,0.12)';
          feedback.style.color = '#047857';
          feedback.textContent = '🎉 Félicitations ! Votre profil est activé. Redirection vers votre espace privé...';
          document.getElementById('talentJoinForm').reset();
          setTimeout(() => { window.location.href = manageUrl; }, 1200);
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
 * 3. Page de Gestion Candidat & Tableau de Bord Privé : /talents/manage?token=...
 */
export function renderManageTalentPage(talent, successMsg = "", errorMsg = "", meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.edounze.com";
  const isWelcome = meta.welcome || false;
  const seniority = SENIORITY_MAP[talent.seniority] || SENIORITY_MAP.senior;
  const availability = AVAILABILITY_MAP[talent.availability] || AVAILABILITY_MAP["30_days"];
  const tags = Array.isArray(talent.tags) ? talent.tags : [];
  const tagsHtml = tags.map(tag => `<span style="font-size:0.75rem; color:var(--text); background:var(--meta-bg); border:1px solid var(--border); padding:3px 8px; border-radius:6px; font-weight:600;">#${escapeHtml(tag)}</span>`).join(" ");

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Espace Privé Talent — FullRemote.Jobs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚙️</text></svg>">
  <style>
    :root {
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
      --font-sans: 'Inter', system-ui, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.6; min-height: 100vh; }
    .container { max-width: 840px; margin: 0 auto; padding: 2rem 1.5rem; }
    header { border-bottom: 1px solid var(--border); background: var(--bg-card); padding: 1rem 0; }
    .header-inner { max-width: 840px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .btn { padding: 0.65rem 1.25rem; font-size: 0.88rem; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; transition: all 0.15s ease; }
    .btn-primary { background: var(--primary); color: white !important; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-pause { background: #f59e0b; color: white !important; }
    .btn-pause:hover { background: #d97706; }
    .btn-hired { background: #10b981; color: white !important; }
    .btn-hired:hover { background: #059669; }
    .form-select { width: 100%; background: var(--meta-bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.65rem 0.85rem; font-size: 0.9rem; color: var(--text); font-family: inherit; }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" style="font-weight:800; font-size:1.15rem; color:var(--text); text-decoration:none; display:flex; align-items:center; gap:0.4rem;">
        <span>🌍</span> FullRemote<span style="color:var(--primary);">.Jobs</span>
      </a>
      <div style="display:flex; align-items:center; gap:1rem;">
        <a href="/talents" style="font-size:0.85rem; font-weight:600; color:var(--primary); text-decoration:none;">
          ← Annuaire des Talents
        </a>
      </div>
    </div>
  </header>

  <main class="container">
    ${isWelcome ? `
      <div style="background:linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(37,99,235,0.1) 100%); border:1px solid rgba(16,185,129,0.3); border-radius:16px; padding:1.75rem; margin-bottom:1.5rem; text-align:center;">
        <div style="font-size:2rem; margin-bottom:0.25rem;">🎉</div>
        <h2 style="font-size:1.4rem; font-weight:800; color:#047857; margin-bottom:0.35rem;">Votre profil Talent est en ligne !</h2>
        <p style="font-size:0.92rem; color:var(--text); max-width:600px; margin:0 auto;">
          Bienvenue dans le vivier. Conservez cette page dans vos favoris : c'est votre lien privé et sécurisé pour gérer vos préférences, vos alertes d'offres et votre disponibilité.
        </p>
      </div>
    ` : ""}

    ${successMsg ? `
      <div style="background:rgba(16,185,129,0.12); color:#047857; border:1px solid rgba(16,185,129,0.25); padding:0.85rem 1.25rem; border-radius:12px; font-weight:700; margin-bottom:1.5rem; text-align:center;">
        ✅ ${escapeHtml(successMsg)}
      </div>
    ` : ""}

    ${errorMsg ? `
      <div style="background:rgba(239,68,68,0.12); color:#b91c1c; border:1px solid rgba(239,68,68,0.25); padding:0.85rem 1.25rem; border-radius:12px; font-weight:700; margin-bottom:1.5rem; text-align:center;">
        ❌ ${escapeHtml(errorMsg)}
      </div>
    ` : ""}

    <!-- 1. Statut & Visibilité en direct -->
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em;">Statut & Visibilité</div>
          <h2 style="font-size:1.35rem; font-weight:800; color:var(--text); margin-top:0.2rem;">
            ${talent.status === 'active' ? '🟢 Profil Actif & Visible' : (talent.status === 'hired' ? '🎉 Recruté / Hired' : '⏸️ Profil en Pause')}
          </h2>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">
            ${talent.status === 'active' ? 'Les entreprises et recruteurs vérifiés peuvent vous envoyer des propositions par email.' : 'Votre profil est actuellement masqué de l\'annuaire public.'}
          </p>
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          ${talent.status !== 'active' ? `
            <form method="POST" action="/api/talents/manage/status">
              <input type="hidden" name="token" value="${escapeAttr(talent.manage_token)}" />
              <input type="hidden" name="status" value="active" />
              <button type="submit" class="btn btn-primary">▶️ Réactiver mon profil</button>
            </form>
          ` : `
            <form method="POST" action="/api/talents/manage/status">
              <input type="hidden" name="token" value="${escapeAttr(talent.manage_token)}" />
              <input type="hidden" name="status" value="paused" />
              <button type="submit" class="btn btn-pause">⏸️ Mettre en pause</button>
            </form>
            <form method="POST" action="/api/talents/manage/status">
              <input type="hidden" name="token" value="${escapeAttr(talent.manage_token)}" />
              <input type="hidden" name="status" value="hired" />
              <button type="submit" class="btn btn-hired">🎉 J'ai été recruté</button>
            </form>
          `}
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:0.75rem; padding-top:1rem; border-top:1px solid var(--border);">
        <div style="background:var(--meta-bg); padding:0.75rem 1rem; border-radius:10px;">
          <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Sollicitations</div>
          <div style="font-size:1.25rem; font-weight:800; color:var(--primary);">${talent.contact_count || 0} reçue(s)</div>
        </div>
        <div style="background:var(--meta-bg); padding:0.75rem 1rem; border-radius:10px;">
          <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Vues profil</div>
          <div style="font-size:1.25rem; font-weight:800; color:var(--text);">${talent.view_count || 0}</div>
        </div>
        <div style="background:var(--meta-bg); padding:0.75rem 1rem; border-radius:10px;">
          <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Email Protégé</div>
          <div style="font-size:0.85rem; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(talent.email)}</div>
        </div>
      </div>
    </div>

    <!-- 2. Aperçu & Édition de votre Fiche Candidat -->
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <h3 style="font-size:1.15rem; font-weight:800; color:var(--text);">
            📋 Votre Fiche Talent (Vue Recruteurs)
          </h3>
          <span style="font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:6px; background:${seniority.bg}; color:${seniority.color};">
            ${escapeHtml(seniority.label_fr)}
          </span>
        </div>
        <button class="btn btn-primary" onclick="toggleEditProfile()" id="toggleEditBtn" style="font-size:0.8rem; padding:0.45rem 0.9rem;">
          ✏️ Modifier ma fiche & CV
        </button>
      </div>

      <!-- Formulaire d'Édition Profil Inline (Masqué par défaut) -->
      <div id="editProfileBox" style="display:none; background:var(--meta-bg); border:1px solid var(--border); border-radius:12px; padding:1.5rem; margin-bottom:1.5rem;">
        <h4 style="font-size:1.05rem; font-weight:800; color:var(--text); margin-bottom:1rem;">
          ✏️ Mettre à jour vos informations candidat
        </h4>
        <form id="profileEditForm" onsubmit="submitProfileEdit(event)">
          <input type="hidden" id="editToken" value="${escapeAttr(talent.manage_token)}" />

          <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Titre professionnel *</label>
            <input type="text" id="editTitle" required class="form-select" value="${escapeAttr(talent.title)}" style="background:#ffffff;" />
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Séniorité *</label>
              <select id="editSeniority" class="form-select" style="background:#ffffff;">
                <option value="junior" ${talent.seniority === 'junior' ? 'selected' : ''}>Junior (1-2 ans)</option>
                <option value="mid" ${talent.seniority === 'mid' ? 'selected' : ''}>Confirmé (3-5 ans)</option>
                <option value="senior" ${talent.seniority === 'senior' ? 'selected' : ''}>Senior (5-8 ans)</option>
                <option value="lead" ${talent.seniority === 'lead' ? 'selected' : ''}>Lead / Staff (8+ ans)</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Disponibilité *</label>
              <select id="editAvailability" class="form-select" style="background:#ffffff;">
                <option value="immediate" ${talent.availability === 'immediate' ? 'selected' : ''}>🟢 Immédiate (Disponible)</option>
                <option value="15_days" ${talent.availability === '15_days' ? 'selected' : ''}>🟡 Sous 15 jours</option>
                <option value="30_days" ${talent.availability === '30_days' ? 'selected' : ''}>🟡 Sous 30 jours (Préavis court)</option>
                <option value="60_days" ${talent.availability === '60_days' ? 'selected' : ''}>🟠 Sous 2 à 3 mois (Préavis standard)</option>
                <option value="discreet" ${talent.availability === 'discreet' ? 'selected' : ''}>🟣 À l'écoute discrète</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Zone géographique & Fuseau</label>
              <select id="editLocation" class="form-select" style="background:#ffffff;">
                <option value="🇫🇷 France & Francophonie (UTC+1 / CET)" ${talent.location && talent.location.includes('France') ? 'selected' : ''}>🇫🇷 France & Francophonie (UTC+1 / CET)</option>
                <option value="🇪🇺 Europe & UK (CET / GMT)" ${talent.location && talent.location.includes('Europe') ? 'selected' : ''}>🇪🇺 Europe & UK (CET / GMT)</option>
                <option value="🌍 Worldwide (100% télétravail mondial)" ${talent.location && talent.location.includes('Worldwide') ? 'selected' : ''}>🌍 Worldwide (100% télétravail mondial)</option>
                <option value="🇺🇸 Amériques (EST / PST / UTC-5 à UTC-8)" ${talent.location && talent.location.includes('Amériques') ? 'selected' : ''}>🇺🇸 Amériques (EST / PST / UTC-5 à UTC-8)</option>
                <option value="🏝️ Nomade Digital (Fuseaux flexibles)" ${talent.location && talent.location.includes('Nomade') ? 'selected' : ''}>🏝️ Nomade Digital (Fuseaux flexibles)</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Prétentions salariales ou TJM</label>
              <input type="text" id="editSalary" class="form-select" value="${escapeAttr(talent.salary_expectation || '')}" placeholder="ex: CDI : 65k - 80k € / an ou TJM : 550€" style="background:#ffffff;" />
            </div>
          </div>

          <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Stack technique principale *</label>
            <input type="text" id="editStack" required class="form-select" value="${escapeAttr(talent.primary_stack || '')}" placeholder="ex: Symfony, PHP, React, Docker, IA/LLM" style="background:#ffffff;" />
          </div>

          <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Bio synthétique & Réalisations (Proof-of-Work)</label>
            <textarea id="editBio" rows="4" class="form-select" style="background:#ffffff; resize:vertical;">${escapeHtml(talent.bio_snippet || '')}</textarea>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Lien GitHub</label>
              <input type="url" id="editGithub" class="form-select" value="${escapeAttr(talent.github_url || '')}" placeholder="https://github.com/..." style="background:#ffffff;" />
            </div>
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Lien Portfolio / LinkedIn</label>
              <input type="url" id="editPortfolio" class="form-select" value="${escapeAttr(talent.portfolio_url || '')}" placeholder="https://linkedin.com/in/..." style="background:#ffffff;" />
            </div>
          </div>

          <div style="margin-bottom:1.25rem;">
            <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.35rem;">Remplacer mon CV (Fichier PDF/Word ou URL)</label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <input type="file" id="editCvFile" accept=".pdf,.docx,.doc" onchange="handleEditCvFile(event)" class="form-select" style="background:#ffffff; padding:0.45rem;" />
              <input type="url" id="editCvUrl" class="form-select" value="${escapeAttr(talent.cv_url || '')}" placeholder="Lien CV web (Drive, Notion...)" style="background:#ffffff;" />
            </div>
            <div id="editCvFilePreview" style="font-size:0.78rem; color:var(--emerald); font-weight:700; margin-top:0.35rem;"></div>
          </div>

          <div style="display:flex; gap:0.75rem; align-items:center;">
            <button type="submit" id="saveProfileBtn" class="btn btn-primary">
              💾 Enregistrer les modifications
            </button>
            <button type="button" class="btn btn-outline" onclick="toggleEditProfile()">
              Annuler
            </button>
          </div>
          <div id="editFeedback" style="display:none; margin-top:0.75rem; padding:0.65rem; border-radius:8px; font-weight:700; font-size:0.85rem;"></div>
        </form>
      </div>

      <!-- Fiche en lecture seule -->
      <div style="background:var(--meta-bg); border:1px solid var(--border); border-radius:12px; padding:1.25rem; margin-bottom:1.25rem;">
        <h4 style="font-size:1.2rem; font-weight:800; color:var(--text); margin-bottom:0.5rem;">
          ${escapeHtml(talent.title)}
        </h4>

        <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.85rem;">
          <span style="font-size:0.75rem; font-weight:600; padding:3px 8px; border-radius:6px; background:rgba(37,99,235,0.08); color:var(--primary);">
            🌍 ${escapeHtml(talent.location || "France / Europe")}
          </span>
          <span style="font-size:0.75rem; font-weight:600; padding:3px 8px; border-radius:6px; background:rgba(16,185,129,0.08); color:var(--emerald);">
            ${escapeHtml(availability.label_fr)}
          </span>
          ${talent.salary_expectation ? `<span style="font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:6px; background:rgba(245,158,11,0.08); color:#d97706;">💰 ${escapeHtml(talent.salary_expectation)}</span>` : ""}
          ${(talent.cv_data || talent.cv_url) ? `<span style="font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:6px; background:rgba(16,185,129,0.1); color:var(--emerald); border:1px solid rgba(16,185,129,0.25);">📄 CV vérifié</span>` : ""}
        </div>

        ${talent.bio_snippet ? `<p style="font-size:0.9rem; color:var(--text); line-height:1.6; margin-bottom:1rem; white-space:pre-line;">${escapeHtml(talent.bio_snippet)}</p>` : ""}

        <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:1rem;">
          ${tagsHtml}
        </div>

        <div style="display:flex; gap:1rem; flex-wrap:wrap; padding-top:0.75rem; border-top:1px solid var(--border); font-size:0.82rem;">
          ${(talent.cv_data || talent.cv_url) ? `
            <a href="/api/talents/${encodeURIComponent(talent.id)}/cv" target="_blank" style="color:var(--primary); font-weight:700; text-decoration:none;">
              📄 Consulter mon CV rattaché ↗
            </a>
          ` : `<span style="color:var(--text-dim);">Aucun CV rattaché</span>`}
          ${talent.github_url ? `<a href="${escapeHtml(talent.github_url)}" target="_blank" style="color:var(--text-muted); font-weight:600; text-decoration:none;">★ GitHub ↗</a>` : ""}
          ${talent.portfolio_url ? `<a href="${escapeHtml(talent.portfolio_url)}" target="_blank" style="color:var(--text-muted); font-weight:600; text-decoration:none;">🔗 Portfolio / LinkedIn ↗</a>` : ""}
        </div>
      </div>
    </div>

    <!-- 3. Préférences d'Alertes Offres d'Emploi (Job Drops) -->
    <div class="card">
      <div style="margin-bottom:1.25rem;">
        <h3 style="font-size:1.15rem; font-weight:800; color:var(--text); margin-bottom:0.25rem;">
          🔔 Alertes Offres d'Emploi Personnalisées
        </h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">
          Recevez automatiquement les opportunités 100% télétravail correspondant à votre stack (${escapeHtml(talent.primary_stack || "votre profil")}).
        </p>
      </div>

      <form method="POST" action="/api/talents/manage/alert">
        <input type="hidden" name="token" value="${escapeAttr(talent.manage_token)}" />
        <div style="display:grid; grid-template-columns:1fr auto; gap:0.75rem; align-items:center;">
          <select name="frequency" class="form-select">
            <option value="weekly" selected>📬 Hebdomadaire (Recommandé — Le digest chaque lundi matin)</option>
            <option value="daily">⚡ Quotidien (Les nouvelles opportunités chaque matin)</option>
            <option value="monthly">📅 Mensuel (Le récapitulatif du mois)</option>
            <option value="off">🚫 Désactiver les alertes d'offres (Conserver uniquement les contacts recruteurs)</option>
          </select>
          <button type="submit" class="btn btn-primary" style="white-space:nowrap;">
            Enregistrer
          </button>
        </div>
      </form>
    </div>

    <!-- 4. Guide & Tutoriel d'Onboarding Remote 10x -->
    <div class="card" style="background:linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(139,92,246,0.04) 100%); border:1px solid rgba(37,99,235,0.18);">
      <h3 style="font-size:1.15rem; font-weight:800; color:var(--text); margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">
        <span>💡</span> Guide : 3 conseils pour maximiser vos prises de contact
      </h3>
      <div style="display:grid; gap:0.85rem; font-size:0.88rem; color:var(--text);">
        <div style="display:flex; gap:0.6rem; align-items:flex-start;">
          <span style="font-size:1.1rem; flex-shrink:0;">📌</span>
          <div>
            <strong>1. Mettez en avant votre Proof-of-Work :</strong>
            <span style="color:var(--text-muted);"> Les startups recrutant en remote recherchent des preuves d'exécution (dépôts GitHub publics, projets en production, architectures modulaires).</span>
          </div>
        </div>
        <div style="display:flex; gap:0.6rem; align-items:flex-start;">
          <span style="font-size:1.1rem; flex-shrink:0;">📌</span>
          <div>
            <strong>2. Rémunération & TJM transparents :</strong>
            <span style="color:var(--text-muted);"> Indiquer une fourchette réaliste dès le départ filtre 100% des entretiens hors budget et vous fait gagner un temps précieux.</span>
          </div>
        </div>
        <div style="display:flex; gap:0.6rem; align-items:flex-start;">
          <span style="font-size:1.1rem; flex-shrink:0;">📌</span>
          <div>
            <strong>3. Réactivité asynchrone :</strong>
            <span style="color:var(--text-muted);"> Lorsqu'une entreprise vous sollicite, une réponse courtoise sous 24h démontre immédiatement votre professionnalisme et votre autonomie.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Zone de Danger : Suppression Définitive du Compte (RGPD) -->
    <div class="card" style="border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h4 style="font-size:1rem; font-weight:800; color:#b91c1c; margin-bottom:0.25rem;">
            🗑️ Supprimer définitivement mon profil talent
          </h4>
          <p style="font-size:0.82rem; color:var(--text-muted);">
            Cette action effacera irréversiblement votre profil de l'annuaire, vos alertes d'offres et toutes vos données personnelles.
          </p>
        </div>
        <form method="POST" action="/api/talents/manage/delete" onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer définitivement votre profil talent et toutes vos alertes ? Cette action est irréversible.');">
          <input type="hidden" name="token" value="${escapeAttr(talent.manage_token)}" />
          <button type="submit" class="btn" style="background:#ef4444; color:white; font-size:0.8rem;">
            🗑️ Supprimer mon compte
          </button>
        </form>
      </div>
    </div>
  </main>

  <script>
    let editCvBase64 = null;
    let editCvFilename = null;

    function toggleEditProfile() {
      const box = document.getElementById('editProfileBox');
      const btn = document.getElementById('toggleEditBtn');
      if (box.style.display === 'none') {
        box.style.display = 'block';
        btn.textContent = '✖ Fermer l\\'édition';
      } else {
        box.style.display = 'none';
        btn.textContent = '✏️ Modifier ma fiche & CV';
      }
    }

    function handleEditCvFile(e) {
      const file = e.target.files[0];
      const preview = document.getElementById('editCvFilePreview');
      if (!file) {
        editCvBase64 = null;
        editCvFilename = null;
        preview.textContent = '';
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 3 Mo).');
        e.target.value = '';
        return;
      }
      editCvFilename = file.name;
      const reader = new FileReader();
      reader.onload = function(evt) {
        editCvBase64 = evt.target.result;
        preview.textContent = '✅ Nouveau fichier prêt : ' + file.name + ' (' + Math.round(file.size / 1024) + ' Ko)';
      };
      reader.readAsDataURL(file);
    }

    async function submitProfileEdit(e) {
      e.preventDefault();
      const btn = document.getElementById('saveProfileBtn');
      const feedback = document.getElementById('editFeedback');
      const token = document.getElementById('editToken').value;

      btn.disabled = true;
      btn.textContent = 'Enregistrement en cours...';

      const stackRaw = document.getElementById('editStack').value;
      const tags = stackRaw.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        token,
        title: document.getElementById('editTitle').value,
        seniority: document.getElementById('editSeniority').value,
        availability: document.getElementById('editAvailability').value,
        location: document.getElementById('editLocation').value,
        salary_expectation: document.getElementById('editSalary').value,
        primary_stack: stackRaw,
        tags,
        bio_snippet: document.getElementById('editBio').value,
        github_url: document.getElementById('editGithub').value,
        portfolio_url: document.getElementById('editPortfolio').value,
        cv_url: document.getElementById('editCvUrl').value,
        cv_data: editCvBase64 || '',
        cv_filename: editCvFilename || '',
      };

      try {
        const res = await fetch('/api/talents/manage/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          feedback.style.display = 'block';
          feedback.style.background = 'rgba(16,185,129,0.15)';
          feedback.style.color = '#047857';
          feedback.textContent = '✅ Profil mis à jour avec succès ! Rechargement...';
          setTimeout(() => { window.location.reload(); }, 1000);
        } else {
          feedback.style.display = 'block';
          feedback.style.background = 'rgba(239,68,68,0.15)';
          feedback.style.color = '#b91c1c';
          feedback.textContent = '❌ Erreur : ' + (data.error || 'Impossible de mettre à jour le profil.');
        }
      } catch (err) {
        feedback.style.display = 'block';
        feedback.style.background = 'rgba(239,68,68,0.15)';
        feedback.style.color = '#b91c1c';
        feedback.textContent = '❌ Erreur réseau. Veuillez réessayer.';
      } finally {
        btn.disabled = false;
        btn.textContent = '💾 Enregistrer les modifications';
      }
    }

    // Persistance de la session Talent
    try {
      const currentToken = '${escapeAttr(talent.manage_token)}';
      if (currentToken) {
        localStorage.setItem('fullremote_talent_token', currentToken);
        document.cookie = 'talent_token=' + encodeURIComponent(currentToken) + '; path=/; max-age=31536000; SameSite=Lax';
      }
    } catch (_) {}
  </script>
</body>
</html>`;
}

/**
 * 4. Page de Connexion par Magic Link : /talents/login
 */
export function renderTalentLoginPage(meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.edounze.com";

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Connexion Espace Talent (Magic Link) — FullRemote.Jobs</title>
  <meta name="description" content="Accédez à votre espace privé de gestion candidat sans mot de passe grâce à votre lien de connexion magique." />
  <link rel="canonical" href="${siteUrl}/talents/login" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔑</text></svg>">
  <style>
    :root {
      --bg: #f8fafc;
      --bg-card: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --emerald: #10b981;
      --meta-bg: #f1f5f9;
      --font-sans: 'Inter', system-ui, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.6; min-height: 100vh; display: flex; flex-direction: column; }
    .container { max-width: 520px; margin: auto; padding: 2rem 1.5rem; width: 100%; }
    header { border-bottom: 1px solid var(--border); background: var(--bg-card); padding: 1rem 0; }
    .header-inner { max-width: 840px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .login-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 2.5rem 2rem; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .form-input { width: 100%; background: var(--meta-bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.85rem 1rem; font-size: 0.95rem; color: var(--text); font-family: inherit; margin-bottom: 1rem; }
    .form-input:focus { outline: none; border-color: var(--primary); background: #ffffff; }
    .btn-submit { background: var(--primary); color: white; font-weight: 800; font-size: 0.95rem; padding: 0.85rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; width: 100%; transition: background 0.15s ease; }
    .btn-submit:hover { background: var(--primary-hover); }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" style="font-weight:800; font-size:1.15rem; color:var(--text); text-decoration:none; display:flex; align-items:center; gap:0.4rem;">
        <span>🌍</span> FullRemote<span style="color:var(--primary);">.Jobs</span>
      </a>
      <a href="/talents" style="font-size:0.85rem; font-weight:600; color:var(--text-muted); text-decoration:none;">
        ← Annuaire des Talents
      </a>
    </div>
  </header>

  <main class="container">
    <div class="login-card">
      <div style="text-align:center; margin-bottom:1.75rem;">
        <div style="font-size:2.5rem; margin-bottom:0.4rem;">🔑</div>
        <h1 style="font-size:1.6rem; font-weight:800; color:var(--text); letter-spacing:-0.02em;">
          Connexion Espace Talent
        </h1>
        <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.35rem;">
          Saisissez votre email pour recevoir votre lien de connexion magique sans mot de passe.
        </p>
      </div>

      <form id="magicLinkForm" onsubmit="submitMagicLink(event)">
        <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text); margin-bottom:0.4rem;">
          Votre adresse email réelle (privée & protégée) *
        </label>
        <input type="email" id="loginEmail" name="email" required class="form-input" placeholder="votre.email@domaine.com" autocomplete="email" />

        <button type="submit" id="submitLoginBtn" class="btn-submit">
          📩 M'envoyer mon lien de connexion magique
        </button>

        <div id="loginFeedback" style="display:none; margin-top:1.25rem; font-size:0.88rem; font-weight:600; text-align:center; padding:0.85rem; border-radius:8px;"></div>
        <div style="margin-top:1rem; font-size:0.75rem; color:var(--text-muted); text-align:center; line-height:1.4;">
          📬 Pensez à vérifier votre dossier <em>Courrier indésirable / Spams</em> si l'email tarde à arriver et signalez-le comme <strong>"Non-spam"</strong>.
        </div>
      </form>

      <div style="text-align:center; margin-top:1.75rem; padding-top:1.25rem; border-top:1px solid var(--border); font-size:0.85rem; color:var(--text-muted);">
        Vous n'avez pas encore de profil ? <a href="/talents/join" style="color:var(--primary); font-weight:700; text-decoration:none;">Créer mon profil gratuit →</a>
      </div>
    </div>
  </main>

  <script>
    async function submitMagicLink(e) {
      e.preventDefault();
      const btn = document.getElementById('submitLoginBtn');
      const feedback = document.getElementById('loginFeedback');
      const email = (document.getElementById('loginEmail').value || '').trim();

      if (!email) return;

      btn.disabled = true;
      btn.textContent = 'Envoi en cours...';

      try {
        const res = await fetch('/api/talents/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        feedback.style.display = 'block';
        feedback.style.background = 'rgba(16,185,129,0.12)';
        feedback.style.color = '#047857';
        feedback.textContent = '📬 Si cette adresse est associée à un profil, votre lien magique de connexion vient de vous être envoyé par email. Vérifiez votre boîte de réception !';
      } catch (err) {
        feedback.style.display = 'block';
        feedback.style.background = 'rgba(239,68,68,0.12)';
        feedback.style.color = '#b91c1c';
        feedback.textContent = '❌ Erreur de communication. Veuillez réessayer.';
      } finally {
        btn.disabled = false;
        btn.textContent = '📩 Renvoyer le lien de connexion';
      }
    }
  </script>
</body>
</html>`;
}


