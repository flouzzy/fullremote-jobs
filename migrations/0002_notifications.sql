-- Migration 0002 : Système de Notifications Web Push & Alertes Email

-- 1. Table des alertes email personnalisées
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

-- 2. Table des abonnements Web Push navigateur
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

-- 3. Table des logs d'envoi de notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'email' ou 'push'
  recipient TEXT NOT NULL,
  subject_or_title TEXT,
  items_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  sent_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notif_logs_sent ON notification_logs(sent_at DESC);
