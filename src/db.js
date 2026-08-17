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
    `);
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
    limit = 100,
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

