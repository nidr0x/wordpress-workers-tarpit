-- Extended Tarpit D1 schema
-- Create this database with: wrangler d1 create tarpit-logs
-- Apply with: wrangler d1 execute tarpit-logs --file=schema.sql

CREATE TABLE IF NOT EXISTS tarpit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  method TEXT DEFAULT 'GET',
  country TEXT DEFAULT 'XX',
  ip TEXT DEFAULT 'unknown',
  ua TEXT DEFAULT '',
  data TEXT DEFAULT '',
  ts DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tarpit_ts ON tarpit_log(ts);
CREATE INDEX IF NOT EXISTS idx_tarpit_site ON tarpit_log(site);
CREATE INDEX IF NOT EXISTS idx_tarpit_type ON tarpit_log(type);
CREATE INDEX IF NOT EXISTS idx_tarpit_ip ON tarpit_log(ip);
CREATE INDEX IF NOT EXISTS idx_tarpit_country ON tarpit_log(country);
