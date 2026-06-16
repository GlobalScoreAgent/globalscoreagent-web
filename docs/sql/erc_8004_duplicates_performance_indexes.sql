-- Índices de soporte para agent_duplicates_processed / agent_valid_duplicates.
-- Ejecutar manualmente. En producción considerar CREATE INDEX CONCURRENTLY.
--
-- Requiere columnas materializadas: name_md5, description_md5, uri_raw_md5
-- (backfill: erc_8004_agents_md5_backfill.sql)
--
-- v2: INCLUDE (id) para array_agg / group-by sin heap fetch.
-- Test: EXPLAIN ANALYZE SELECT erc_8004.agent_duplicates_processed(150);

DROP INDEX IF EXISTS erc_8004.idx_agents_agent_uri_raw_md5;
DROP INDEX IF EXISTS erc_8004.idx_agents_name_desc_md5;
DROP INDEX IF EXISTS erc_8004.idx_agents_uri_raw_md5;
DROP INDEX IF EXISTS erc_8004.idx_agents_name_description_md5;

CREATE INDEX IF NOT EXISTS idx_agents_duplicate_calculate_at
  ON erc_8004.agents (duplicate_calculate_at ASC NULLS FIRST);

CREATE INDEX IF NOT EXISTS idx_agents_uri_raw_md5
  ON erc_8004.agents (uri_raw_md5)
  INCLUDE (id)
  WHERE uri_raw_md5 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_agents_name_description_md5
  ON erc_8004.agents (name_md5, description_md5)
  INCLUDE (id)
  WHERE name_md5 IS NOT NULL
    AND name <> 'Unnamed Agent'
    AND description IS NOT NULL
    AND length(trim(description)) > 10;
