-- Migration initiale : Création de la table des offres avec types de contrats et logs
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

-- Index pour accélérer les requêtes de filtrage et de tri
CREATE INDEX IF NOT EXISTS idx_jobs_region ON jobs(region_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_contract ON jobs(contract_type_id);
CREATE INDEX IF NOT EXISTS idx_jobs_language ON jobs(language);
CREATE INDEX IF NOT EXISTS idx_jobs_published ON jobs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);

-- Table des logs d'exécution des crons d'ingestion
CREATE TABLE IF NOT EXISTS ingestion_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  executed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  jobs_found INTEGER,
  jobs_saved INTEGER,
  duration_ms INTEGER,
  status TEXT
);
