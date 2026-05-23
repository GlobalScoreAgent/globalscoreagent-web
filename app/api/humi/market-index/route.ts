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
      .from('index_humi_agent_distribution')
      .select(`
        register_date,
        best_agent_avg_score,
        agent_1_star_count,
        agent_1_star_avg_score,
        agent_2_star_count,
        agent_2_star_avg_score,
        agent_3_star_count,
        agent_3_star_avg_score,
        agent_4_star_count,
        agent_4_star_avg_score,
        agent_5_star_count,
        agent_5_star_avg_score
      `)
      .order('register_date', { ascending: true })
      .limit(30);

    if (error) throw error;

    const formattedData =
      data?.map((row) => ({
        date: row.register_date,
        average: row.best_agent_avg_score,
        '1-star-count': row.agent_1_star_count,
        '1-star-avg': row.agent_1_star_avg_score,
        '2-star-count': row.agent_2_star_count,
        '2-star-avg': row.agent_2_star_avg_score,
        '3-star-count': row.agent_3_star_count,
        '3-star-avg': row.agent_3_star_avg_score,
        '4-star-count': row.agent_4_star_count,
        '4-star-avg': row.agent_4_star_avg_score,
        '5-star-count': row.agent_5_star_count,
        '5-star-avg': row.agent_5_star_avg_score,
      })) || [];

    return apiJsonResponse({
      success: true,
      data: formattedData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching market index:', error);
    return apiJsonResponse(
      {
        success: false,
        error: 'Error al cargar datos del índice HUMI',
        details: message,
      },
      { status: 500 }
    );
  }
}
