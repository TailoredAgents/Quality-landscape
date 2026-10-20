BEGIN;
CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash text PRIMARY KEY,
  credential_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions(expires_at);
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY,
  name text NOT NULL, phone text NOT NULL, email text NOT NULL,
  service text NOT NULL, location text NOT NULL, message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','scheduled','closed')),
  notification_status text NOT NULL DEFAULT 'not_configured' CHECK (notification_status IN ('not_configured','pending','sent','failed')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inquiries_created_idx ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries(status,created_at DESC);
CREATE TABLE IF NOT EXISTS analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('pageview','conversion','engagement')),
  path text NOT NULL,
  visitor_hash text, session_hash text,
  source text NOT NULL DEFAULT 'Direct',
  utm_source text, utm_medium text, utm_campaign text,
  device text NOT NULL CHECK (device IN ('mobile','tablet','desktop','unknown')),
  duration integer CHECK (duration BETWEEN 0 AND 1800),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_created_kind_idx ON analytics_events(created_at,kind);
CREATE INDEX IF NOT EXISTS events_session_created_idx ON analytics_events(session_hash,created_at);
CREATE INDEX IF NOT EXISTS events_visitor_created_idx ON analytics_events(visitor_hash,created_at);
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket text PRIMARY KEY, hits integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_expiry_idx ON rate_limits(expires_at);
INSERT INTO schema_migrations(version) VALUES (1) ON CONFLICT DO NOTHING;
COMMIT;
