import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiJsonResponse } from '@/lib/api/route-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiJsonResponse(
      { success: false, error: 'Supabase no configurado' },
      { status: 503 }
    );
  }

  try {
    const { data, error } = await supabase
      .schema('web_page')
      .from('erc_8004_agent_statistics')
      .select('statistics_date, agent_count')
      .order('statistics_date', { ascending: true });

    if (error) throw error;

    const formattedData =
      data?.map((row) => ({
        date: row.statistics_date,
        count: row.agent_count,
      })) || [];

    return apiJsonResponse({
      success: true,
      data: formattedData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching ERC-8004 stats:', error);
    return apiJsonResponse(
      {
        success: false,
        error: 'Error al cargar estadísticas de agentes',
        details: message,
      },
      { status: 500 }
    );
  }
}
