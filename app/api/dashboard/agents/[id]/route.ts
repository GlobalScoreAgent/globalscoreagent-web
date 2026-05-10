import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { normalizeChainShortNameForMatch } from '@/lib/agentChains';

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const idParam = context.params.id;
    const numericId = parseInt(idParam, 10);
    if (!idParam || Number.isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid agent id' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: agent, error: agentError } = await supabase
      .schema('web_dashboard')
      .from('agents')
      .select(`
        id,
        name,
        description,
        image_url,
        web,
        email,
        has_duplicate_agent,
        is_dummy,
        current_humi_score,
        humi_score_filter,
        on_chain_id,
        chain_id,
        chain_name,
        wallet_chain_register,
        on_chain_created_at,
        owner_wallet,
        owner_since_at,
        owner_changes,
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
        nonce_current,
        balance_current,
        nonce_history,
        balance_history,
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
        agent_feedback_analysis
      `)
      .eq('id', numericId)
      .maybeSingle();

    if (agentError) {
      console.error('Agent detail fetch error:', agentError);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos', details: agentError.message },
        { status: 500 }
      );
    }

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    let chain_logo_file_name: string | null = null;

    const chainId = (agent as { chain_id?: number | null }).chain_id;
    if (chainId != null && !Number.isNaN(Number(chainId))) {
      const { data: byId } = await supabase
        .schema('web_dashboard')
        .from('chains')
        .select('logo_file_name')
        .eq('id', chainId)
        .maybeSingle();
      if (byId?.logo_file_name) {
        chain_logo_file_name = byId.logo_file_name;
      }
    }

    const matchName = !chain_logo_file_name
      ? normalizeChainShortNameForMatch(agent.chain_name)
      : null;
    if (!chain_logo_file_name && matchName) {
      const tryNames = Array.from(
        new Set([matchName, String(agent.chain_name).trim()].filter(Boolean))
      );
      for (const sn of tryNames) {
        const { data: chainExact } = await supabase
          .schema('web_dashboard')
          .from('chains')
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
          .from('chains')
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

    return NextResponse.json({
      data: {
        ...agent,
        chain_logo_file_name,
      },
    });
  } catch (err) {
    console.error('Agent detail API:', err);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 }
    );
  }
}
