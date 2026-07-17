import type { SupabaseClient } from '@supabase/supabase-js';
import { requireActiveDashboardUser } from '@/lib/auth/require-active-subscription';
import { apiJsonResponse } from '@/lib/api/route-config';
import { enrichTop10AgentRows } from '@/lib/dashboardAgentLookup';
import type { DashboardChainRow } from '@/lib/dashboardChains';

export const dynamic = 'force-dynamic';

const CHAINS_SELECT =
  'id,name,short_name,updated_at,logo_file_name,agent_stats_information,statistics_agent_last_30_days,statistics_agent_monthly,humi_distribution,wami_distribution,metadata_distribution,best_10_agents_humi,owner_stats_information,technical_data_information,warning_stats_information,on_chain_stats_information';

function mapChainsStadisticsRow(row: Record<string, unknown>): DashboardChainRow {
  const { id, ...rest } = row;
  return {
    ...rest,
    chain_id: String(id ?? ''),
  } as DashboardChainRow;
}

async function loadOverview(db: SupabaseClient) {
  const [statsRes, chainsRes] = await Promise.all([
    db
      .schema('web_dashboard')
      .from('global_stadistics')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db.schema('web_dashboard').from('chains_stadistics').select(CHAINS_SELECT).order('name'),
  ]);

  return { statsRes, chainsRes };
}

export async function GET() {
  const auth = await requireActiveDashboardUser();
  if (!auth.ok) return auth.response;

  const { statsRes, chainsRes } = await loadOverview(auth.supabase);

  const details = {
    stats: statsRes.error?.message ?? null,
    statsCode: statsRes.error?.code ?? null,
    chains: chainsRes.error?.message ?? null,
    chainsCode: chainsRes.error?.code ?? null,
    hint:
      'Comprueba: global_stadistics y chains_stadistics en esquema web_dashboard, RLS SELECT para authenticated, y API > Exposed schemas incluye web_dashboard.',
  };

  if (statsRes.error || chainsRes.error) {
    console.error('[dashboard/overview]', details);
    return apiJsonResponse(
      {
        success: false,
        error: 'No se pudieron cargar los datos del dashboard',
        details,
      },
      { status: 500 },
    );
  }

  if (!statsRes.data) {
    console.error('[dashboard/overview] sin datos en global_stadistics', details);
    return apiJsonResponse(
      {
        success: false,
        error: 'sin_datos',
        details,
      },
      { status: 503 },
    );
  }

  const statsRecord = statsRes.data as Record<string, unknown>;
  const enrichedTop10 = await enrichTop10AgentRows(auth.supabase, statsRecord.top_10_agents);

  const chains = await Promise.all(
    (chainsRes.data ?? []).map(async (row) => {
      const mapped = mapChainsStadisticsRow(row as unknown as Record<string, unknown>);
      return {
        ...mapped,
        best_10_agents_humi: await enrichTop10AgentRows(
          auth.supabase,
          mapped.best_10_agents_humi,
        ),
      };
    }),
  );

  return apiJsonResponse({
    success: true,
    stats: { ...statsRecord, top_10_agents: enrichedTop10 },
    chains,
  });
}
