-- Indexes for web_dashboard.agents: is_dummy list queries & optional services JSONB
-- Run manually in Supabase SQL editor or via migration pipeline.
-- Verify with: EXPLAIN (ANALYZE, BUFFERS) on the API's typical query.

-- Equality filter on is_dummy (may already exist as idx_agents_is_dummy)
CREATE INDEX IF NOT EXISTS idx_agents_is_dummy
  ON web_dashboard.agents
  USING btree (is_dummy)
  TABLESPACE pg_default;

-- Aligns with default directory sort: WHERE is_dummy = ? ORDER BY current_humi_score DESC
-- Helps when many rows match is_dummy and sorting was dominating query time (statement timeout).
CREATE INDEX IF NOT EXISTS idx_agents_is_dummy_current_humi_score
  ON web_dashboard.agents (is_dummy, current_humi_score DESC NULLS LAST)
  TABLESPACE pg_default;

-- Optional: if EXPLAIN shows slow bitmap scans on services @> [...] containment, add:
-- CREATE INDEX IF NOT EXISTS idx_agents_services_gin
--   ON web_dashboard.agents USING gin (services jsonb_path_ops);
