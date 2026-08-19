/**
 * FullRemote-Jobs - Executive Admin Dashboard & Operations UI
 */

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 1. Page de Connexion Administrateur (Magic Link) : /admin/login
 */
export function renderAdminLoginPage(meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.app";

  return `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accès Administrateur — FullRemote.Jobs</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>">
  <style>
    :root {
      --bg: #0b0f19;
      --bg-card: #111827;
      --border: #1f2937;
      --text: #f9fafb;
      --text-muted: #9ca3af;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --font-sans: 'Inter', system-ui, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.6; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1.5rem; }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 2.5rem 2rem; width: 100%; max-width: 460px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .form-input { width: 100%; background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 0.85rem 1rem; font-size: 0.95rem; color: #ffffff; font-family: inherit; margin-bottom: 1.25rem; }
    .form-input:focus { outline: none; border-color: var(--primary); }
    .btn-submit { background: var(--primary); color: white; font-weight: 800; font-size: 0.95rem; padding: 0.85rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; width: 100%; transition: background 0.15s ease; }
    .btn-submit:hover { background: var(--primary-hover); }
  </style>
</head>
<body>
  <div class="card">
    <div style="text-align:center; margin-bottom:1.75rem;">
      <div style="font-size:2.5rem; margin-bottom:0.4rem;">🛡️</div>
      <h1 style="font-size:1.6rem; font-weight:800; color:var(--text); letter-spacing:-0.02em;">
        FullRemote<span style="color:var(--primary);">.Jobs</span> Admin
      </h1>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.35rem;">
        Espace de pilotage exécutif & supervision de l'application
      </p>
    </div>

    <form id="adminLoginForm" onsubmit="submitAdminLogin(event)">
      <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text-muted); margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.05em;">
        Email Administrateur Autorisé
      </label>
      <input type="email" id="adminEmail" name="email" required class="form-input" placeholder="hello@remote-jobs.app ou charles@edounze.com" autocomplete="email" />

      <button type="submit" id="submitAdminBtn" class="btn-submit">
        🔑 M'envoyer mon Magic Link Admin
      </button>

      <div id="adminFeedback" style="display:none; margin-top:1.25rem; font-size:0.88rem; font-weight:600; text-align:center; padding:0.85rem; border-radius:8px;"></div>
    </form>

    <div style="text-align:center; margin-top:1.75rem; padding-top:1.25rem; border-top:1px solid var(--border); font-size:0.82rem;">
      <a href="/" style="color:var(--text-muted); text-decoration:none;">← Retour au site public</a>
    </div>
  </div>

  <script>
    async function submitAdminLogin(e) {
      e.preventDefault();
      const btn = document.getElementById('submitAdminBtn');
      const feedback = document.getElementById('adminFeedback');
      const email = (document.getElementById('adminEmail').value || '').trim();

      if (!email) return;

      btn.disabled = true;
      btn.textContent = 'Vérification en cours...';

      try {
        const res = await fetch('/api/admin/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        feedback.style.display = 'block';
        if (data.success) {
          feedback.style.background = 'rgba(16,185,129,0.15)';
          feedback.style.color = '#34d399';
          feedback.textContent = '📬 Votre lien magique administrateur vient d\\'être envoyé par email. Vérifiez votre boîte de réception !';
        } else {
          feedback.style.background = 'rgba(239,68,68,0.15)';
          feedback.style.color = '#f87171';
          feedback.textContent = '❌ ' + (data.error || 'Accès non autorisé.');
        }
      } catch (err) {
        feedback.style.display = 'block';
        feedback.style.background = 'rgba(239,68,68,0.15)';
        feedback.style.color = '#f87171';
        feedback.textContent = '❌ Erreur de connexion au serveur.';
      } finally {
        btn.disabled = false;
        btn.textContent = '🔑 M\\'envoyer mon Magic Link Admin';
      }
    }
  </script>
</body>
</html>`;
}

/**
 * 2. Executive Admin Dashboard : /admin
 */
