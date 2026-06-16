-- Index for agent directory: filter by humi_madurity_level + sort by current_humi_score.
-- Fixes statement timeout (57014) on ~165k rows when using Index HUMI advanced filter.
-- Run manually in Supabase SQL editor. In production prefer CREATE INDEX CONCURRENTLY.
--
-- Typical API query:
--   WHERE humi_madurity_level = 'Elite'
--   ORDER BY current_humi_score ASC|DESC NULLS LAST
--   LIMIT 10 OFFSET N
--
-- Verify with:
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT id FROM web_dashboard.agents
-- WHERE humi_madurity_level = 'Elite'
-- ORDER BY current_humi_score ASC NULLS LAST
-- LIMIT 10;

CREATE INDEX IF NOT EXISTS idx_agents_humi_madurity_level_score_asc
  ON web_dashboard.agents (humi_madurity_level, current_humi_score ASC NULLS LAST)
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_agents_humi_madurity_level_score_desc
  ON web_dashboard.agents (humi_madurity_level, current_humi_score DESC NULLS LAST)
  TABLESPACE pg_default;

-- Supports equality lookups on humi_madurity_level alone (planner may use composite prefix).
CREATE INDEX IF NOT EXISTS idx_agents_humi_madurity_level
  ON web_dashboard.agents (humi_madurity_level)
  TABLESPACE pg_default;

-- Partial indexes for "Not calculate" (humi_madurity_level IS NULL) + sort by score.
-- Lets Postgres read only the first LIMIT rows from the index instead of sorting ~165k NULLs.
CREATE INDEX IF NOT EXISTS idx_agents_humi_madurity_null_score_asc
  ON web_dashboard.agents (current_humi_score ASC NULLS LAST, id)
  WHERE humi_madurity_level IS NULL
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_agents_humi_madurity_null_score_desc
  ON web_dashboard.agents (current_humi_score DESC NULLS LAST, id)
  WHERE humi_madurity_level IS NULL
  TABLESPACE pg_default;

-- Optional: normalize literal "not calculated" strings so IS NULL filter is complete.
-- UPDATE web_dashboard.agents
-- SET humi_madurity_level = NULL
-- WHERE humi_madurity_level IN ('Not calculate', 'Not Calculated', 'Not calculated');
