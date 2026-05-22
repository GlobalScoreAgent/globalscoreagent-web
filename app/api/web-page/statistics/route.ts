import { NextRequest } from 'next/server';
import { apiJsonResponse } from '@/lib/api/route-config';
import { getSupabaseReadClient } from '@/lib/supabase/read';
import {
  getStatisticsColumn,
  parseHumiPageKpi,
  parseMainPageKpi,
  parseWamiPageKpi,
  startOfUtcDayIso,
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
  created_at: string;
  payload: unknown;
};

type FetchResult = {
  row: StatisticsRow | null;
  dbError: string | null;
  rowCount: number;
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

function isValidPayload(page: StatisticsPage, payload: unknown): boolean {
  return PAGE_PARSERS[page](payload) !== null;
}

async function fetchRowForUtcDay(
  column: string,
  dayOffset: number
): Promise<FetchResult> {
  const supabase = getSupabaseReadClient();
  if (!supabase) return { row: null, dbError: 'no client', rowCount: 0 };

  const dayStart = startOfUtcDayIso(dayOffset);
  const dayEnd = startOfUtcDayIso(dayOffset - 1);

  let query = supabase
    .schema('web_page')
    .from('web_page_statistics')
    .select(`created_at, ${column}`)
    .gte('created_at', dayStart)
    .order('created_at', { ascending: false })
    .limit(1);

  if (dayOffset > 0) {
    query = query.lt('created_at', dayEnd);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('web_page_statistics day query:', error.message);
    return { row: null, dbError: error.message, rowCount: 0 };
  }
  if (!data) return { row: null, dbError: null, rowCount: 0 };

  const row = data as unknown as Record<string, unknown>;
  return {
    row: {
      created_at: row.created_at as string,
      payload: row[column],
    },
    dbError: null,
    rowCount: 1,
  };
}

async function fetchLatestValidRow(
  column: string,
  page: StatisticsPage
): Promise<FetchResult> {
  const supabase = getSupabaseReadClient();
  if (!supabase) return { row: null, dbError: 'no client', rowCount: 0 };

  const { data, error } = await supabase
    .schema('web_page')
    .from('web_page_statistics')
    .select(`id, created_at, ${column}`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('web_page_statistics latest query:', error.message);
    return { row: null, dbError: error.message, rowCount: 0 };
  }

  const rows = data ?? [];

  for (const raw of rows) {
    const row = raw as unknown as Record<string, unknown>;
    const payload = row[column];
    if (isValidPayload(page, payload)) {
      return {
        row: {
          created_at: row.created_at as string,
          payload,
        },
        dbError: null,
        rowCount: rows.length,
      };
    }
  }

  return { row: null, dbError: null, rowCount: rows.length };
}

async function resolveStatisticsRow(page: StatisticsPage) {
  const column = getStatisticsColumn(page);
  let row: StatisticsRow | null = null;
  let source: StatisticsSource = 'today';
  let sourceDate = utcDayIso(0);
  let dbError: string | null = null;
  let scannedRows = 0;

  const todayResult = await fetchRowForUtcDay(column, 0);
  dbError = todayResult.dbError;
  scannedRows = todayResult.rowCount;
  if (todayResult.row && isValidPayload(page, todayResult.row.payload)) {
    row = todayResult.row;
  }

  if (!row) {
    const yesterdayResult = await fetchRowForUtcDay(column, 1);
    dbError = dbError ?? yesterdayResult.dbError;
    if (yesterdayResult.row && isValidPayload(page, yesterdayResult.row.payload)) {
      row = yesterdayResult.row;
      source = 'yesterday';
      sourceDate = utcDayIso(1);
    }
  }

  if (!row) {
    const latestResult = await fetchLatestValidRow(column, page);
    dbError = dbError ?? latestResult.dbError;
    scannedRows = Math.max(scannedRows, latestResult.rowCount);
    if (latestResult.row) {
      row = latestResult.row;
      source = 'latest';
      sourceDate = utcDateFromTimestamp(latestResult.row.created_at);
    }
  }

  return { row, source, sourceDate, dbError, scannedRows, column };
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseReadClient();
  if (!supabase) {
    return apiJsonResponse(
      {
        success: false,
        error:
          'Supabase no configurado: define SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local',
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
    const { row, source, sourceDate, dbError, scannedRows } = await resolveStatisticsRow(page);

    if (!row) {
      return apiJsonResponse(
        {
          success: false,
          error: `No hay estadísticas válidas para ${page} (hoy/ayer UTC ni filas con formato esperado)`,
          details: dbError
            ? { supabase: dbError, hint: 'Ejecuta docs/supabase-web-page-grants.sql en Supabase' }
            : {
                scannedRows,
                hint:
                  scannedRows > 0
                    ? `Hay filas pero ninguna cumple ${PAGE_FORMAT_HINTS[page]}`
                    : 'No se devolvieron filas desde web_page.web_page_statistics',
              },
        },
        { status: 404 }
      );
    }

    const parsed = PAGE_PARSERS[page](row.payload);
    if (!parsed) {
      return apiJsonResponse(
        { success: false, error: `Formato de ${getStatisticsColumn(page)} inválido` },
        { status: 500 }
      );
    }

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
