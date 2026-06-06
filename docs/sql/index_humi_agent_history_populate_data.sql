-- Optimizado: JOIN en owner_details_agg y sin ::DATE en filtros.
-- Test: EXPLAIN ANALYZE SELECT index_humi.agent_history_populate_data(10);

CREATE OR REPLACE FUNCTION index_humi.agent_history_populate_data(p_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_processed_count integer;
BEGIN
    WITH target_agents AS (
        SELECT 
            a.id              AS agent_id,
            a.owner_wallet_id AS owner_id,
            a.owner_since_at,
            a.owner_changes,
            r.on_chain_created_at,
            1                AS source_id
        FROM erc_8004.agents a
        JOIN erc_8004.agent_profiles ap ON a.id = ap.agent_id
        JOIN erc_8004.registrations r   ON r.agent_id = a.id
        LEFT JOIN index_humi.agent_history ah ON a.id = ah.agent_id
        WHERE ap.source = 'definitive'
          AND (ah.agent_id IS NULL OR ah.updated_at < CURRENT_DATE::timestamptz)
          AND a.owner_wallet_id IS NOT NULL
        ORDER BY ah.updated_at ASC NULLS FIRST
        LIMIT p_limit
    ),
    owner_details_agg AS (
        SELECT 
            wod.wallet_id,
            MIN(wod.first_transaction_at) AS wallet_created_at,
            jsonb_agg(
                jsonb_build_object(
                    'chain_id',  wod.chain_id,
                    'chain_name', c.name,
                    'first_transaction_at', wod.first_transaction_at,
                    'current_nonce', wod.current_nonce,
                    'wallet_type',  wod.wallet_type
                )
            ) AS owner_chains
        FROM erc_8004.wallet_owner_details wod
        JOIN erc_8004.chains c ON wod.chain_id = c.id
        JOIN target_agents ta  ON wod.wallet_id = ta.owner_id
        GROUP BY wod.wallet_id
    )
    INSERT INTO index_humi.agent_history (
        source_id,
        agent_id,
        owner_id,
        owner_wallet_first_transaction_at,
        owner_wallet_chain_information,
        last_owner_agent_since_at,
        owner_changes,
        owner_portafolio_agent_total,
        owner_portafolio_agent_active_total,
        owner_portafolio_agent_agent_metadata_richness,
        owner_portafolio_agents_metadata_services,
        owner_portafolio_agent_external_audits,
        owner_portafolio_agent_warnings,
        owner_portafolio_agent_current_nonce_balance_wallets,
        owner_portafolio_agent_delta_nonce_balance_wallets,
        owner_portafolio_agent_attestations,
        owner_portafolio_agent_identity_analysis,
        owner_portafolio_agent_on_chain_executions,
        owner_portafolio_agent_activity_protocols,
        agent_created_at,
        created_at,
        updated_at
    )
    SELECT 
        t.source_id,
        t.agent_id,
        t.owner_id,
        od.wallet_created_at,
        od.owner_chains,
        t.owner_since_at,
        t.owner_changes,
        op.agents_totals,
        op.agents_active_totals,
        op.agents_metadata,
        op.agents_realness,
        op.agents_analysis_external_audit,
        op.agents_warnings,
        op.agents_activity_wallet_tx,
        op.agents_activity_delta,
        op.agents_analysis_attestation,
        op.agents_analysis_identity,
        op.agents_activity_on_chain_executions,
        op.agents_activity_protocols,
        t.on_chain_created_at,
        now(),
        now()
    FROM target_agents t
    LEFT JOIN owner_details_agg od       ON t.owner_id = od.wallet_id
    LEFT JOIN erc_8004.owner_portfolios op ON t.owner_id = op.owner_id
    ON CONFLICT (agent_id) DO UPDATE SET
        owner_id                                   = EXCLUDED.owner_id,
        owner_wallet_first_transaction_at         = EXCLUDED.owner_wallet_first_transaction_at,
        owner_wallet_chain_information            = EXCLUDED.owner_wallet_chain_information,
        last_owner_agent_since_at                 = EXCLUDED.last_owner_agent_since_at,
        owner_changes                              = EXCLUDED.owner_changes,
        owner_portafolio_agent_total              = EXCLUDED.owner_portafolio_agent_total,
        owner_portafolio_agent_active_total       = EXCLUDED.owner_portafolio_agent_active_total,
        owner_portafolio_agent_agent_metadata_richness = EXCLUDED.owner_portafolio_agent_agent_metadata_richness,
        owner_portafolio_agents_metadata_services = EXCLUDED.owner_portafolio_agents_metadata_services,
        owner_portafolio_agent_external_audits    = EXCLUDED.owner_portafolio_agent_external_audits,
        owner_portafolio_agent_warnings           = EXCLUDED.owner_portafolio_agent_warnings,
        owner_portafolio_agent_current_nonce_balance_wallets = EXCLUDED.owner_portafolio_agent_current_nonce_balance_wallets,
        owner_portafolio_agent_delta_nonce_balance_wallets   = EXCLUDED.owner_portafolio_agent_delta_nonce_balance_wallets,
        owner_portafolio_agent_attestations       = EXCLUDED.owner_portafolio_agent_attestations,
        owner_portafolio_agent_identity_analysis  = EXCLUDED.owner_portafolio_agent_identity_analysis,
        owner_portafolio_agent_on_chain_executions = EXCLUDED.owner_portafolio_agent_on_chain_executions,
        owner_portafolio_agent_activity_protocols = EXCLUDED.owner_portafolio_agent_activity_protocols,
        agent_created_at                          = EXCLUDED.agent_created_at,
        updated_at                                = now();

    GET DIAGNOSTICS v_processed_count = ROW_COUNT;
    RETURN jsonb_build_object('status', 'success', 'records_processed', v_processed_count);
END;
$$;

