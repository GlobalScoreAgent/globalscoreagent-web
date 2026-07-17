-- AI Categories advanced filter: equality on ai_category_primary + sort by current_humi_score.
-- Also opens authenticated read on agent_ai_categories (catalog for the filter UI).
-- Prefer CREATE INDEX CONCURRENTLY in production if the table is large and live.
--
-- Typical API query:
--   WHERE ai_category_primary = 'Trading Bots'
--   ORDER BY current_humi_score DESC NULLS LAST
--   LIMIT 10 OFFSET N

GRANT SELECT ON web_dashboard.agent_ai_categories TO authenticated;

DROP POLICY IF EXISTS "authenticated read agent_ai_categories" ON web_dashboard.agent_ai_categories;
CREATE POLICY "authenticated read agent_ai_categories"
  ON web_dashboard.agent_ai_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_agents_ai_category_primary
  ON web_dashboard.agents (ai_category_primary)
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_agents_ai_category_primary_score_desc
  ON web_dashboard.agents (ai_category_primary, current_humi_score DESC NULLS LAST)
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_agents_ai_category_primary_score_asc
  ON web_dashboard.agents (ai_category_primary, current_humi_score ASC NULLS LAST)
  TABLESPACE pg_default;
