import { NextRequest } from 'next/server';
import { apiJsonResponse } from '@/lib/api/route-config';
import { getSupabaseReadClient } from '@/lib/supabase/read';
import {
  getStatisticsColumn,
  parseHumiPageKpi,
  parseMainPageKpi,
  parseWamiPageKpi,
  utcDateFromTimestamp,
  utcDayIso,
  type HumiPageKpi,
  type MainPageKpi,
  type StatisticsPage,
  type StatisticsSource,
  type WamiPageKpi,
} from '@/lib/web-page/statistics';

const VALID_PAGES: StatisticsPage[] = ['main', 'humi', 'wami'];

const IMPLEMENTED_PAGES: StatisticsPage[] = ['main', 'humi', 'wami'];

type StatisticsRow = {
  calculated_at: string;
  payload: unknown;
};

type PageParser = (payload: unknown) => MainPageKpi | HumiPageKpi | WamiPageKpi | null;

const PAGE_PARSERS: Record<StatisticsPage, PageParser> = {
  main: parseMainPageKpi,
  humi: parseHumiPageKpi,
  wami: parseWamiPageKpi,
};

const PAGE_FORMAT_HINTS: Record<StatisticsPage, string> = {
  main: 'main_page_kpi (last_updated, active_chains, global_totals, top_*)',
  humi: 'humi_page_kpi (best_agent, distribution, total_agents_analysed, avg_top_100)',
  wami: 'wami_page_kpi (wallet_analysed, nonce_*, distribution, wallet_categories, wallet_link_*)',
};

function resolveSource(calculatedAt: string): StatisticsSource {
  const rowDate = utcDateFromTimestamp(calculatedAt);
  if (rowDate === utcDayIso(0)) return 'today';
  if (rowDate === utcDayIso(1)) return 'yesterday';
  return 'latest';
}

async function fetchLatestSummaryRow(page: StatisticsPage) {
  const column = getStatisticsColumn(page);
  const supabase = getSupabaseReadClient();
  if (!supabase) return { row: null as StatisticsRow | null, dbError: 'no client', column };

  const { data, error } = await supabase
    .schema('web_page')
    .from('global_score_agent_summary')
    .select(`calculated_at, ${column}`)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('global_score_agent_summary query:', error.message);
    return { row: null, dbError: error.message, column };
  }
  if (!data) return { row: null, dbError: null, column };

  const raw = data as unknown as Record<string, unknown>;
  const payload = raw[column];
  if (PAGE_PARSERS[page](payload) === null) {
    return { row: null, dbError: null, column };
  }

  return {
    row: {
      calculated_at: raw.calculated_at as string,
      payload,
    },
    dbError: null,
    column,
  };
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseReadClient();
  if (!supabase) {
    return apiJsonResponse(
      {
        success: false,
        error:
          'Supabase no configurado: define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY) en .env.local',
      },
      { status: 503 }
    );
  }

  const pageParam = request.nextUrl.searchParams.get('page') ?? 'main';
  if (!VALID_PAGES.includes(pageParam as StatisticsPage)) {
    return apiJsonResponse(
      { success: false, error: 'Parámetro page inválido' },
      { status: 400 }
    );
  }

  const page = pageParam as StatisticsPage;

  if (!IMPLEMENTED_PAGES.includes(page)) {
    return apiJsonResponse(
      {
        success: false,
        error: `KPIs para "${page}" aún no implementados`,
      },
      { status: 501 }
    );
  }

  try {
    const { row, dbError, column } = await fetchLatestSummaryRow(page);

    if (!row) {
      return apiJsonResponse(
        {
          success: false,
          error: `No hay estadísticas válidas para ${page}`,
          details: dbError
            ? { supabase: dbError, hint: 'Ejecuta docs/supabase-web-page-grants.sql en Supabase' }
            : {
                hint: `La MV no devolvió filas válidas con formato ${PAGE_FORMAT_HINTS[page]}. Refresca web_page.global_score_agent_summary.`,
              },
        },
        { status: 404 }
      );
    }

    const parsed = PAGE_PARSERS[page](row.payload);
    if (!parsed) {
      return apiJsonResponse(
        { success: false, error: `Formato de ${column} inválido` },
        { status: 500 }
      );
    }

    const source = resolveSource(row.calculated_at);
    const sourceDate = utcDateFromTimestamp(row.calculated_at);

    return apiJsonResponse({
      success: true,
      source,
      sourceDate,
      lastUpdated: parsed.last_updated,
      data: parsed,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching web page statistics:', error);
    return apiJsonResponse(
      {
        success: false,
        error: 'Error al cargar estadísticas',
        details: message,
      },
      { status: 500 }
    );
  }
}
