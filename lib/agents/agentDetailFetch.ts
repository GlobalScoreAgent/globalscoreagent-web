import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeChainShortNameForMatch } from '@/lib/agentChains';
import { resolveChainLogoFileName } from '@/lib/chainPublicLogo';
import {
  fetchAgentByRouteId,
  resolveWebAgentPk,
  type AgentRouteLookupBy,
} from '@/lib/dashboardAgentLookup';
import {
  normalizeAgentHumiMaturity,
  normalizeAgentHumiScore,
} from '@/lib/agentHumiDisplay';

export const AGENT_DETAIL_SELECT = `
        id,
        agent_id,
        name,
        description,
        image_url,
        web,
        email,
        current_humi_score,
        humi_madurity_level,
        current_wami_score,
        wami_madurity_level,
        on_chain_id,
        chain_id,
        chain_name,
        wallet_chain_register,
        on_chain_created_at,
        owner_wallet,
        owner_since_at,
        owner_changes,
        owner_wallet_details,
        gobernance_type,
        profiles,
        has_x402,
        skills,
        supported_trust,
        capabilites,
        tags,
        oasf_skills,
        oasf_domains,
        technical_tools,
        technical_prompts,
        technical_capabilities,
        services,
        wallet_wami_score_details,
        has_comments,
        comments_summary,
        has_attestations,
        attestations_summary,
        has_external_audit,
        external_audit_summary,
        has_identity_analysis,
        identity_analysis_summary,
        has_on_chain_executions,
        on_chain_execution_summary,
        has_on_chain_feedbacks,
        on_chain_feedback_summary,
        has_protocol_activity,
        protocol_activity_summary,
        metadata_richness_score,
        metadata_richness_information,
        agent_warnings,
        realness_score,
        realness_status,
        ai_category_primary,
        ai_category_secondary,
        ai_category_confidence,
        ai_category_purpose
      `;

export const INDEX_HUMI_SELECT = `
        humi_score,
        madurity_level,
        current_humi_score_calculated_at,
        humi_score_last_30_days,
        humi_score_tracking,
        pillar_history_score,
        pillar_history_summary,
        pillar_usage_score,
        pillar_usage_summary,
        pillar_measure_score,
        pillar_measure_summary,
        pillar_information_score,
        pillar_information_summary,
        pillar_history_score_last_30_days,
        pillar_history_score_tracking,
        pillar_information_score_last_30_days,
        pillar_information_score_tracking,
        pillar_measure_score_last_30_days,
        pillar_measure_score_tracking,
        pillar_usage_score_last_30_days,
        pillar_usage_score_tracking
      `;

export const INDEX_WAMI_SELECT = `
        wami_score,
        maturity_level,
        wami_score_calculated_at,
        wami_score_last_30_days,
        wami_score_tracking,
        pillar_origins_legitimacy_score,
        pillar_origins_legitimacy_summary,
        pillar_origins_legitimacy_last_30_days,
        pillar_origins_legitimacy_tracking,
        pillar_portfolio_quality_score,
        pillar_portfolio_quality_summary,
        pillar_portfolio_quality_last_30_days,
        pillar_portfolio_quality_tracking,
        pillar_activity_behavior_score,
        pillar_activity_behavior_summary,
        pillar_activity_behavior_last_30_days,
        pillar_activity_behavior_tracking,
        pillar_multi_chain_presence_maturity_score,
        pillar_multi_chain_presence_maturity_summary,
        pillar_multi_chain_presence_maturity_last_30_days,
        pillar_multi_chain_presence_maturity_tracking,
        wallets,
        wami_score_data,
        pillar_origins_legitimacy_score_data,
        pillar_portfolio_quality_score_data,
        pillar_activity_behavior_score_data,
        pillar_multi_chain_presence_maturity_score_data,
        maturity_level_data
      `;

