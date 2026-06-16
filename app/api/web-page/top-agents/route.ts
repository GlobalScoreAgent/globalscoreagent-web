import { apiJsonResponse } from '@/lib/api/route-config';
import { getSupabaseReadClient } from '@/lib/supabase/read';
import { parseTop10AgentsFromMv } from '@/lib/web-page/top-agents';
import {
  utcDateFromTimestamp,
  utcDayIso,
  type StatisticsSource,
} from '@/lib/web-page/statistics';

function resolveSource(calculatedAt: string): StatisticsSource {
  const rowDate = utcDateFromTimestamp(calculatedAt);
  if (rowDate === utcDayIso(0)) return 'today';
  if (rowDate === utcDayIso(1)) return 'yesterday';
  return 'latest';
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseReadClient();
  if (!supabase) {
    return apiJsonResponse(
      {
        success: false,
        error:
          'Supabase no configurado: define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY) en .env.local',
      },
      { status: 503 },
    );
  }

  try {
    const { data, error } = await supabase
      .schema('web_page')
      .from('global_score_agent_summary')
      .select('calculated_at, top_10_agents')
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('top_10_agents query:', error.message);
      return apiJsonResponse(
        {
          success: false,
          error: 'Error al cargar Top 10 agentes',
          details: { supabase: error.message },
        },
        { status: 500 },
      );
    }

    if (!data) {
      return apiJsonResponse(
        {
          success: false,
          error: 'No hay datos de Top 10 agentes',
          details: {
            hint: 'Refresca web_page.global_score_agent_summary y verifica la columna top_10_agents.',
          },
        },
        { status: 404 },
      );
    }

    const raw = data as { calculated_at: string; top_10_agents: unknown };
    const parsed = parseTop10AgentsFromMv(raw.top_10_agents);

    if (parsed.length === 0) {
      return apiJsonResponse(
        {
          success: false,
          error: 'Formato de top_10_agents inválido o vacío',
        },
        { status: 500 },
      );
    }

    const source = resolveSource(raw.calculated_at);
    const sourceDate = utcDateFromTimestamp(raw.calculated_at);

    return apiJsonResponse({
      success: true,
      source,
      sourceDate,
      lastUpdated: raw.calculated_at,
      data: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching top agents:', err);
    return apiJsonResponse(
      { success: false, error: 'Error al cargar Top 10 agentes', details: message },
      { status: 500 },
    );
  }
}
