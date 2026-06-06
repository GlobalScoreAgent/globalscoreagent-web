-- Índices de soporte para funciones batch de index_wami.
-- Ejecutar manualmente. En producción considerar CREATE INDEX CONCURRENTLY.

CREATE INDEX IF NOT EXISTS idx_pillar_origins_calculated_at
  ON index_wami.pillar_origins_legitimacy (calculated_at);

CREATE INDEX IF NOT EXISTS idx_pillar_quality_calculated_at
  ON index_wami.pillar_quality (calculated_at);

CREATE INDEX IF NOT EXISTS idx_pillar_activity_calculated_at
  ON index_wami.pillar_activity_behavior (calculated_at);

CREATE INDEX IF NOT EXISTS idx_pillar_multichain_calculated_at
  ON index_wami.pillar_multi_chain_presence_maturity (calculated_at);

CREATE INDEX IF NOT EXISTS idx_index_wami_calculated_at
  ON index_wami.index_wami (calculated_at);

CREATE INDEX IF NOT EXISTS idx_wallet_portafolio_details_portfolio_id
  ON walcert.wallet_portafolio_details (wallet_portafolio_id);

CREATE INDEX IF NOT EXISTS idx_wallet_cohort_percentiles_lookup
  ON index_wami.wallet_cohort_percentiles (wallet_id, metric_name, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallets_agent_transactional_count
  ON erc_8004.wallets (agent_transactional_count)
  WHERE agent_transactional_count > 0;
