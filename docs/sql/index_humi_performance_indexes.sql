-- Índices de soporte para funciones batch de index_humi.
-- Ejecutar manualmente. En producción considerar CREATE INDEX CONCURRENTLY.

-- Populate: evitar Seq Scan al filtrar por "stale" (updated_at).
CREATE INDEX IF NOT EXISTS idx_index_humi_agent_history_updated_at
  ON index_humi.agent_history (updated_at);

CREATE INDEX IF NOT EXISTS idx_index_humi_agent_information_updated_at
  ON index_humi.agent_information (updated_at);

CREATE INDEX IF NOT EXISTS idx_index_humi_agent_measures_updated_at
  ON index_humi.agent_measures (updated_at);

CREATE INDEX IF NOT EXISTS idx_index_humi_agent_usage_updated_at
  ON index_humi.agent_usage (updated_at);

-- Pillars: evitar Seq Scan al filtrar por "stale" (calculated_at).
CREATE INDEX IF NOT EXISTS idx_index_humi_pillar_history_calculated_at
  ON index_humi.pillar_history (calculated_at);

-- Legacy (opcional si aún existe pillar_agent_history):
-- CREATE INDEX IF NOT EXISTS idx_index_humi_pillar_agent_history_calculated_at
--   ON index_humi.pillar_agent_history (calculated_at);

CREATE INDEX IF NOT EXISTS idx_index_humi_pillar_agent_information_calculated_at
  ON index_humi.pillar_agent_information (calculated_at);

-- Nota: existe un índice compuesto (agent_measure_id, calculated_at), pero este índice
-- ayuda a los filtros por fecha cuando el planner no usa el compuesto.
CREATE INDEX IF NOT EXISTS idx_index_humi_pillar_agent_measure_calculated_at
  ON index_humi.pillar_agent_measure (calculated_at);

-- Faltaban índices explícitos para pillar_agent_usage (solo hay UNIQUE/PK/FK en el schema).
CREATE INDEX IF NOT EXISTS idx_index_humi_pillar_agent_usage_agent_usage_id
  ON index_humi.pillar_agent_usage (agent_usage_id);

CREATE INDEX IF NOT EXISTS idx_index_humi_pillar_agent_usage_calculated_at
  ON index_humi.pillar_agent_usage (calculated_at);

