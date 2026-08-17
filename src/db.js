/**
 * FullRemote-Jobs - Cloudflare D1 Database Helper
 */

/**
 * Initialise le schéma D1 si la table n'existe pas encore
 */
export async function initDb(db) {
  if (!db) return;
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
          job.id,
          job.title,
          job.company,
          job.company_logo || "",
          job.url,
          job.category,
          job.categoryId,
          job.categoryIcon || "💼",
          job.contractTypeId || "cdi_fulltime",
          job.contractType || "CDI / Full-time",
          job.contractIcon || "💼",
          JSON.stringify(job.tags || []),
          job.job_type || "Full-time",
          job.location || "Worldwide",
          job.regionId,
          job.region,
          job.regionFlag || "🌍",
          job.salary || "",
          job.salary_min || 0,
          job.salary_max || 0,
          job.currency || "",
          job.description_snippet || "",
          job.source,
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
      tags: JSON.parse(row.tags_json || "[]"),
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
