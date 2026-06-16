-- Índices de soporte para agent_manifest_agent_profile / _single.
-- Ejecutar manualmente. En producción considerar CREATE INDEX CONCURRENTLY.
--
-- Pre-check duplicados antes del UNIQUE en wallet_updates:
-- SELECT agent_id, wallet_address, type, COUNT(*)
-- FROM erc_8004.wallet_updates
-- GROUP BY 1, 2, 3 HAVING COUNT(*) > 1;

-- Pendientes del orquestador (erc-8004 / erc-8004-did)
CREATE INDEX IF NOT EXISTS idx_agent_manifest_profile_pending
  ON erc_8004.agent_manifest (agent_id, provider)
  WHERE COALESCE(is_processed, false) = false
    AND COALESCE(is_processed_with_error, false) = false
    AND COALESCE(has_download_error, false) = false
    AND provider IN ('erc-8004', 'erc-8004-did');

CREATE INDEX IF NOT EXISTS idx_agent_manifest_agent_id
  ON erc_8004.agent_manifest (agent_id);

-- Subconsultas escalares de fechas on-chain (evita JOIN cartesiano multichain)
CREATE INDEX IF NOT EXISTS idx_registrations_agent_id_updated
  ON erc_8004.registrations (agent_id, on_chain_updated_at DESC);

-- Habilita ON CONFLICT real en wallet_updates desde _single
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_updates_agent_address_type
  ON erc_8004.wallet_updates (agent_id, wallet_address, type);
