import type { SupabaseClient } from '@supabase/supabase-js';
import { apiJsonResponse } from '@/lib/api/route-config';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

const CHAINS_SELECT =
  'chain_id,name,short_name,updated_at,logo_file_name,agent_stats_information,statistics_agent_last_30_days,statistics_agent_monthly,humi_distribution,wami_distribution,metadata_distribution,best_10_agents_humi,owner_stats_information,technical_data_information,warning_stats_information,on_chain_stats_information';

async function loadOverview(db: SupabaseClient) {
  const [statsRes, chainsRes] = await Promise.all([
    db
      .schema('web_dashboard')
      .from('main_stadistics')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db.schema('web_dashboard').from('chains').select(CHAINS_SELECT).order('name'),
  ]);

  return { statsRes, chainsRes };
}

export async function GET() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return apiJsonResponse({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  let statsRes;
  let chainsRes;
  let dataSource: 'session' | 'service_role' = 'session';

  const admin = getSupabaseAdmin();
  if (admin) {
    ({ statsRes, chainsRes } = await loadOverview(admin));
    dataSource = 'service_role';
  } else {
    ({ statsRes, chainsRes } = await loadOverview(authClient));
  }

  if (statsRes.error || chainsRes.error) {
    const retryClient = dataSource === 'service_role' ? authClient : admin;
    if (retryClient) {
      ({ statsRes, chainsRes } = await loadOverview(retryClient));
      dataSource = dataSource === 'service_role' ? 'session' : 'service_role';
    }
  }

  const details = {
    dataSource,
    stats: statsRes.error?.message ?? null,
    statsCode: statsRes.error?.code ?? null,
    chains: chainsRes.error?.message ?? null,
    chainsCode: chainsRes.error?.code ?? null,
    hint:
      'Comprueba: Database > Tables en esquema web_dashboard (no Auth > Policies), RLS SELECT para authenticated, y API > Exposed schemas incluye web_dashboard.',
  };

  console.error('[dashboard/overview]', details);

  if (statsRes.error && chainsRes.error) {
    return apiJsonResponse(
      {
        success: false,
        error: 'No se pudieron cargar los datos del dashboard',
        details,
      },
      { status: 500 },
    );
  }

  return apiJsonResponse({
    success: true,
    stats: statsRes.data ?? null,
    chains: chainsRes.data ?? [],
    statsError: statsRes.error?.message ?? null,
    chainsError: chainsRes.error?.message ?? null,
    dataSource,
  });
}
