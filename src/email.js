/**
 * FullRemote-Jobs - Service d'Envoi d'Emails Transactionnels via Resend API
 * Templates HTML optimisés pour tous les clients mails (Gmail, Apple Mail, Outlook) avec styles inline 100% lisibles
 */

export const DEFAULT_SITE_URL = "https://remote-jobs.app";

/**
 * Envoie un email via l'API REST de Resend
 */
export async function sendResendEmail({
  apiKey,
  from = "FullRemote Jobs <alerts@hey.edounze.com>",
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
 * Calcule un score d'affinité pour ordonner les offres du digest selon les technologies postulées
 */
export function scoreJobForUser(job, appliedTags = []) {
  if (!job) return 0;
  let score = 10;
  const jobTags = (job.tags || []).map(t => t.toLowerCase());
  const appliedSet = new Set((appliedTags || []).map(t => t.toLowerCase()));

  for (const tag of jobTags) {
    if (appliedSet.has(tag)) {
      score += 25; // Bonus +25 par technologie postulée
    }
  }

  const pubTime = job.published_at ? new Date(job.published_at).getTime() : Date.now();
  const hoursOld = (Date.now() - pubTime) / (1000 * 3600);
  if (hoursOld < 24) score += 15;
  else if (hoursOld < 72) score += 5;

  return score;
}

/**
 * Génère le template HTML pour l'email de confirmation d'inscription
 */
export function buildWelcomeEmailHtml({ alert, siteUrl = DEFAULT_SITE_URL }) {
  const canonicalUrl = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const unsubscribeUrl = `${canonicalUrl}/api/alerts/unsubscribe?token=${encodeURIComponent(
    alert.unsubscribe_token || ""
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
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#0f172a;">
  <div style="max-width:600px; margin:0 auto; padding:32px 16px;">
    
    <!-- Carte Principale -->
    <div style="background-color:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:32px 24px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
      
      <!-- Header avec contraste parfait -->
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:36px; line-height:1; margin-bottom:8px;">🌍</div>
        <div style="font-size:22px; font-weight:800; color:#0f172a; letter-spacing:-0.02em;">
          Full Remote <span style="color:#2563eb;">Jobs</span>
        </div>
        <div style="color:#64748b; font-size:13px; font-weight:500; margin-top:4px;">
          L'annuaire mondial des opportunités 100% Télétravail
        </div>
      </div>

      <div style="text-align:center; margin-bottom:24px;">
        <h1 style="font-size:20px; font-weight:700; color:#0f172a; margin:0 0 12px 0;">
          🎉 Votre alerte quotidienne est active !
        </h1>
        <p style="font-size:15px; line-height:1.6; color:#334155; margin:0;">
          Bonjour, votre alerte emploi a bien été enregistrée pour l'adresse <strong>${escapeHtml(alert.email)}</strong>.<br>
          Chaque matin à <strong>08h00</strong>, vous recevrez la sélection des nouveaux postes 100% télétravail correspondant à votre profil.
        </p>
      </div>

      <!-- Critères -->
      <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:24px 0;">
        <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#2563eb; margin-bottom:14px;">
          Vos critères configurés
        </div>
        <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #e2e8f0;">
          <span style="color:#64748b;">Région :</span>
          <span style="font-weight:600; color:#0f172a; text-align:right;">${regionLabel}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #e2e8f0;">
          <span style="color:#64748b;">Métier / Domaine :</span>
          <span style="font-weight:600; color:#0f172a; text-align:right;">${categoryLabel}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #e2e8f0;">
          <span style="color:#64748b;">Type de contrat :</span>
          <span style="font-weight:600; color:#0f172a; text-align:right;">${contractLabel}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:14px;">
          <span style="color:#64748b;">Mots-clés :</span>
          <span style="font-weight:600; color:#0f172a; text-align:right;">${escapeHtml(keywordsLabel)}</span>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center; margin:28px 0;">
        <a href="${canonicalUrl}" style="display:inline-block; background-color:#2563eb; color:#ffffff !important; font-weight:700; font-size:15px; padding:12px 28px; border-radius:8px; text-decoration:none;">
          Découvrir les offres disponibles aujourd'hui ↗
        </a>
      </div>

      <p style="font-size:13px; color:#64748b; text-align:center; margin:0; line-height:1.5;">
        🔒 Aucun mot de passe requis. Vous pouvez vous désinscrire ou ajuster vos critères en 1 clic.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center; font-size:12px; color:#64748b; margin-top:28px; line-height:1.6;">
      Cet email vous a été envoyé car vous avez activé une alerte sur <a href="${canonicalUrl}" style="color:#2563eb; text-decoration:underline;">${new URL(canonicalUrl).hostname}</a>.<br>
      Pour ne plus recevoir ces alertes : <a href="${unsubscribeUrl}" style="color:#64748b; text-decoration:underline;">Se désinscrire en 1 clic</a>.
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
  siteUrl = DEFAULT_SITE_URL,
}) {
  const canonicalUrl = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const count = jobs.length;
  const unsubscribeUrl = `${canonicalUrl}/api/alerts/unsubscribe?token=${encodeURIComponent(
    alert.unsubscribe_token || ""
  )}`;

  const jobCardsHtml = jobs
    .slice(0, 15)
    .map((job) => {
      const salaryTag = job.salary
        ? `<span style="background-color:rgba(16, 185, 129, 0.12); color:#047857; border:1px solid rgba(16, 185, 129, 0.25); font-size:12px; font-weight:700; padding:2px 8px; border-radius:6px; display:inline-block; margin-right:6px; margin-bottom:6px;">💰 ${escapeHtml(
            job.salary
          )}</span>`
        : "";

      const contractTag = `<span style="background-color:rgba(99, 102, 241, 0.1); color:#4338ca; border:1px solid rgba(99, 102, 241, 0.2); font-size:12px; font-weight:600; padding:2px 8px; border-radius:6px; display:inline-block; margin-right:6px; margin-bottom:6px;">${
        job.contractIcon || "💼"
      } ${escapeHtml(job.contractType || "CDI")}</span>`;

      const regionTag = `<span style="background-color:rgba(37, 99, 235, 0.1); color:#1d4ed8; border:1px solid rgba(37, 99, 235, 0.2); font-size:12px; font-weight:600; padding:2px 8px; border-radius:6px; display:inline-block; margin-right:6px; margin-bottom:6px;">${
        job.regionFlag || "🌍"
      } ${escapeHtml(job.region || "Worldwide")}</span>`;

      const tags = (job.tags || [])
        .slice(0, 3)
        .map(
          (t) =>
            `<span style="background-color:#f1f5f9; color:#475569; border:1px solid #e2e8f0; font-size:11px; padding:2px 6px; border-radius:4px; display:inline-block; margin-right:4px; margin-bottom:4px;">#${escapeHtml(
              t
            )}</span>`
        )
        .join("");

      return `
      <div style="background-color:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px 20px; margin-bottom:14px; text-align:left; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div style="margin-bottom:8px;">
          <div style="font-size:13px; font-weight:600; color:#64748b; margin-bottom:2px;">
            ${escapeHtml(job.company)}
          </div>
          <a href="${escapeHtml(job.url)}" target="_blank" style="font-size:16px; font-weight:700; color:#0f172a; text-decoration:none; line-height:1.35; display:block;">
            ${escapeHtml(job.title)}
          </a>
        </div>

        <div style="margin-top:8px; margin-bottom:8px;">
          ${contractTag}
          ${regionTag}
          ${salaryTag}
        </div>

        ${
          job.description_snippet
            ? `<div style="font-size:13px; color:#475569; line-height:1.5; margin-bottom:12px; max-height:44px; overflow:hidden;">${escapeHtml(
                job.description_snippet
              )}</div>`
            : ""
        }

        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #f1f5f9;">
          <div style="font-size:12px;">
            ${tags}
          </div>
          <a href="${escapeHtml(job.url)}" target="_blank" style="background-color:#2563eb; color:#ffffff !important; font-size:12px; font-weight:700; padding:6px 14px; border-radius:6px; text-decoration:none; display:inline-block;">
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
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#0f172a;">
  <div style="max-width:600px; margin:0 auto; padding:28px 16px;">
    
    <!-- Header avec Contraste Parfait (Sombre & Bleu sur Fond Clair) -->
    <div style="text-align:center; margin-bottom:24px;">
      <div style="font-size:36px; line-height:1; margin-bottom:6px;">🌍</div>
      <div style="font-size:22px; font-weight:800; color:#0f172a; letter-spacing:-0.02em;">
        Full Remote <span style="color:#2563eb;">Jobs</span>
      </div>
      <div style="font-size:17px; font-weight:700; color:#1e293b; margin:10px 0 4px 0;">
        ✨ ${count} nouvelle${count > 1 ? "s" : ""} offre${count > 1 ? "s" : ""} pour votre profil
      </div>
      <div style="font-size:14px; color:#64748b; margin:0 0 16px 0;">
        Voici les dernières opportunités 100% télétravail correspondant à vos alertes :
      </div>
    </div>

    <!-- Liste des cartes d'offres -->
    ${jobCardsHtml}

    <!-- Bouton CTA Principal -->
    <div style="text-align:center; margin:24px 0;">
      <a href="${canonicalUrl}" style="display:block; background-color:#2563eb; color:#ffffff !important; font-weight:700; font-size:15px; padding:14px 20px; border-radius:10px; text-decoration:none; text-align:center; box-shadow:0 2px 6px rgba(37, 99, 235, 0.25);">
        Voir toutes les offres en direct sur le site ↗
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center; font-size:12px; color:#64748b; margin-top:28px; line-height:1.6;">
      Vous recevez cette alerte pour <strong>${escapeHtml(alert.email)}</strong> sur <a href="${canonicalUrl}" style="color:#2563eb; text-decoration:underline;">${new URL(canonicalUrl).hostname}</a>.<br>
      Pour modifier vos filtres ou vous désinscrire : <a href="${unsubscribeUrl}" style="color:#64748b; text-decoration:underline;">Se désinscrire en 1 clic</a>.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Template de confirmation d'inscription au Vivier de Talents
 */
export function buildTalentWelcomeEmailHtml({ talent = {}, siteUrl = DEFAULT_SITE_URL }) {
  const canonicalUrl = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const manageUrl = `${canonicalUrl}/talents/manage?token=${encodeURIComponent(talent.manage_token || "")}`;
  const publicProfileUrl = `${canonicalUrl}/talents/${encodeURIComponent(talent.id || "")}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue dans le Vivier de Talents Full Remote !</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#0f172a;">
  <div style="max-width:600px; margin:0 auto; padding:32px 16px;">
    <div style="background-color:#ffffff; border-radius:16px; padding:32px 24px; box-shadow:0 4px 12px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:36px; line-height:1; margin-bottom:10px;">🚀</div>
        <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0; letter-spacing:-0.02em;">
          Votre profil Talent est activé !
        </h1>
        <p style="font-size:14px; color:#64748b; margin-top:6px;">
          Vous faites désormais partie du vivier vérifié 100% télétravail.
        </p>
      </div>

      <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin:20px 0;">
        <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:#2563eb; letter-spacing:0.05em; margin-bottom:10px;">
          Votre Carte Anonyme
        </div>
        <div style="font-size:16px; font-weight:800; color:#0f172a; margin-bottom:4px;">
          ${escapeHtml(talent.title || "Développeur Remote")} (${escapeHtml(talent.seniority || "Senior")})
        </div>
        <div style="font-size:13px; color:#475569; margin-bottom:8px;">
          Stack : <strong>${escapeHtml(talent.primary_stack || "")}</strong>
        </div>
        <div style="font-size:13px; color:#059669; font-weight:700;">
          💰 Prétentions : ${escapeHtml(talent.salary_expectation || "Non spécifié")}
        </div>
      </div>

      <div style="font-size:14px; color:#334155; line-height:1.6; margin-bottom:20px;">
        🔒 <strong>Votre anonymat est protégé</strong> : Vos coordonnées réelles ne sont jamais affichées publiquement. Lorsqu'une entreprise souhaite vous contacter, vous recevrez une notification détaillée par email et vous restez 100% libre d'y répondre.
      </div>

      <div style="background-color:#eff6ff; border-left:4px solid #2563eb; padding:16px; border-radius:0 8px 8px 0; margin-bottom:24px;">
        <div style="font-size:13px; font-weight:700; color:#1e40af; margin-bottom:6px;">💡 3 Conseils pour décrocher les meilleures opportunités :</div>
        <ul style="margin:0; padding-left:18px; font-size:13px; color:#1e293b; line-height:1.5;">
          <li><strong>Proof-of-Work :</strong> Les liens vers vos repos GitHub ou projets en production multiplient par 4 l'intérêt des recruteurs.</li>
          <li><strong>Alertes personnalisées :</strong> Vous recevrez automatiquement un digest hebdomadaire des nouvelles offres correspondant à votre stack.</li>
          <li><strong>Réactivité :</strong> Répondre sous 24h valorise immédiatement votre autonomie asynchrone.</li>
        </ul>
      </div>

      <div style="text-align:center; margin:28px 0;">
        <a href="${manageUrl}" style="display:inline-block; background-color:#2563eb; color:#ffffff !important; font-weight:700; font-size:15px; padding:14px 28px; border-radius:8px; text-decoration:none; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
          ⚙️ Accéder à mon Espace Privé Talent ↗
        </a>
      </div>

      <p style="font-size:12px; color:#94a3b8; text-align:center; margin:0; line-height:1.5;">
        Conservez cet email précieusement : le bouton ci-dessus contient votre lien d'accès secret pour modifier vos préférences, vos alertes d'emploi et votre visibilité à tout moment sans mot de passe.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Template de connexion sécurisée par Magic Link
 */
export function buildTalentMagicLinkEmailHtml({ talent = {}, siteUrl = DEFAULT_SITE_URL }) {
  const canonicalUrl = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const manageUrl = `${canonicalUrl}/talents/manage?token=${encodeURIComponent(talent.manage_token || "")}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre lien de connexion à FullRemote.Jobs</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#0f172a;">
  <div style="max-width:600px; margin:0 auto; padding:32px 16px;">
    <div style="background-color:#ffffff; border-radius:16px; padding:32px 24px; box-shadow:0 4px 12px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:36px; line-height:1; margin-bottom:10px;">🔑</div>
        <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0; letter-spacing:-0.02em;">
          Votre lien de connexion magique
        </h1>
        <p style="font-size:14px; color:#64748b; margin-top:6px;">
          Cliquez sur le bouton ci-dessous pour accéder directement à votre espace de gestion sans mot de passe.
        </p>
      </div>

      <div style="text-align:center; margin:32px 0;">
        <a href="${manageUrl}" style="display:inline-block; background-color:#2563eb; color:#ffffff !important; font-weight:700; font-size:15px; padding:14px 32px; border-radius:8px; text-decoration:none; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
          🔓 Me connecter à mon Espace Privé ↗
        </a>
      </div>

      <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; font-size:13px; color:#64748b; line-height:1.5;">
        <strong>Informations de sécurité :</strong><br>
        • Ce lien est personnel et vous permet de gérer votre profil <strong>${escapeHtml(talent.title || "")}</strong>.<br>
        • Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Template de connexion Magic Link Administrateur
 */
export function buildAdminMagicLinkEmailHtml({ adminUser = {}, siteUrl = DEFAULT_SITE_URL }) {
  const canonicalUrl = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const adminUrl = `${canonicalUrl}/admin?token=${encodeURIComponent(adminUser.token || "")}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accès Administrateur — FullRemote.Jobs</title>
</head>
<body style="margin:0; padding:0; background-color:#0b0f19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#f9fafb;">
  <div style="max-width:600px; margin:0 auto; padding:32px 16px;">
    <div style="background-color:#111827; border-radius:16px; padding:32px 24px; box-shadow:0 10px 25px rgba(0,0,0,0.5); border:1px solid #1f2937; text-align:center;">
      <div style="font-size:36px; line-height:1; margin-bottom:12px;">🛡️</div>
      <h1 style="font-size:22px; font-weight:800; color:#f9fafb; margin:0; letter-spacing:-0.02em;">
        Connexion au Cockpit Administrateur
      </h1>
      <p style="font-size:14px; color:#9ca3af; margin-top:8px;">
        Accès SuperAdmin sécurisé pour <strong>${escapeHtml(adminUser.email || "")}</strong>.
      </p>

      <div style="margin:32px 0;">
        <a href="${adminUrl}" style="display:inline-block; background-color:#3b82f6; color:#ffffff !important; font-weight:800; font-size:15px; padding:14px 32px; border-radius:8px; text-decoration:none; box-shadow:0 4px 12px rgba(59,130,246,0.4);">
          ⚡ Ouvrir le Cockpit Admin ↗
        </a>
      </div>

      <div style="background-color:#162032; border:1px solid #1f2937; border-radius:12px; padding:14px; font-size:12px; color:#9ca3af; line-height:1.5; text-align:left;">
        🔒 <strong>Sécurité renforcée :</strong> Ce lien d'accès vous donne les droits de supervision complète sur FullRemote.Jobs. Ne le partagez jamais.
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Template de notification au Talent lors d'une sollicitation recruteur
 */
export function buildTalentContactNotificationEmailHtml({ talent = {}, contact = {}, siteUrl = DEFAULT_SITE_URL }) {
  const canonicalUrl = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const manageUrl = `${canonicalUrl}/talents/manage?token=${encodeURIComponent(talent.manage_token || "")}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle opportunité 100% Remote pour votre profil</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#0f172a;">
  <div style="max-width:600px; margin:0 auto; padding:32px 16px;">
    <div style="background-color:#ffffff; border-radius:16px; padding:32px 24px; box-shadow:0 4px 12px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:36px; line-height:1; margin-bottom:10px;">💼</div>
        <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0; letter-spacing:-0.02em;">
          Une entreprise souhaite vous contacter !
        </h1>
        <p style="font-size:14px; color:#64748b; margin-top:6px;">
          Sollicitation reçue via FullRemote.Jobs pour votre profil <strong>${escapeHtml(talent.title || "")}</strong>.
        </p>
      </div>

      <!-- Détails Recruteur -->
      <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:20px 0;">
        <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:#2563eb; letter-spacing:0.05em; margin-bottom:12px;">
          Coordonnées du Décideur
        </div>
        <div style="font-size:14px; color:#0f172a; margin-bottom:6px;">
          <strong>Recruteur :</strong> ${escapeHtml(contact.recruiter_name)} (${escapeHtml(contact.recruiter_company)})
        </div>
        <div style="font-size:14px; color:#0f172a; margin-bottom:6px;">
          <strong>Email direct :</strong> <a href="mailto:${escapeHtml(contact.recruiter_email)}" style="color:#2563eb; text-decoration:underline;">${escapeHtml(contact.recruiter_email)}</a>
        </div>
        ${contact.job_title ? `<div style="font-size:14px; color:#0f172a; margin-bottom:6px;"><strong>Poste proposé :</strong> ${escapeHtml(contact.job_title)}</div>` : ""}
        ${contact.job_url ? `<div style="font-size:14px; color:#0f172a; margin-bottom:6px;"><strong>Lien de l'offre :</strong> <a href="${escapeHtml(contact.job_url)}" target="_blank" style="color:#2563eb; text-decoration:underline;">Consulter l'offre ↗</a></div>` : ""}
      </div>

      <!-- Message du recruteur -->
      <div style="border-left:4px solid #2563eb; background-color:#eff6ff; padding:16px; border-radius:0 8px 8px 0; margin-bottom:24px;">
        <div style="font-size:12px; font-weight:700; color:#1e40af; margin-bottom:6px;">Message personnalisé :</div>
        <div style="font-size:14px; color:#1e293b; line-height:1.6; white-space:pre-wrap;">${escapeHtml(contact.message || "")}</div>
      </div>

      <div style="text-align:center; margin:28px 0;">
        <a href="mailto:${escapeHtml(contact.recruiter_email)}?subject=Re:%20Votre%20sollicitation%20FullRemote.Jobs" style="display:inline-block; background-color:#2563eb; color:#ffffff !important; font-weight:700; font-size:15px; padding:14px 28px; border-radius:8px; text-decoration:none;">
          ✉️ Répondre directement au recruteur ↗
        </a>
      </div>

      <div style="border-top:1px solid #e2e8f0; padding-top:16px; margin-top:24px; text-align:center; font-size:12px; color:#64748b;">
        Vous n'êtes plus disponible ? <a href="${manageUrl}" style="color:#2563eb; text-decoration:underline;">Mettre mon profil en pause en 1 clic</a>.
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Construit l'email hebdomadaire B2B "Weekly Talent Drop" pour les recruteurs abonnés
 */
export function buildWeeklyTalentDropEmailHtml({ talents = [], siteUrl = DEFAULT_SITE_URL }) {
  const talentsUrl = `${siteUrl}/talents`;
  const dateStr = new Date().toLocaleDateString("fr-FR", { dateStyle: "long" });

  const talentsListHtml = (talents || []).map((t, idx) => {
    const tags = Array.isArray(t.tags) ? t.tags : [];
    const tagsHtml = tags.slice(0, 4).map(tag => `<span style="display:inline-block; font-size:11px; color:#475569; background-color:#f1f5f9; border:1px solid #e2e8f0; padding:2px 6px; border-radius:4px; margin-right:4px;">#${escapeHtml(tag)}</span>`).join("");
    const salStr = t.salary_expectation ? `<span style="font-size:12px; font-weight:700; color:#b45309; background:#fef3c7; padding:2px 6px; border-radius:4px; margin-left:6px;">💰 ${escapeHtml(t.salary_expectation)}</span>` : "";

    return `
    <div style="background-color:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
        <div>
          <span style="font-size:11px; font-weight:800; color:#2563eb; text-transform:uppercase; letter-spacing:0.05em;">Talent #${idx + 1}</span>
          <h3 style="font-size:16px; font-weight:800; color:#0f172a; margin:2px 0 0 0;">${escapeHtml(t.title)}</h3>
        </div>
        <span style="font-size:12px; font-weight:700; color:#059669; background:#d1fae5; padding:3px 8px; border-radius:6px;">
          ${escapeHtml(t.seniority ? t.seniority.toUpperCase() : "SENIOR")}
        </span>
      </div>

      <div style="font-size:13px; color:#64748b; margin-bottom:10px;">
        🌍 <strong>${escapeHtml(t.location || "France / Europe")}</strong> • ⚡ <strong>${escapeHtml(t.primary_stack || "")}</strong> ${salStr}
      </div>

      ${t.bio_snippet ? `<p style="font-size:13px; color:#334155; line-height:1.5; margin:0 0 10px 0;">${escapeHtml(t.bio_snippet.slice(0, 180))}...</p>` : ""}

      <div style="margin-bottom:12px;">
        ${tagsHtml}
      </div>

      <div style="text-align:right;">
        <a href="${talentsUrl}" style="display:inline-block; font-size:12px; font-weight:700; background-color:#2563eb; color:#ffffff !important; padding:6px 14px; border-radius:6px; text-decoration:none;">
          ✉️ Contacter en direct ↗
        </a>
      </div>
    </div>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Talent Drop — FullRemote.Jobs</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#0f172a;">
  <div style="max-width:620px; margin:0 auto; padding:32px 16px;">
    <div style="text-align:center; margin-bottom:24px;">
      <span style="display:inline-block; font-size:11px; font-weight:800; text-transform:uppercase; color:#2563eb; background:rgba(37,99,235,0.1); padding:4px 12px; border-radius:99px; letter-spacing:0.05em; margin-bottom:8px;">
        👑 Recruiter Pass • ${dateStr}
      </span>
      <h1 style="font-size:24px; font-weight:800; color:#0f172a; margin:0 0 8px 0; letter-spacing:-0.03em;">
        Weekly Talent Drop : Les 10 Meilleurs Profils 100% Remote
      </h1>
      <p style="font-size:14px; color:#64748b; margin:0 auto; max-width:520px; line-height:1.5;">
        Voici la sélection exclusive des profils confirmés et seniors prêts à démarrer en télétravail cette semaine. Contactez-les en direct sans intermédiaire ni commission.
      </p>
    </div>

    <!-- Liste des profils -->
    <div>
      ${talentsListHtml}
    </div>

    <!-- CTA Visiter l'annuaire complet -->
    <div style="text-align:center; margin:32px 0;">
      <a href="${talentsUrl}" style="display:inline-block; background-color:#0f172a; color:#ffffff !important; font-weight:800; font-size:15px; padding:14px 28px; border-radius:8px; text-decoration:none;">
        🚀 Consulter tous les talents disponibles sur FullRemote.Jobs ↗
      </a>
    </div>

    <div style="border-top:1px solid #e2e8f0; padding-top:16px; text-align:center; font-size:12px; color:#94a3b8;">
      © 2026 FullRemote.Jobs — Recruiter Pass & Weekly Talent Drops.
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

