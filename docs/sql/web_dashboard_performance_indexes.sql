-- Índices de soporte para funciones batch de web_dashboard.
-- Ejecutar manualmente. En producción considerar CREATE INDEX CONCURRENTLY.

CREATE INDEX IF NOT EXISTS idx_web_agents_updated_at
  ON web_dashboard.agents (updated_at);

CREATE INDEX IF NOT EXISTS idx_web_index_humi_updated_at
  ON web_dashboard.index_humi (updated_at);

CREATE INDEX IF NOT EXISTS idx_web_index_wami_updated_at
  ON web_dashboard.index_wami (updated_at);

CREATE INDEX IF NOT EXISTS idx_web_chains_updated_at
  ON web_dashboard.chains (updated_at);

CREATE INDEX IF NOT EXISTS idx_chain_stats_tracking_chain_stats_at
  ON erc_8004.chain_stats_tracking (chain_id, stats_at DESC);

CREATE INDEX IF NOT EXISTS idx_registrations_chain_agent
  ON erc_8004.registrations (chain_id, agent_id);

CREATE INDEX IF NOT EXISTS idx_index_humi_agent_calculated_at
  ON index_humi.index_humi_agent (calculated_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_index_wami_chain_id
  ON index_wami.index_wami (chain_id);

CREATE INDEX IF NOT EXISTS idx_agents_executive_summary_humi_produced_at
  ON web_dashboard.agents (executive_summary_humi_produced_at NULLS FIRST);
