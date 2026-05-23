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
      .from('erc_8004_statistics')
      .select('agent_total_count');

    if (error) throw error;

    const total = data?.reduce((sum, row) => sum + (row.agent_total_count || 0), 0) || 0;

    return apiJsonResponse({ success: true, total });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching total agents:', error);
    return apiJsonResponse(
      {
        success: false,
        error: 'Error al cargar total de agentes',
        details: message,
      },
      { status: 500 }
    );
  }
}
