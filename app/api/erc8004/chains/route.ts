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
      .select(`
        chain_name,
        owner_total_count,
        agent_total_count,
        agent_active_count,
        agent_active_with_feedbacks
      `)
      .gt('agent_total_count', 0)
      .order('agent_total_count', { ascending: false });

    if (error) throw error;

    return apiJsonResponse({ success: true, data: data || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching chains stats:', error);
    return apiJsonResponse(
      {
        success: false,
        error: 'Error al cargar distribución de cadenas',
        details: message,
      },
      { status: 500 }
    );
  }
}
