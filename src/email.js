/**
 * FullRemote-Jobs - Service d'Envoi d'Emails Transactionnels via Resend API
 */

/**
 * Envoie un email via l'API REST de Resend
 */
export async function sendResendEmail({
  apiKey,
  from = "FullRemote Jobs <onboarding@resend.dev>",
  to,
  subject,
  html,
  text,
}) {
  if (!apiKey) {
    console.warn("[EMAIL] Clé API Resend non configurée.");
    return { success: false, error: "Clé API Resend manquante" };
  }

  const recipients = Array.isArray(to) ? to : [to];

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, " "),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[EMAIL] Erreur réponse Resend :", data);
      return { success: false, error: data.message || "Erreur Resend API", details: data };
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.error("[EMAIL] Exception lors de l'envoi Resend :", err);
    return { success: false, error: err.message };
  }
}

/**
 * Vérifie si une offre d'emploi correspond aux critères d'une alerte
 */
export function matchJobToAlert(job, alert = {}) {
  if (!job || !alert) return false;

  // 1. Filtre Région
  if (alert.region_id && alert.region_id !== "all") {
    const r = alert.region_id.toLowerCase();
    const jr = (job.regionId || job.region_id || "").toLowerCase();
    if (r !== "all" && jr !== r && jr !== "worldwide") {
      return false;
    }
  }

  // 2. Filtre Catégorie
  if (alert.category_id && alert.category_id !== "all") {
    const c = alert.category_id.toLowerCase();
    const jc = (job.categoryId || job.category_id || "").toLowerCase();
    if (c !== "all" && jc !== c) {
      return false;
    }
  }

  // 3. Filtre Type de Contrat
  if (alert.contract_type_id && alert.contract_type_id !== "all") {
    const ct = alert.contract_type_id.toLowerCase();
    const jct = (job.contractTypeId || job.contract_type_id || "").toLowerCase();
    if (ct !== "all" && jct !== ct) {
      return false;
    }
  }

  // 4. Mots-clés libres (recherche dans titre, description, tags, entreprise)
  if (alert.keywords && alert.keywords.trim()) {
    const rawTerms = alert.keywords.toLowerCase().split(/[\s,]+/);
    const textCorpus = `${job.title} ${job.company} ${job.description_snippet || ""} ${JSON.stringify(
      job.tags || []
    )}`.toLowerCase();

    const matchesKeyword = rawTerms.some((term) => term.length >= 2 && textCorpus.includes(term));
    if (!matchesKeyword) {
      return false;
    }
  }

  return true;
}

/**
 * Génère le template HTML pour l'email de confirmation d'inscription
 */
