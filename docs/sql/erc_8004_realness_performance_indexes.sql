-- Índices de soporte para agent_realness_processed.
-- Ejecutar manualmente. En producción considerar CREATE INDEX CONCURRENTLY.
--
-- Requiere columnas md5 (backfill: erc_8004_agents_md5_backfill.sql).
-- idx_agents_name_description_md5 se crea en erc_8004_duplicates_performance_indexes.sql
-- y también acelera los CTEs name_dups / desc_dups de realness.
--
-- Test: EXPLAIN ANALYZE SELECT erc_8004.agent_realness_processed(10);

-- Batch: agentes pendientes de realness
CREATE INDEX IF NOT EXISTS idx_agents_pending_realness
  ON erc_8004.agents (validation_realness_calculated_at ASC NULLS FIRST, id)
  WHERE is_pending_realness_process = true;

-- EXISTS registration activa por agent_id
CREATE INDEX IF NOT EXISTS idx_registrations_agent_active
  ON erc_8004.registrations (agent_id)
  WHERE is_registration_active = true;

-- Histórico realness por agente
CREATE INDEX IF NOT EXISTS idx_agent_realness_agent_calculated
  ON erc_8004.agent_realness (agent_id, calculate_at DESC);

-- Dup detection por name_md5 (si no existe ya por script de duplicados)
CREATE INDEX IF NOT EXISTS idx_agents_name_md5
  ON erc_8004.agents (name_md5)
  WHERE name_md5 IS NOT NULL;

-- Dup detection por description_md5
CREATE INDEX IF NOT EXISTS idx_agents_description_md5
  ON erc_8004.agents (description_md5)
  WHERE description IS NOT NULL;
