/**
 * FullRemote-Jobs - Cloudflare D1 Database Helper
 */

let isDbInitialized = false;

/**
 * Initialise le schéma D1 si la table n'existe pas encore
 */
export async function initDb(db) {
  if (!db || isDbInitialized) return;
  isDbInitialized = true;
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        company_logo TEXT,
        url TEXT NOT NULL,
        category TEXT NOT NULL,
        category_id TEXT NOT NULL,
        category_icon TEXT,
        contract_type_id TEXT DEFAULT 'cdi_fulltime',
        contract_type_label TEXT DEFAULT 'CDI / Full-time',
        contract_icon TEXT DEFAULT '💼',
        tags_json TEXT DEFAULT '[]',
        job_type TEXT DEFAULT 'Full-time',
        location TEXT,
        region_id TEXT NOT NULL,
        region_label TEXT NOT NULL,
        region_flag TEXT,
        salary TEXT,
        salary_min INTEGER DEFAULT 0,
        salary_max INTEGER DEFAULT 0,
        currency TEXT,
        description_snippet TEXT,
        source TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        published_at TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_jobs_region ON jobs(region_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_contract ON jobs(contract_type_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_language ON jobs(language);
      CREATE INDEX IF NOT EXISTS idx_jobs_published ON jobs(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);

      CREATE TABLE IF NOT EXISTS email_alerts (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        region_id TEXT DEFAULT 'all',
        category_id TEXT DEFAULT 'all',
        contract_type_id TEXT DEFAULT 'all',
        keywords TEXT DEFAULT '',
        frequency TEXT DEFAULT 'daily',
        is_active INTEGER DEFAULT 1,
        unsubscribe_token TEXT NOT NULL UNIQUE,
        last_sent_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_alerts_email ON email_alerts(email);
      CREATE INDEX IF NOT EXISTS idx_alerts_active ON email_alerts(is_active);
      CREATE INDEX IF NOT EXISTS idx_alerts_token ON email_alerts(unsubscribe_token);

      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id TEXT PRIMARY KEY,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        region_id TEXT DEFAULT 'all',
        category_id TEXT DEFAULT 'all',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_push_active ON push_subscriptions(is_active);
      CREATE INDEX IF NOT EXISTS idx_push_endpoint ON push_subscriptions(endpoint);

      CREATE TABLE IF NOT EXISTS notification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject_or_title TEXT,
        items_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'sent',
        error_message TEXT,
        sent_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_notif_logs_type ON notification_logs(type);
      CREATE INDEX IF NOT EXISTS idx_notif_logs_sent ON notification_logs(sent_at DESC);

      CREATE TABLE IF NOT EXISTS talents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        seniority TEXT DEFAULT 'senior',
        primary_stack TEXT NOT NULL,
        tags_json TEXT DEFAULT '[]',
        salary_expectation TEXT,
        min_eur INTEGER DEFAULT 0,
        tjm_eur INTEGER DEFAULT 0,
        availability TEXT DEFAULT '30_days',
        location TEXT DEFAULT 'France / Europe',
        bio_snippet TEXT,
        github_url TEXT,
        linkedin_url TEXT,
        portfolio_url TEXT,
        cv_url TEXT,
        cv_data TEXT,
        cv_filename TEXT,
        email TEXT NOT NULL,
        manage_token TEXT NOT NULL UNIQUE,
        status TEXT DEFAULT 'active',
        view_count INTEGER DEFAULT 0,
        contact_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_talents_status ON talents(status);
      CREATE INDEX IF NOT EXISTS idx_talents_seniority ON talents(seniority);
      CREATE INDEX IF NOT EXISTS idx_talents_availability ON talents(availability);
      CREATE INDEX IF NOT EXISTS idx_talents_token ON talents(manage_token);

      CREATE TABLE IF NOT EXISTS talent_contacts (
        id TEXT PRIMARY KEY,
        talent_id TEXT NOT NULL,
        recruiter_name TEXT NOT NULL,
        recruiter_company TEXT NOT NULL,
        recruiter_email TEXT NOT NULL,
        job_title TEXT,
        job_url TEXT,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_talent_contacts_tid ON talent_contacts(talent_id);

      CREATE TABLE IF NOT EXISTS job_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT NOT NULL,
        job_title TEXT,
        company TEXT,
        user_type TEXT DEFAULT 'guest',
        user_id TEXT,
        user_email TEXT,
        status TEXT DEFAULT 'clicked',
        tags_json TEXT DEFAULT '[]',
        referrer TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_clicks_job ON job_clicks(job_id);
      CREATE INDEX IF NOT EXISTS idx_clicks_user ON job_clicks(user_id);
      CREATE INDEX IF NOT EXISTS idx_clicks_status ON job_clicks(status);

      CREATE TABLE IF NOT EXISTS talent_applications (
        id TEXT PRIMARY KEY,
        talent_id TEXT NOT NULL,
        job_id TEXT NOT NULL,
        job_title TEXT NOT NULL,
        company TEXT NOT NULL,
        company_logo TEXT,
        job_url TEXT NOT NULL,
        salary TEXT,
        contract_type TEXT,
        region TEXT,
        tags_json TEXT DEFAULT '[]',
        status TEXT DEFAULT 'applied',
        notes TEXT,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(talent_id, job_id)
      );
      CREATE INDEX IF NOT EXISTS idx_app_talent ON talent_applications(talent_id);
      CREATE INDEX IF NOT EXISTS idx_app_status ON talent_applications(status);

      CREATE TABLE IF NOT EXISTS job_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT NOT NULL,
        reason TEXT DEFAULT 'expired',
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reports_job ON job_reports(job_id);
    `);

    // Migration progressive pour colonnes CV si table déjà existante
    try {
      await db.exec(`
        ALTER TABLE talents ADD COLUMN cv_url TEXT;
        ALTER TABLE talents ADD COLUMN cv_data TEXT;
        ALTER TABLE talents ADD COLUMN cv_filename TEXT;
      `);
    } catch (_) {}
  } catch (e) {
    console.warn("DB init notice:", e.message);
  }
}

/**
 * Sauvegarde par batch les jobs dans D1 avec dédoublonnage (INSERT OR REPLACE)
 */
export async function saveJobsToDb(db, jobs = []) {
  if (!db || !jobs || jobs.length === 0) return 0;

  let savedCount = 0;
  const BATCH_SIZE = 25;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const chunk = jobs.slice(i, i + BATCH_SIZE);
    const statements = chunk.map((job) =>
      db
        .prepare(
          `INSERT INTO jobs (
            id, title, company, company_logo, url, category, category_id, category_icon,
            contract_type_id, contract_type_label, contract_icon,
            tags_json, job_type, location, region_id, region_label, region_flag,
            salary, salary_min, salary_max, currency, description_snippet,
            source, language, published_at, is_active, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            company = excluded.company,
            company_logo = COALESCE(excluded.company_logo, jobs.company_logo),
            url = excluded.url,
            category = excluded.category,
            category_id = excluded.category_id,
            category_icon = excluded.category_icon,
            contract_type_id = excluded.contract_type_id,
            contract_type_label = excluded.contract_type_label,
            contract_icon = excluded.contract_icon,
            tags_json = excluded.tags_json,
            job_type = excluded.job_type,
            location = excluded.location,
            region_id = excluded.region_id,
            region_label = excluded.region_label,
            region_flag = excluded.region_flag,
            salary = COALESCE(excluded.salary, jobs.salary),
            description_snippet = excluded.description_snippet,
            source = excluded.source,
            language = excluded.language,
            published_at = excluded.published_at,
            updated_at = CURRENT_TIMESTAMP`
        )
        .bind(
          job.id || `job_${Math.random().toString(36).substring(2, 9)}`,
          job.title || "Poste Remote",
          job.company || "Entreprise",
          job.company_logo || "",
          job.url || "",
          job.category || "Tech & Dev",
          job.categoryId || "tech",
          job.categoryIcon || "💼",
          job.contractTypeId || "cdi_fulltime",
          job.contractType || "CDI / Full-time",
          job.contractIcon || "💼",
          JSON.stringify(job.tags || []),
          job.job_type || "Full-time",
          job.location || "Worldwide",
          job.regionId || "worldwide",
          job.region || "Worldwide",
          job.regionFlag || "🌍",
          job.salary || "",
          job.salary_min || job.salary_min_eur || 0,
          job.salary_max || job.salary_max_eur || 0,
          job.currency || "EUR",
          job.description_snippet || "",
          job.source || "Aggregator",
          job.language || "en",
          job.published_at || new Date().toISOString()
        )
    );

    try {
      await db.batch(statements);
      savedCount += chunk.length;
    } catch (err) {
      console.error("Erreur lors de la sauvegarde D1 en lot :", err);
    }
  }

  return savedCount;
}

/**
 * Récupère les jobs depuis Cloudflare D1 avec filtres et pagination
 */
export async function queryJobsFromDb(db, options = {}) {
  if (!db) return null;

  const {
    region = "all",
    category = "all",
    contract = "all",
    language = "all",
    search = "",
    hasSalary = false,
    limit = 2000,
    offset = 0,
  } = options;

  let query = "SELECT * FROM jobs WHERE is_active = 1";
  const params = [];

  if (region && region !== "all") {
    query += " AND region_id = ?";
    params.push(region);
  }

  if (category && category !== "all") {
    query += " AND category_id = ?";
    params.push(category);
  }

  if (contract && contract !== "all") {
    query += " AND contract_type_id = ?";
    params.push(contract);
  }

  if (language && language !== "all") {
    query += " AND language = ?";
    params.push(language);
  }

  if (hasSalary) {
    query += " AND salary IS NOT NULL AND salary != ''";
  }

  if (search) {
    query += " AND (title LIKE ? OR company LIKE ? OR tags_json LIKE ?)";
    const wildcard = `%${search}%`;
    params.push(wildcard, wildcard, wildcard);
  }

  query += " ORDER BY published_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  try {
    const res = await db.prepare(query).bind(...params).all();
    return (res.results || []).map((row) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      company_logo: row.company_logo,
      url: row.url,
      category: row.category,
      categoryId: row.category_id,
      categoryIcon: row.category_icon,
      contractType: row.contract_type_label || "CDI / Full-time",
      contractTypeId: row.contract_type_id || "cdi_fulltime",
      contractIcon: row.contract_icon || "💼",
      tags: (() => {
        try {
          return JSON.parse(row.tags_json || "[]");
        } catch (e) {
          return [];
        }
      })(),
      job_type: row.job_type,
      location: row.location,
      region: row.region_label,
      regionId: row.region_id,
      regionFlag: row.region_flag,
      salary: row.salary,
      salary_min: row.salary_min,
      salary_max: row.salary_max,
      currency: row.currency,
      description_snippet: row.description_snippet,
      source: row.source,
      language: row.language,
      published_at: row.published_at,
    }));
  } catch (err) {
    console.error("Erreur lors de la requête SQL D1 :", err);
    return null;
  }
}

/**
 * Récupère les statistiques de la base D1
 */
export async function getDbStats(db) {
  if (!db) return null;
  try {
    const totalRes = await db.prepare("SELECT COUNT(*) as count FROM jobs WHERE is_active = 1").first();
    const regionsRes = await db
      .prepare("SELECT region_id, COUNT(*) as count FROM jobs WHERE is_active = 1 GROUP BY region_id")
      .all();
    const contractsRes = await db
      .prepare("SELECT contract_type_id, COUNT(*) as count FROM jobs WHERE is_active = 1 GROUP BY contract_type_id")
      .all();
    const sourcesRes = await db
      .prepare("SELECT source, COUNT(*) as count FROM jobs WHERE is_active = 1 GROUP BY source")
      .all();
    const langRes = await db
      .prepare("SELECT language, COUNT(*) as count FROM jobs WHERE is_active = 1 GROUP BY language")
      .all();

    const byRegion = {};
    for (const r of regionsRes.results || []) byRegion[r.region_id] = r.count;

    const byContract = {};
    for (const c of contractsRes.results || []) byContract[c.contract_type_id] = c.count;

    const bySource = {};
    for (const s of sourcesRes.results || []) bySource[s.source] = s.count;

    const byLanguage = {};
    for (const l of langRes.results || []) byLanguage[l.language] = l.count;

    return {
      total: totalRes ? totalRes.count : 0,
      by_region: byRegion,
      by_contract: byContract,
      by_source: bySource,
      by_language: byLanguage,
    };
  } catch (err) {
    console.error("Erreur getDbStats D1 :", err);
    return null;
  }
}

/**
 * Enregistre ou met à jour une alerte email
 */
export async function saveEmailAlert(db, data = {}) {
  if (!db || !data.email) return null;

  const id = data.id || `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const token = data.unsubscribe_token || `unsub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  try {
    await db
      .prepare(
        `INSERT INTO email_alerts (
          id, email, region_id, category_id, contract_type_id, keywords, frequency, is_active, unsubscribe_token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET
          region_id = excluded.region_id,
          category_id = excluded.category_id,
          contract_type_id = excluded.contract_type_id,
          keywords = excluded.keywords,
          frequency = excluded.frequency,
          is_active = 1`
      )
      .bind(
        id,
        data.email.toLowerCase().trim(),
        data.region_id || "all",
        data.category_id || "all",
        data.contract_type_id || "all",
        (data.keywords || "").trim(),
        data.frequency || "daily",
        token
      )
      .run();

    return {
      id,
      email: data.email.toLowerCase().trim(),
      region_id: data.region_id || "all",
      category_id: data.category_id || "all",
      contract_type_id: data.contract_type_id || "all",
      keywords: (data.keywords || "").trim(),
      frequency: data.frequency || "daily",
      unsubscribe_token: token,
    };
  } catch (err) {
    console.error("Erreur saveEmailAlert D1 :", err);
    return null;
  }
}

/**
 * Récupère une alerte par son token de désinscription
 */
export async function getEmailAlertByToken(db, token) {
  if (!db || !token) return null;
  try {
    return await db
      .prepare("SELECT * FROM email_alerts WHERE unsubscribe_token = ? LIMIT 1")
      .bind(token)
      .first();
  } catch (err) {
    console.error("Erreur getEmailAlertByToken D1 :", err);
    return null;
  }
}

/**
 * Désactive une alerte email (désinscription)
 */
export async function unsubscribeEmailAlert(db, token) {
  if (!db || !token) return false;
  try {
    const res = await db
      .prepare("UPDATE email_alerts SET is_active = 0 WHERE unsubscribe_token = ?")
      .bind(token)
      .run();
    return res.meta && res.meta.changes > 0;
  } catch (err) {
    console.error("Erreur unsubscribeEmailAlert D1 :", err);
    return false;
  }
}

/**
 * Récupère toutes les alertes emails actives
 */
export async function getActiveEmailAlerts(db) {
  if (!db) return [];
  try {
    const res = await db
      .prepare("SELECT * FROM email_alerts WHERE is_active = 1 ORDER BY created_at DESC")
      .all();
    return res.results || [];
  } catch (err) {
    console.error("Erreur getActiveEmailAlerts D1 :", err);
    return [];
  }
}

/**
 * Met à jour la date du dernier envoi pour une alerte
 */
export async function updateAlertLastSent(db, alertId) {
  if (!db || !alertId) return;
  try {
    await db
      .prepare("UPDATE email_alerts SET last_sent_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(alertId)
      .run();
  } catch (err) {
    console.error("Erreur updateAlertLastSent D1 :", err);
  }
}

/**
 * Enregistre un abonnement Web Push navigateur
 */
export async function savePushSubscription(db, subData = {}) {
  if (!db || !subData.endpoint || !subData.p256dh || !subData.auth) return null;

  const id = `push_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    await db
      .prepare(
        `INSERT INTO push_subscriptions (
          id, endpoint, p256dh, auth, region_id, category_id, is_active, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(endpoint) DO UPDATE SET
          p256dh = excluded.p256dh,
          auth = excluded.auth,
          region_id = excluded.region_id,
          category_id = excluded.category_id,
          is_active = 1,
          updated_at = CURRENT_TIMESTAMP`
      )
      .bind(
        id,
        subData.endpoint,
        subData.p256dh,
        subData.auth,
        subData.region_id || "all",
        subData.category_id || "all"
      )
      .run();

    return { id, endpoint: subData.endpoint };
  } catch (err) {
    console.error("Erreur savePushSubscription D1 :", err);
    return null;
  }
}

/**
 * Récupère tous les abonnements Web Push actifs
 */
export async function getActivePushSubscriptions(db) {
  if (!db) return [];
  try {
    const res = await db
      .prepare("SELECT * FROM push_subscriptions WHERE is_active = 1 ORDER BY created_at DESC")
      .all();
    return res.results || [];
  } catch (err) {
    console.error("Erreur getActivePushSubscriptions D1 :", err);
    return [];
  }
}

/**
 * Supprime ou désactive un abonnement Web Push expiré
 */
export async function deletePushSubscription(db, endpoint) {
  if (!db || !endpoint) return;
  try {
    await db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(endpoint).run();
  } catch (err) {
    console.error("Erreur deletePushSubscription D1 :", err);
  }
}

/**
 * Enregistre un log d'envoi de notification
 */
export async function logNotification(db, logData = {}) {
  if (!db) return;
  try {
    await db
      .prepare(
        `INSERT INTO notification_logs (
          type, recipient, subject_or_title, items_count, status, error_message
        ) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        logData.type || "email",
        logData.recipient || "",
        logData.subject_or_title || "",
        logData.items_count || 0,
        logData.status || "sent",
        logData.error_message || null
      )
      .run();
  } catch (err) {
    console.error("Erreur logNotification D1 :", err);
  }
}

/**
 * Enregistre ou met à jour un profil de talent dans D1
 */
export async function saveTalentProfile(db, data = {}) {
  if (!db) return null;
  try {
    const id = data.id || `talent_${Math.random().toString(36).substring(2, 9)}`;
    const manageToken = data.manage_token || `token_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
    const tagsJson = JSON.stringify(data.tags || []);

    await db
      .prepare(
        `INSERT INTO talents (
          id, title, seniority, primary_stack, tags_json, salary_expectation,
          min_eur, tjm_eur, availability, location, bio_snippet,
          github_url, linkedin_url, portfolio_url, cv_url, cv_data, cv_filename, email, manage_token,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          seniority = excluded.seniority,
          primary_stack = excluded.primary_stack,
          tags_json = excluded.tags_json,
          salary_expectation = excluded.salary_expectation,
          min_eur = excluded.min_eur,
          tjm_eur = excluded.tjm_eur,
          availability = excluded.availability,
          location = excluded.location,
          bio_snippet = excluded.bio_snippet,
          github_url = excluded.github_url,
          linkedin_url = excluded.linkedin_url,
          portfolio_url = excluded.portfolio_url,
          cv_url = excluded.cv_url,
          cv_data = excluded.cv_data,
          cv_filename = excluded.cv_filename,
          email = excluded.email,
          updated_at = CURRENT_TIMESTAMP`
      )
      .bind(
        id,
        data.title || "Développeur Remote",
        data.seniority || "senior",
        data.primary_stack || "Fullstack",
        tagsJson,
        data.salary_expectation || "",
        data.min_eur || 0,
        data.tjm_eur || 0,
        data.availability || "30_days",
        data.location || "France / Europe",
        data.bio_snippet || "",
        data.github_url || "",
        data.linkedin_url || "",
        data.portfolio_url || "",
        data.cv_url || "",
        data.cv_data || "",
        data.cv_filename || "",
        data.email || "",
        manageToken
      )
      .run();

    return { id, manage_token: manageToken, ...data };
  } catch (err) {
    console.error("Erreur saveTalentProfile D1 :", err);
    throw err;
  }
}

/**
 * Récupère les profils de talents actifs
 */
export async function queryTalentsFromDb(db, options = {}) {
  if (!db) return [];
  try {
    const limit = options.limit || 50;
    const seniority = options.seniority || "all";
    const availability = options.availability || "all";
    const q = (options.q || "").toLowerCase().trim();

    let sql = "SELECT * FROM talents WHERE status = 'active'";
    const params = [];

    if (seniority !== "all") {
      sql += " AND seniority = ?";
      params.push(seniority);
    }
    if (availability !== "all") {
      sql += " AND availability = ?";
      params.push(availability);
    }
    if (q) {
      sql += " AND (LOWER(title) LIKE ? OR LOWER(primary_stack) LIKE ? OR LOWER(tags_json) LIKE ? OR LOWER(bio_snippet) LIKE ?)";
      const term = `%${q}%`;
      params.push(term, term, term, term);
    }

    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const stmt = db.prepare(sql);
    const { results } = await stmt.bind(...params).all();

    return (results || []).map((row) => ({
      ...row,
      tags: JSON.parse(row.tags_json || "[]"),
    }));
  } catch (err) {
    console.error("Erreur queryTalentsFromDb D1 :", err);
    return [];
  }
}

/**
 * Récupère un talent par son ID public
 */
export async function getTalentById(db, id) {
  if (!db || !id) return null;
  try {
    const row = await db.prepare("SELECT * FROM talents WHERE id = ?").bind(id).first();
    if (!row) return null;
    return {
      ...row,
      tags: JSON.parse(row.tags_json || "[]"),
    };
  } catch (err) {
    console.error("Erreur getTalentById D1 :", err);
    return null;
  }
}

/**
 * Récupère un talent par son token privé de gestion
 */
export async function getTalentByToken(db, token) {
  if (!db || !token) return null;
  try {
    const row = await db.prepare("SELECT * FROM talents WHERE manage_token = ?").bind(token).first();
    if (!row) return null;
    return {
      ...row,
      tags: JSON.parse(row.tags_json || "[]"),
    };
  } catch (err) {
    console.error("Erreur getTalentByToken D1 :", err);
    return null;
  }
}

/**
 * Récupère un profil talent par son adresse email
 */
export async function getTalentByEmail(db, email) {
  if (!db || !email) return null;
  try {
    const row = await db.prepare("SELECT * FROM talents WHERE LOWER(email) = LOWER(?) ORDER BY created_at DESC LIMIT 1").bind(email.trim()).first();
    if (!row) return null;
    return {
      ...row,
      tags: JSON.parse(row.tags_json || "[]"),
    };
  } catch (err) {
    console.error("Erreur getTalentByEmail D1 :", err);
    return null;
  }
}

/**
 * Met à jour le statut d'un talent (active / paused / hired)
 */
export async function updateTalentStatus(db, token, status) {
  if (!db || !token || !status) return false;
  try {
    const res = await db
      .prepare("UPDATE talents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE manage_token = ?")
      .bind(status, token)
      .run();
    return res.success;
  } catch (err) {
    console.error("Erreur updateTalentStatus D1 :", err);
    return false;
  }
}

/**
 * Enregistre une mise en relation recruteur -> talent
 */
export async function recordTalentContact(db, contactData = {}) {
  if (!db) return null;
  try {
    const id = `contact_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    await db
      .prepare(
        `INSERT INTO talent_contacts (
          id, talent_id, recruiter_name, recruiter_company, recruiter_email,
          job_title, job_url, message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .bind(
        id,
        contactData.talent_id || "",
        contactData.recruiter_name || "",
        contactData.recruiter_company || "",
        contactData.recruiter_email || "",
        contactData.job_title || "",
        contactData.job_url || "",
        contactData.message || ""
      )
      .run();

    // Incrémente le compteur de contacts reçus par le talent
    await db
      .prepare("UPDATE talents SET contact_count = contact_count + 1 WHERE id = ?")
      .bind(contactData.talent_id)
      .run();

    return { id, ...contactData };
  } catch (err) {
    console.error("Erreur recordTalentContact D1 :", err);
    throw err;
  }
}

/**
 * Incrémente le compteur de vues d'un talent
 */
export async function incrementTalentViews(db, id) {
  if (!db || !id) return;
  try {
    await db.prepare("UPDATE talents SET view_count = view_count + 1 WHERE id = ?").bind(id).run();
  } catch (e) {}
}

/**
 * Met à jour les informations d'un talent depuis son espace privé
 */
export async function updateTalentProfileByToken(db, token, data = {}) {
  if (!db || !token) return null;
  try {
    const tagsJson = JSON.stringify(data.tags || []);
    let sql = `UPDATE talents SET
      title = COALESCE(?, title),
      seniority = COALESCE(?, seniority),
      availability = COALESCE(?, availability),
      primary_stack = COALESCE(?, primary_stack),
      tags_json = COALESCE(?, tags_json),
      salary_expectation = COALESCE(?, salary_expectation),
      location = COALESCE(?, location),
      bio_snippet = COALESCE(?, bio_snippet),
      github_url = COALESCE(?, github_url),
      portfolio_url = COALESCE(?, portfolio_url),
      updated_at = CURRENT_TIMESTAMP`;
    const params = [
      data.title || null,
      data.seniority || null,
      data.availability || null,
      data.primary_stack || null,
      tagsJson,
      data.salary_expectation || null,
      data.location || null,
      data.bio_snippet || null,
      data.github_url || null,
      data.portfolio_url || null,
    ];

    if (data.cv_data) {
      sql += `, cv_data = ?, cv_filename = ?`;
      params.push(data.cv_data, data.cv_filename || "CV.pdf");
    }
    if (data.cv_url) {
      sql += `, cv_url = ?`;
      params.push(data.cv_url);
    }

    sql += ` WHERE manage_token = ?`;
    params.push(token);

    await db.prepare(sql).bind(...params).run();
    return await getTalentByToken(db, token);
  } catch (err) {
    console.error("Erreur updateTalentProfileByToken D1 :", err);
    return null;
  }
}

/**
 * Supprime définitivement un profil talent (Droit à l'oubli / RGPD)
 */
export async function deleteTalentProfileByToken(db, token) {
  if (!db || !token) return false;
  try {
    const talent = await getTalentByToken(db, token);
    if (talent && talent.id) {
      try {
        await db.prepare("DELETE FROM talent_contacts WHERE talent_id = ?").bind(talent.id).run();
      } catch (_) {}
      try {
        await db.prepare("DELETE FROM email_alerts WHERE email = ?").bind(talent.email.toLowerCase().trim()).run();
      } catch (_) {}
      const res = await db.prepare("DELETE FROM talents WHERE manage_token = ?").bind(token).run();
      return res.success;
    }
    return false;
  } catch (err) {
    console.error("Erreur deleteTalentProfileByToken D1 :", err);
    return false;
  }
}


/**
 * Initialise ou récupère un administrateur par token
 */
export async function getAdminByToken(db, token) {
  if (!db || !token) return null;
  try {
    const row = await db.prepare("SELECT * FROM admins WHERE token = ? LIMIT 1").bind(token).first();
    if (row) return row;
    // Fallbacks
    if (token === "adm_hello_94f87a2b6e1c") return { id: "admin_hello", email: "hello@remote-jobs.app", role: "superadmin" };
    if (token === "adm_charles_5e71c8b39a4d") return { id: "admin_charles", email: "charles@edounze.com", role: "superadmin" };
    return null;
  } catch (err) {
    console.error("Erreur getAdminByToken D1 :", err);
    return null;
  }
}

/**
 * Récupère un administrateur par email
 */
export async function getAdminByEmail(db, email) {
  if (!db || !email) return null;
  try {
    const cleanEmail = email.toLowerCase().trim();
    const row = await db.prepare("SELECT * FROM admins WHERE LOWER(email) = ? LIMIT 1").bind(cleanEmail).first();
    if (row) return row;
    if (cleanEmail === "hello@remote-jobs.app") {
      const token = "adm_hello_94f87a2b6e1c";
      await db.prepare("INSERT OR IGNORE INTO admins (id, email, token, role) VALUES ('admin_hello', 'hello@remote-jobs.app', ?, 'superadmin')").bind(token).run();
      return { id: "admin_hello", email: "hello@remote-jobs.app", token, role: "superadmin" };
    }
    if (cleanEmail === "charles@edounze.com") {
      const token = "adm_charles_5e71c8b39a4d";
      await db.prepare("INSERT OR IGNORE INTO admins (id, email, token, role) VALUES ('admin_charles', 'charles@edounze.com', ?, 'superadmin')").bind(token).run();
      return { id: "admin_charles", email: "charles@edounze.com", token, role: "superadmin" };
    }
    return null;
  } catch (err) {
    console.error("Erreur getAdminByEmail D1 :", err);
    return null;
  }
}

/**
 * Récupère les métriques consolidées pour le Dashboard Admin
 */
export async function getAdminDashboardMetrics(db) {
  if (!db) return null;
  try {
    const [
      jobsStats,
      jobsPast24hRes,
      talentsStatsRes,
      contactsStatsRes,
      alertsStatsRes,
      pushStatsRes,
      recentContactsRes,
      recentTalentsRes,
      recentLogsRes,
    ] = await Promise.all([
      db.prepare(`
        SELECT 
          COUNT(*) as total_jobs,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_jobs,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_jobs,
          SUM(CASE WHEN salary IS NOT NULL AND salary != '' THEN 1 ELSE 0 END) as with_salary
        FROM jobs
      `).first(),
      db.prepare(`
        SELECT COUNT(*) as count FROM jobs WHERE datetime(published_at) >= datetime('now', '-24 hours')
      `).first(),
      db.prepare(`
        SELECT 
          COUNT(*) as total_talents,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_talents,
          SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused_talents,
          SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired_talents,
          SUM(CASE WHEN (cv_data IS NOT NULL AND cv_data != '') OR (cv_url IS NOT NULL AND cv_url != '') THEN 1 ELSE 0 END) as with_cv,
          SUM(view_count) as total_views,
          SUM(contact_count) as total_contacts_count
        FROM talents
      `).first(),
      db.prepare(`
        SELECT 
          COUNT(*) as total_contacts,
          SUM(CASE WHEN datetime(created_at) >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as contacts_7d
        FROM talent_contacts
      `).first(),
      db.prepare(`
        SELECT 
          COUNT(*) as total_alerts,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_alerts,
          SUM(CASE WHEN frequency = 'daily' AND is_active = 1 THEN 1 ELSE 0 END) as daily_alerts,
          SUM(CASE WHEN frequency = 'weekly' AND is_active = 1 THEN 1 ELSE 0 END) as weekly_alerts
        FROM email_alerts
      `).first(),
      db.prepare(`
        SELECT 
          COUNT(*) as total_push,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_push
        FROM push_subscriptions
      `).first(),
      db.prepare(`
        SELECT tc.*, t.title as talent_title, t.email as talent_email
        FROM talent_contacts tc
        LEFT JOIN talents t ON tc.talent_id = t.id
        ORDER BY tc.created_at DESC LIMIT 10
      `).all(),
      db.prepare(`
        SELECT * FROM talents ORDER BY created_at DESC LIMIT 20
      `).all(),
      db.prepare(`
        SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT 15
      `).all(),
    ]);

    const bySource = await db.prepare("SELECT source, COUNT(*) as count FROM jobs WHERE is_active = 1 GROUP BY source ORDER BY count DESC").all();
    const byRegion = await db.prepare("SELECT region_label, region_flag, COUNT(*) as count FROM jobs WHERE is_active = 1 GROUP BY region_id ORDER BY count DESC").all();
    const byContract = await db.prepare("SELECT contract_type_label, contract_icon, COUNT(*) as count FROM jobs WHERE is_active = 1 GROUP BY contract_type_id ORDER BY count DESC").all();

    return {
      jobs: {
        total: jobsStats?.total_jobs || 0,
        active: jobsStats?.active_jobs || 0,
        inactive: jobsStats?.inactive_jobs || 0,
        with_salary: jobsStats?.with_salary || 0,
        past_24h: jobsPast24hRes?.count || 0,
        by_source: bySource.results || [],
        by_region: byRegion.results || [],
        by_contract: byContract.results || [],
      },
      talents: {
        total: talentsStatsRes?.total_talents || 0,
        active: talentsStatsRes?.active_talents || 0,
        paused: talentsStatsRes?.paused_talents || 0,
        hired: talentsStatsRes?.hired_talents || 0,
        with_cv: talentsStatsRes?.with_cv || 0,
        total_views: talentsStatsRes?.total_views || 0,
        total_contacts: talentsStatsRes?.total_contacts_count || 0,
        recent: (recentTalentsRes.results || []).map(r => ({ ...r, tags: JSON.parse(r.tags_json || "[]") })),
      },
      contacts: {
        total: contactsStatsRes?.total_contacts || 0,
        past_7d: contactsStatsRes?.contacts_7d || 0,
        recent: recentContactsRes.results || [],
      },
      alerts: {
        total: alertsStatsRes?.total_alerts || 0,
        active: alertsStatsRes?.active_alerts || 0,
        daily: alertsStatsRes?.daily_alerts || 0,
        weekly: alertsStatsRes?.weekly_alerts || 0,
      },
      push: {
        total: pushStatsRes?.total_push || 0,
        active: pushStatsRes?.active_push || 0,
      },
      logs: recentLogsRes.results || [],
    };
  } catch (err) {
    console.error("Erreur getAdminDashboardMetrics D1 :", err);
    return null;
  }
}

/**
 * Récupère tous les talents pour l'admin avec pagination et filtres
 */
export async function getAllTalentsForAdmin(db, options = {}) {
  if (!db) return [];
  try {
    const limit = options.limit || 100;
    const status = options.status || "all";
    const search = (options.search || "").toLowerCase().trim();

    let sql = "SELECT * FROM talents";
    const params = [];
    const conditions = [];

    if (status !== "all") {
      conditions.push("status = ?");
      params.push(status);
    }
    if (search) {
      conditions.push("(LOWER(title) LIKE ? OR LOWER(email) LIKE ? OR LOWER(primary_stack) LIKE ?)");
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const { results } = await db.prepare(sql).bind(...params).all();
    return (results || []).map(r => ({ ...r, tags: JSON.parse(r.tags_json || "[]") }));
  } catch (err) {
    console.error("Erreur getAllTalentsForAdmin D1 :", err);
    return [];
  }
}

/**
 * Enregistre un clic sortant vers une offre
 */
export async function recordJobClick(db, { jobId, jobTitle, company, userType = "guest", userId = null, userEmail = null, referrer = null, tags = [] }) {
  if (!db || !jobId) return null;
  try {
    const res = await db.prepare(`
      INSERT INTO job_clicks (job_id, job_title, company, user_type, user_id, user_email, referrer, tags_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      jobId,
      jobTitle || "",
      company || "",
      userType || "guest",
      userId || null,
      userEmail || null,
      referrer || "",
      JSON.stringify(tags || [])
    ).run();

    return res?.meta?.last_row_id || null;
  } catch (err) {
    console.error("Erreur recordJobClick D1 :", err);
    return null;
  }
}

/**
 * Enregistre le feedback post-clic ('applied', 'viewing', 'dead_link')
 */
export async function recordJobFeedback(db, { clickId, jobId, feedback, talentToken, userEmail, notes }) {
  if (!db || !jobId) return { success: false };
  try {
    // 1. Mettre à jour le statut du clic si clickId fourni
    if (clickId) {
      await db.prepare("UPDATE job_clicks SET status = ? WHERE id = ?").bind(feedback, clickId).run();
    }

    // 2. Si talent connecté et a postulé, enregistrer dans talent_applications
    let talent = null;
    if (talentToken) {
      talent = await getTalentByToken(db, talentToken);
    } else if (userEmail) {
      const { results } = await db.prepare("SELECT * FROM talents WHERE email = ? LIMIT 1").bind(userEmail.toLowerCase().trim()).all();
      talent = results && results.length > 0 ? results[0] : null;
    }

    if (feedback === "applied" && talent) {
      // Récupérer les détails du job
      const job = await getJobById(db, jobId);
      const appId = `app_${talent.id}_${jobId}`;
      await db.prepare(`
        INSERT INTO talent_applications (id, talent_id, job_id, job_title, company, company_logo, job_url, salary, contract_type, region, tags_json, status, notes, applied_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(talent_id, job_id) DO UPDATE SET
          status = 'applied',
          notes = COALESCE(excluded.notes, talent_applications.notes),
          updated_at = CURRENT_TIMESTAMP
      `).bind(
        appId,
        talent.id,
        jobId,
        job?.title || "Poste Remote",
        job?.company || "Entreprise",
        job?.company_logo || "",
        job?.url || "",
        job?.salary || "",
        job?.contractType || job?.contract_type_label || "CDI / Full-time",
        job?.region || job?.region_label || "Worldwide",
        job?.tags_json || JSON.stringify(job?.tags || []),
        notes || ""
      ).run();
    }

    // 3. Si lien mort signalé
    if (feedback === "dead_link" || feedback === "reported_dead") {
      await reportDeadJob(db, { jobId, reason: "expired", details: notes || "Signalé via modale post-clic" });
    }

    return { success: true, savedToTalent: !!(feedback === "applied" && talent) };
  } catch (err) {
    console.error("Erreur recordJobFeedback D1 :", err);
    return { success: false, error: err.message };
  }
}

/**
 * Récupère toutes les candidatures d'un talent
 */
export async function getTalentApplications(db, talentId) {
  if (!db || !talentId) return [];
  try {
    const { results } = await db.prepare(`
      SELECT * FROM talent_applications WHERE talent_id = ? ORDER BY applied_at DESC
    `).bind(talentId).all();

    return (results || []).map(r => ({
      ...r,
      tags: JSON.parse(r.tags_json || "[]")
    }));
  } catch (err) {
    console.error("Erreur getTalentApplications D1 :", err);
    return [];
  }
}

/**
 * Met à jour le statut ou les notes d'une candidature
 */
export async function updateTalentApplicationStatus(db, talentId, jobId, status, notes = null) {
  if (!db || !talentId || !jobId) return false;
  try {
    if (notes !== null) {
      await db.prepare(`
        UPDATE talent_applications SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE talent_id = ? AND job_id = ?
      `).bind(status, notes, talentId, jobId).run();
    } else {
      await db.prepare(`
        UPDATE talent_applications SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE talent_id = ? AND job_id = ?
      `).bind(status, talentId, jobId).run();
    }
    return true;
  } catch (err) {
    console.error("Erreur updateTalentApplicationStatus D1 :", err);
    return false;
  }
}

/**
 * Supprime une candidature de la liste du talent
 */
export async function deleteTalentApplication(db, talentId, jobId) {
  if (!db || !talentId || !jobId) return false;
  try {
    await db.prepare("DELETE FROM talent_applications WHERE talent_id = ? AND job_id = ?").bind(talentId, jobId).run();
    return true;
  } catch (err) {
    console.error("Erreur deleteTalentApplication D1 :", err);
    return false;
  }
}

/**
 * Signale un lien mort ou expiré et auto-désactive les offres multi-signalées
 */
export async function reportDeadJob(db, { jobId, reason = "expired", details = "" }) {
  if (!db || !jobId) return false;
  try {
    await db.prepare(`
      INSERT INTO job_reports (job_id, reason, details) VALUES (?, ?, ?)
    `).bind(jobId, reason, details).run();

    // Auto-désactivation dès 2 signalements distincts pour protéger l'expérience candidat
    const countRes = await db.prepare("SELECT COUNT(*) as count FROM job_reports WHERE job_id = ?").bind(jobId).first();
    if (countRes && countRes.count >= 2) {
      await db.prepare("UPDATE jobs SET is_active = 0 WHERE id = ?").bind(jobId).run();
    }

    return true;
  } catch (err) {
    console.error("Erreur reportDeadJob D1 :", err);
    return false;
  }
}

/**
 * Récupère les métriques de tracking pour l'admin cockpit
 */
export async function getTrackingKpis(db) {
  if (!db) return null;
  try {
    const [clicksTotalRes, appliedTotalRes, topCompaniesRes, recentReportsRes] = await Promise.all([
      db.prepare("SELECT COUNT(*) as count FROM job_clicks").first(),
      db.prepare("SELECT COUNT(*) as count FROM job_clicks WHERE status = 'applied'").first(),
      db.prepare("SELECT company, COUNT(*) as clicks FROM job_clicks WHERE company != '' GROUP BY company ORDER BY clicks DESC LIMIT 5").all(),
      db.prepare("SELECT r.*, j.title, j.company, j.url FROM job_reports r LEFT JOIN jobs j ON r.job_id = j.id ORDER BY r.created_at DESC LIMIT 10").all()
    ]);

    const totalClicks = clicksTotalRes?.count || 0;
    const totalApplied = appliedTotalRes?.count || 0;
    const conversionRate = totalClicks > 0 ? Math.round((totalApplied / totalClicks) * 100) : 0;

    return {
      totalClicks,
      totalApplied,
      conversionRate,
      topCompanies: topCompaniesRes?.results || [],
      recentReports: recentReportsRes?.results || []
    };
  } catch (err) {
    console.error("Erreur getTrackingKpis D1 :", err);
    return null;
  }
}