export function buildWelcomeEmailHtml({ alert, siteUrl = "https://fullremote-jobs.edounze.com" }) {
  const unsubscribeUrl = `${siteUrl}/api/alerts/unsubscribe?token=${encodeURIComponent(
    alert.unsubscribe_token
  )}`;

  const regionNames = {
    all: "Toutes les régions (Monde entier)",
    worldwide: "🌍 Worldwide (100% sans restriction)",
    france: "🇫🇷 France & Francophonie",
    europe: "🇪🇺 Europe & UK",
    americas: "🇺🇸 Amériques (USA / Canada / LATAM)",
    apac_mea: "🌏 Asie, Pacifique & MEA",
  };

  const categoryNames = {
    all: "Tous les métiers",
    tech: "💻 Tech & Développement",
    devops: "☁️ DevOps & Cloud",
    data_ai: "🧠 Data & Intelligence Artificielle",
    design: "🎨 Design & UX/UI",
    product: "🚀 Product Management",
    marketing_sales: "📈 Marketing & Sales",
  };

  const contractNames = {
    all: "Tous les contrats",
    cdi_fulltime: "💼 CDI / Full-time",
    freelance_contract: "⚡ Freelance / Contractuel",
    cdd_parttime: "⏳ CDD / Temps partiel",
    internship: "🎓 Stage / Alternance",
  };

  const regionLabel = regionNames[alert.region_id] || "Toutes les régions";
  const categoryLabel = categoryNames[alert.category_id] || "Tous les métiers";
  const contractLabel = contractNames[alert.contract_type_id] || "Tous les contrats";
  const keywordsLabel = alert.keywords && alert.keywords.trim() ? alert.keywords.trim() : "Aucun mot-clé spécifique";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alerte FullRemote Jobs Activée</title>
  <style>
    body { margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 20px; }
    .card { background-color: #111726; border: 1px solid #1e293b; border-radius: 16px; padding: 32px 24px; }
    .header { text-align: center; margin-bottom: 28px; }
    .logo { font-size: 32px; line-height: 1; margin-bottom: 8px; }
    .brand-title { font-size: 20px; font-weight: 800; color: #f8fafc; margin: 0; }
    .brand-sub { color: #94a3b8; font-size: 13px; margin-top: 4px; }
    h1 { font-size: 22px; font-weight: 700; color: #f8fafc; margin: 0 0 16px 0; text-align: center; }
    p { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 16px 0; }
    .criteria-box { background-color: #0c1220; border: 1px solid #23314d; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .criteria-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #3b82f6; margin-bottom: 12px; }
    .criteria-item { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #1e293b; }
    .criteria-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .criteria-label { color: #94a3b8; }
    .criteria-val { font-weight: 600; color: #f1f5f9; text-align: right; }
    .btn { display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 8px; text-decoration: none; text-align: center; margin-top: 12px; }
    .btn-container { text-align: center; margin: 24px 0; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; line-height: 1.5; }
    .footer a { color: #94a3b8; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">🌍</div>
        <div class="brand-title">Full Remote Jobs</div>
        <div class="brand-sub">Répertoire Mondial 100% Télétravail</div>
      </div>

      <h1>🎉 Votre alerte personnalisée est active !</h1>

      <p>Bonjour,</p>
      <p>Votre alerte emploi a bien été enregistrée pour l'adresse <strong>${escapeHtml(
        alert.email
      )}</strong>. Chaque matin à <strong>08h00 (heure de Paris)</strong>, dès que de nouvelles offres 100% télétravail correspondant à vos critères seront publiées, vous recevrez un récapitulatif directement par email.</p>

      <div class="criteria-box">
        <div class="criteria-title">Vos critères configurés</div>
        <div class="criteria-item">
          <span class="criteria-label">Région :</span>
          <span class="criteria-val">${regionLabel}</span>
        </div>
        <div class="criteria-item">
          <span class="criteria-label">Métier / Domaine :</span>
          <span class="criteria-val">${categoryLabel}</span>
        </div>
        <div class="criteria-item">
          <span class="criteria-label">Type de contrat :</span>
          <span class="criteria-val">${contractLabel}</span>
        </div>
        <div class="criteria-item">
          <span class="criteria-label">Mots-clés :</span>
          <span class="criteria-val">${escapeHtml(keywordsLabel)}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${siteUrl}" class="btn">Découvrir les offres disponibles aujourd'hui ↗</a>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Aucun mot de passe requis. Vous pouvez vous désinscrire ou ajuster vos alertes à tout moment en 1 clic.
      </p>
    </div>

    <div class="footer">
      Cet email vous a été envoyé car vous avez activé une alerte sur <a href="${siteUrl}">fullremote-jobs.edounze.com</a>.<br>
      Pour ne plus recevoir ces alertes : <a href="${unsubscribeUrl}">Se désinscrire en 1 clic</a>.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Génère le template HTML pour le digest quotidien des nouvelles offres
 */
export function buildJobDigestEmailHtml({
  jobs = [],
  alert = {},
  siteUrl = "https://fullremote-jobs.edounze.com",
}) {
  const count = jobs.length;
  const unsubscribeUrl = `${siteUrl}/api/alerts/unsubscribe?token=${encodeURIComponent(
    alert.unsubscribe_token || ""
  )}`;

  const jobCardsHtml = jobs
    .slice(0, 15)
    .map((job) => {
      const salaryTag = job.salary
        ? `<span style="background-color: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-right: 6px; margin-bottom: 6px;">💰 ${escapeHtml(
            job.salary
          )}</span>`
        : "";

      const contractTag = `<span style="background-color: rgba(59, 130, 246, 0.15); color: #60a5fa; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-right: 6px; margin-bottom: 6px;">${
        job.contractIcon || "💼"
      } ${escapeHtml(job.contractType || "CDI")}</span>`;

      const regionTag = `<span style="background-color: rgba(148, 163, 184, 0.15); color: #cbd5e1; font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-right: 6px; margin-bottom: 6px;">${
        job.regionFlag || "🌍"
      } ${escapeHtml(job.region || "Worldwide")}</span>`;

      const tags = (job.tags || [])
        .slice(0, 3)
        .map(
          (t) =>
            `<span style="background-color: #1e293b; color: #94a3b8; font-size: 11px; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-right: 4px; margin-bottom: 4px;">#${escapeHtml(
              t
            )}</span>`
        )
        .join("");

      return `
      <div style="background-color: #111726; border: 1px solid #1e293b; border-radius: 12px; padding: 18px 20px; margin-bottom: 14px; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <div style="font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 2px;">
              ${escapeHtml(job.company)}
            </div>
            <a href="${escapeHtml(
              job.url
            )}" target="_blank" style="font-size: 16px; font-weight: 700; color: #f8fafc; text-decoration: none; line-height: 1.3;">
              ${escapeHtml(job.title)}
            </a>
          </div>
        </div>

        <div style="margin-top: 10px; margin-bottom: 8px;">
          ${contractTag}
          ${regionTag}
          ${salaryTag}
        </div>

        ${
          job.description_snippet
            ? `<div style="font-size: 13px; color: #94a3b8; line-height: 1.4; margin-bottom: 12px; max-height: 42px; overflow: hidden;">${escapeHtml(
                job.description_snippet
              )}</div>`
            : ""
        }

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #1a2333;">
          <div style="font-size: 12px;">
            ${tags}
          </div>
          <a href="${escapeHtml(
            job.url
          )}" target="_blank" style="background-color: #2563eb; color: #ffffff !important; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 6px; text-decoration: none; display: inline-block;">
            Postuler ↗
          </a>
        </div>
      </div>
    `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${count} nouvelles offres Full Remote</title>
  <style>
    body { margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 28px; margin-bottom: 6px; }
    .brand-title { font-size: 18px; font-weight: 800; color: #f8fafc; }
    .hero-title { font-size: 20px; font-weight: 700; color: #f8fafc; margin: 16px 0 8px 0; }
    .hero-subtitle { font-size: 14px; color: #94a3b8; margin: 0 0 20px 0; }
    .btn-more { display: block; background: #3b82f6; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 20px; border-radius: 10px; text-decoration: none; text-align: center; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 28px; line-height: 1.5; }
    .footer a { color: #94a3b8; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌍</div>
      <div class="brand-title">Full Remote Jobs</div>
      <div class="hero-title">✨ ${count} nouvelle${count > 1 ? "s" : ""} offre${
    count > 1 ? "s" : ""
  } pour votre profil</div>
      <div class="hero-subtitle">Voici les derniers postes 100% télétravail correspondant à vos critères d'alerte :</div>
    </div>

    ${jobCardsHtml}

    <a href="${siteUrl}" class="btn-more">
      Voir toutes les offres en direct sur le site ↗
    </a>

    <div class="footer">
      Vous recevez cette alerte pour <strong>${escapeHtml(alert.email)}</strong> sur <a href="${siteUrl}">fullremote-jobs.edounze.com</a>.<br>
      Pour modifier vos filtres ou vous désinscrire : <a href="${unsubscribeUrl}">Se désinscrire en 1 clic</a>.
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