export function renderAdminDashboardPage(metrics = {}, allTalents = [], adminUser = {}, meta = {}) {
  const siteUrl = meta.siteUrl || "https://remote-jobs.app";
  const token = adminUser.token || "";
  const jobs = metrics.jobs || {};
  const talents = metrics.talents || {};
  const contacts = metrics.contacts || {};
  const alerts = metrics.alerts || {};
  const push = metrics.push || {};
  const logs = metrics.logs || [];

  return `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cockpit Exécutif & Analytics — FullRemote.Jobs</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <style>
    :root {
      --bg: #090d16;
      --bg-card: #111827;
      --bg-card-alt: #162032;
      --border: #1f2937;
      --border-focus: #3b82f6;
      --text: #f9fafb;
      --text-muted: #9ca3af;
      --text-dim: #6b7280;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --emerald: #10b981;
      --amber: #f59e0b;
      --rose: #f43f5e;
      --indigo: #6366f1;
      --font-sans: 'Inter', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.5; min-height: 100vh; }
    
    header { background: #0e1422; border-bottom: 1px solid var(--border); padding: 0.85rem 1.5rem; position: sticky; top: 0; z-index: 50; }
    .header-inner { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    
    .container { max-width: 1400px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .kpi-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem 1.5rem; position: relative; overflow: hidden; }
    .kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--primary); }
    .kpi-card.emerald::before { background: var(--emerald); }
    .kpi-card.amber::before { background: var(--amber); }
    .kpi-card.indigo::before { background: var(--indigo); }
    .kpi-card.rose::before { background: var(--rose); }
    
    .kpi-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.35rem; }
    .kpi-value { font-size: 1.85rem; font-weight: 800; font-family: var(--font-mono); color: var(--text); line-height: 1.1; }
    .kpi-sub { font-size: 0.8rem; color: var(--text-dim); margin-top: 0.4rem; }
    
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .card-title { font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.86rem; text-align: left; }
    .data-table th { padding: 0.75rem 1rem; background: #0e1422; color: var(--text-muted); font-weight: 700; border-bottom: 1px solid var(--border); text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.05em; }
    .data-table td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border); color: var(--text); }
    .data-table tr:hover td { background: rgba(255,255,255,0.02); }
    
    .badge { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
    .badge-active { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .badge-paused { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
    .badge-hired { background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
    
    .btn { padding: 0.55rem 1rem; font-size: 0.82rem; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; text-decoration: none; transition: all 0.15s ease; }
    .btn-primary { background: var(--primary); color: white !important; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: #1f2937; }
    
    .ops-bar { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 2rem; background: var(--bg-card-alt); border: 1px solid var(--border); padding: 1rem 1.25rem; border-radius: 12px; align-items: center; justify-content: space-between; }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div style="display:flex; align-items:center; gap:1rem;">
        <a href="/" style="font-weight:800; font-size:1.1rem; color:var(--text); text-decoration:none; display:flex; align-items:center; gap:0.4rem;">
          <span>🌍</span> FullRemote<span style="color:var(--primary);">.Jobs</span> <span style="font-size:0.75rem; background:var(--primary); color:white; padding:2px 6px; border-radius:4px; margin-left:4px;">ADMIN</span>
        </a>
      </div>
      <div style="display:flex; align-items:center; gap:1rem; font-size:0.82rem;">
        <span style="color:var(--text-muted);">👑 Connecté : <strong style="color:var(--text);">${escapeHtml(adminUser.email || "Admin")}</strong></span>
        <a href="/talents" target="_blank" style="color:var(--primary); text-decoration:none; font-weight:600;">Annuaire Talents ↗</a>
        <a href="/" target="_blank" style="color:var(--text-muted); text-decoration:none;">Site Public ↗</a>
      </div>
    </div>
  </header>

  <main class="container">
    <!-- Barre d'Opérations Rapides -->
    <div class="ops-bar">
      <div>
        <div style="font-size:0.85rem; font-weight:800; color:var(--text);">⚡ Command Center & Maintenance</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">Actions système Cloudflare D1 & Scrapers asynchrones</div>
      </div>
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button class="btn btn-outline" onclick="triggerScraping()">
          🔄 Scraper en direct
        </button>
        <button class="btn btn-outline" onclick="triggerPurge()">
          🧹 Purger > 30 jours
        </button>
        <a href="/api/stats" target="_blank" class="btn btn-outline">
          📊 JSON API Stats ↗
        </a>
      </div>
    </div>

    <!-- 1. Executive Big Numbers (KPIs) -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Jobs Actifs / Total</div>
        <div class="kpi-value">${jobs.active || 0} <span style="font-size:1rem; color:var(--text-dim);">/ ${jobs.total || 0}</span></div>
        <div class="kpi-sub">⚡ +${jobs.past_24h || 0} opportunités (< 24h)</div>
      </div>

      <div class="kpi-card emerald">
        <div class="kpi-label">Vivier de Talents</div>
        <div class="kpi-value">${talents.total || 0}</div>
        <div class="kpi-sub">🟢 ${talents.active || 0} actifs · 📄 ${talents.with_cv || 0} avec CV</div>
      </div>

      <div class="kpi-card indigo">
        <div class="kpi-label">Mises en Relation (B2B)</div>
        <div class="kpi-value">${contacts.total || 0}</div>
        <div class="kpi-sub">🤝 +${contacts.past_7d || 0} sollicitations (7 derniers jours)</div>
      </div>

      <div class="kpi-card amber">
        <div class="kpi-label">Abonnés Email & Push</div>
        <div class="kpi-value">${alerts.active || 0} <span style="font-size:1rem; color:var(--text-dim);">+ ${push.active || 0} push</span></div>
        <div class="kpi-sub">📬 ${alerts.weekly || 0} hebdo · ${alerts.daily || 0} quotidiens</div>
      </div>

      <div class="kpi-card rose">
        <div class="kpi-label">Portée Profils Talents</div>
        <div class="kpi-value">${talents.total_views || 0}</div>
        <div class="kpi-sub">👁️ Vues cumulées de profils</div>
      </div>
    </div>

    <!-- 2. Breakdown Statistiques (Jobs par Source, Région, Contrat) -->
    <div class="grid-3">
      <div class="card">
        <div class="card-title">📡 Répartition par Source</div>
        <table class="data-table">
          <tbody>
            ${(jobs.by_source || []).map(s => `
              <tr>
                <td style="font-weight:600;">${escapeHtml(s.source)}</td>
                <td style="text-align:right; font-family:var(--font-mono); font-weight:700; color:var(--primary);">${s.count}</td>
              </tr>
            `).join("") || "<tr><td colspan='2' style='color:var(--text-dim);'>Aucune donnée</td></tr>"}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">🌍 Répartition par Région</div>
        <table class="data-table">
          <tbody>
            ${(jobs.by_region || []).map(r => `
              <tr>
                <td>${escapeHtml(r.region_flag || "🌍")} ${escapeHtml(r.region_label || "Région")}</td>
                <td style="text-align:right; font-family:var(--font-mono); font-weight:700; color:var(--emerald);">${r.count}</td>
              </tr>
            `).join("") || "<tr><td colspan='2' style='color:var(--text-dim);'>Aucune donnée</td></tr>"}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">💼 Répartition par Contrat</div>
        <table class="data-table">
          <tbody>
            ${(jobs.by_contract || []).map(c => `
              <tr>
                <td>${escapeHtml(c.contract_icon || "💼")} ${escapeHtml(c.contract_type_label || "Contrat")}</td>
                <td style="text-align:right; font-family:var(--font-mono); font-weight:700; color:var(--amber);">${c.count}</td>
              </tr>
            `).join("") || "<tr><td colspan='2' style='color:var(--text-dim);'>Aucune donnée</td></tr>"}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. Gestion Complète du Vivier de Talents -->
    <div class="card">
      <div class="card-title">
        <span>🚀 Vivier de Talents Inscrits (${allTalents.length})</span>
        <a href="/talents/join" target="_blank" class="btn btn-primary" style="font-size:0.75rem;">+ Nouveau Talent</a>
      </div>

      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Titre Professionnel</th>
              <th>Email Réel</th>
              <th>Stack Principale</th>
              <th>Prétentions / TJM</th>
              <th>Statut</th>
              <th>Vues / Contacts</th>
              <th>CV</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${allTalents.map(t => {
              const statusBadge = t.status === 'active' 
                ? '<span class="badge badge-active">🟢 Actif</span>' 
                : (t.status === 'hired' ? '<span class="badge badge-hired">🎉 Recruté</span>' : '<span class="badge badge-paused">⏸️ Pause</span>');
              const hasCv = !!(t.cv_data || t.cv_url);
              
              return `
              <tr>
                <td style="font-size:0.75rem; color:var(--text-dim); font-family:var(--font-mono);">${(t.created_at || '').substring(0, 10)}</td>
                <td style="font-weight:700; color:var(--text);">
                  ${escapeHtml(t.title)}
                  <div style="font-size:0.72rem; font-weight:500; color:var(--text-muted);">${escapeHtml(t.seniority)} · ${escapeHtml(t.availability)}</div>
                </td>
                <td>
                  <a href="mailto:${escapeAttr(t.email)}" style="color:var(--primary); text-decoration:none; font-family:var(--font-mono); font-size:0.8rem;">
                    ${escapeHtml(t.email)}
                  </a>
                </td>
                <td style="font-size:0.78rem; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  ${escapeHtml(t.primary_stack)}
                </td>
                <td style="font-size:0.78rem; font-weight:700; color:var(--amber);">${escapeHtml(t.salary_expectation || '—')}</td>
                <td>${statusBadge}</td>
                <td style="font-family:var(--font-mono); font-size:0.78rem; text-align:center;">
                  👁️ ${t.view_count || 0} · ✉️ ${t.contact_count || 0}
                </td>
                <td>
                  ${hasCv ? `
                    <a href="/api/talents/${encodeURIComponent(t.id)}/cv" target="_blank" style="font-size:0.75rem; color:var(--emerald); font-weight:700; text-decoration:none;">
                      📄 Voir CV ↗
                    </a>
                  ` : '<span style="color:var(--text-dim); font-size:0.72rem;">Non</span>'}
                </td>
                <td>
                  <div style="display:flex; gap:0.35rem;">
                    <a href="/talents/manage?token=${encodeURIComponent(t.manage_token)}" target="_blank" class="btn btn-outline" style="padding:2px 6px; font-size:0.7rem;" title="Ouvrir l'espace de gestion du talent">
                      ⚙️ Espace
                    </a>
                  </div>
                </td>
              </tr>
              `;
            }).join("") || "<tr><td colspan='9' style='text-align:center; color:var(--text-dim); padding:2rem;'>Aucun talent inscrit pour le moment.</td></tr>"}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. Dernières Mises en Relation Recruteurs (Sollicitations B2B) -->
    <div class="grid-2">
      <div class="card">
        <div class="card-title">🤝 Dernières Sollicitations Recruteurs</div>
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Recruteur / Entreprise</th>
                <th>Talent Visé</th>
                <th>Poste / Message</th>
              </tr>
            </thead>
            <tbody>
              ${(contacts.recent || []).map(c => `
                <tr>
                  <td style="font-size:0.72rem; color:var(--text-dim); font-family:var(--font-mono); white-space:nowrap;">${(c.created_at || '').substring(0, 16)}</td>
                  <td>
                    <strong>${escapeHtml(c.recruiter_name)}</strong><br>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(c.recruiter_company)}</span><br>
                    <a href="mailto:${escapeAttr(c.recruiter_email)}" style="font-size:0.72rem; color:var(--primary); font-family:var(--font-mono);">${escapeHtml(c.recruiter_email)}</a>
                  </td>
                  <td style="font-size:0.8rem; font-weight:600;">
                    ${escapeHtml(c.talent_title || c.talent_id)}
                  </td>
                  <td style="font-size:0.75rem; color:var(--text-muted); max-width:200px;">
                    ${c.job_title ? `<strong>${escapeHtml(c.job_title)}</strong><br>` : ""}
                    <div style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                      ${escapeHtml(c.message)}
                    </div>
                  </td>
                </tr>
              `).join("") || "<tr><td colspan='4' style='color:var(--text-dim); text-align:center;'>Aucune prise de contact enregistrée</td></tr>"}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. Logs Récents des Notifications (Emails & Web Push) -->
      <div class="card">
        <div class="card-title">📬 Logs Notifications Récentes</div>
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Destinataire</th>
                <th>Sujet / Statut</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td style="font-size:0.72rem; color:var(--text-dim); font-family:var(--font-mono); white-space:nowrap;">${(l.sent_at || '').substring(0, 16)}</td>
                  <td style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">${escapeHtml(l.type)}</td>
                  <td style="font-size:0.75rem; font-family:var(--font-mono); color:var(--text-muted);">${escapeHtml(l.recipient)}</td>
                  <td style="font-size:0.75rem;">
                    ${escapeHtml(l.subject_or_title || '—')}
                    ${l.status === 'error' ? `<span class="badge" style="background:rgba(239,68,68,0.2); color:#f87171;">${escapeHtml(l.error_message || 'Erreur')}</span>` : `<span class="badge badge-active">OK</span>`}
                  </td>
                </tr>
              `).join("") || "<tr><td colspan='4' style='color:var(--text-dim); text-align:center;'>Aucun log d'envoi</td></tr>"}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <script>
    async function triggerScraping() {
      if (!confirm('Voulez-vous lancer immédiatement l\\'ingestion des flux distants ?')) return;
      try {
        const res = await fetch('/api/scraper/trigger', { method: 'POST' });
        const data = await res.json();
        alert('Scraping terminé : ' + JSON.stringify(data));
        window.location.reload();
      } catch (err) {
        alert('Erreur lors du déclenchement : ' + err.message);
      }
    }

    async function triggerPurge() {
      if (!confirm('Purger toutes les offres publiées il y a plus de 30 jours ?')) return;
      try {
        const res = await fetch('/api/admin/jobs/purge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: '${escapeAttr(token)}' }) });
        const data = await res.json();
        alert('Purge terminée : ' + (data.purged || 0) + ' offres supprimées.');
        window.location.reload();
      } catch (err) {
        alert('Erreur : ' + err.message);
      }
    }
  </script>
</body>
</html>`;
}