async function resolveChainLogoForAgent(
  supabase: SupabaseClient,
  agent: Record<string, unknown>,
): Promise<string | null> {
  let chain_logo_file_name: string | null = null;

  const chainId = agent.chain_id;
  if (chainId != null && !Number.isNaN(Number(chainId))) {
    const { data: byId } = await supabase
      .schema('web_dashboard')
      .from('chains_stadistics')
      .select('logo_file_name')
      .eq('id', chainId)
      .maybeSingle();
    if (byId?.logo_file_name) {
      chain_logo_file_name = byId.logo_file_name;
    }
  }

  const matchName = !chain_logo_file_name
    ? normalizeChainShortNameForMatch(
        typeof agent.chain_name === 'string' ? agent.chain_name : null,
      )
    : null;
  if (!chain_logo_file_name && matchName) {
    const tryNames = Array.from(
      new Set([matchName, String(agent.chain_name).trim()].filter(Boolean)),
    );
    for (const sn of tryNames) {
      const { data: chainExact } = await supabase
        .schema('web_dashboard')
        .from('chains_stadistics')
        .select('logo_file_name')
        .eq('short_name', sn)
        .limit(1)
        .maybeSingle();
      if (chainExact?.logo_file_name) {
        chain_logo_file_name = chainExact.logo_file_name;
        break;
      }
      const { data: chainCi } = await supabase
        .schema('web_dashboard')
        .from('chains_stadistics')
        .select('logo_file_name')
        .ilike('short_name', sn)
        .limit(1)
        .maybeSingle();
      if (chainCi?.logo_file_name) {
        chain_logo_file_name = chainCi.logo_file_name;
        break;
      }
    }
  }

  return resolveChainLogoFileName(
    chain_logo_file_name,
    typeof agent.chain_name === 'string' ? agent.chain_name : null,
  );
}

export async function fetchAgentDetail(
  supabase: SupabaseClient,
  numericId: number,
  lookupBy: AgentRouteLookupBy,
): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; status: 404 | 500; error: string; details?: string }
> {
  const { data: agent, error: agentError } = await fetchAgentByRouteId(
    supabase,
    numericId,
    AGENT_DETAIL_SELECT,
    lookupBy,
  );

  if (agentError) {
    return {
      ok: false,
      status: 500,
      error: 'Error al consultar la base de datos',
      details: agentError.message,
    };
  }

  if (!agent) {
    return { ok: false, status: 404, error: 'Agent not found' };
  }

  const resolvedChainLogo = await resolveChainLogoForAgent(supabase, agent);

  const ercAgentId =
    agent.agent_id != null && Number.isFinite(Number(agent.agent_id))
      ? Number(agent.agent_id)
      : null;

  let walletActivity: Record<string, unknown> | null = null;
  if (ercAgentId != null) {
    const { data: activityRow, error: activityError } = await supabase
      .schema('web_dashboard')
      .from('agent_wallet_activity')
      .select(
        'nonce_current, balance_data, nonce_last_30_days, balance_last_30_days, transactional_wallets, calculated_at',
      )
      .eq('agent_id', ercAgentId)
      .maybeSingle();

    if (activityError) {
      return {
        ok: false,
        status: 500,
        error: 'Error al consultar la base de datos',
        details: activityError.message,
      };
    }

    if (activityRow) {
      walletActivity = activityRow as Record<string, unknown>;
    }
  }

  return {
    ok: true,
    data: {
      ...agent,
      current_humi_score: normalizeAgentHumiScore(agent.current_humi_score),
      humi_madurity_level: normalizeAgentHumiMaturity(agent.humi_madurity_level),
      current_wami_score: normalizeAgentHumiScore(agent.current_wami_score),
      wami_madurity_level: normalizeAgentHumiMaturity(agent.wami_madurity_level),
      chain_logo_file_name: resolvedChainLogo,
      wallet_activity: walletActivity,
    },
  };
}

export async function fetchAgentHumiIndex(
  supabase: SupabaseClient,
  numericId: number,
  lookupBy: AgentRouteLookupBy,
): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; status: 404 | 500; error: string; details?: string }
> {
  const { webAgentId } = await resolveWebAgentPk(supabase, numericId, lookupBy);

  if (webAgentId == null) {
    return { ok: false, status: 404, error: 'Agent not found' };
  }

  const { data, error } = await supabase
    .schema('web_dashboard')
    .from('index_humi_live')
    .select(INDEX_HUMI_SELECT)
    .eq('agent_id', webAgentId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      status: 500,
      error: 'Error al consultar la base de datos',
      details: error.message,
    };
  }

  if (!data) {
    return { ok: false, status: 404, error: 'Index HUMI not found' };
  }

  return { ok: true, data: data as Record<string, unknown> };
}

export async function fetchAgentWamiIndex(
  supabase: SupabaseClient,
  numericId: number,
  lookupBy: AgentRouteLookupBy,
): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; status: 404 | 500; error: string; details?: string }
> {
  const { webAgentId } = await resolveWebAgentPk(supabase, numericId, lookupBy);

  if (webAgentId == null) {
    return { ok: false, status: 404, error: 'Agent not found' };
  }

  const { data, error } = await supabase
    .schema('web_dashboard')
    .from('index_wami')
    .select(INDEX_WAMI_SELECT)
    .eq('agent_id', webAgentId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      status: 500,
      error: 'Error al consultar la base de datos',
      details: error.message,
    };
  }

  if (!data) {
    return { ok: false, status: 404, error: 'Index WAMI not found' };
  }

  return { ok: true, data: data as Record<string, unknown> };
}
