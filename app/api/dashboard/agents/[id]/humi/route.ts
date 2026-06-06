import { NextRequest, NextResponse } from 'next/server';
import { requireDashboardUser } from '@/lib/auth/require-dashboard-user';

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const auth = await requireDashboardUser();
    if (!auth.ok) return auth.response;

    const idParam = context.params.id;
    const numericId = parseInt(idParam, 10);
    if (!idParam || Number.isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid agent id' }, { status: 400 });
    }

    const supabase = auth.supabase;

    const { data, error } = await supabase
      .schema('web_dashboard')
      .from('index_humi')
      .select(
        `
        humi_score,
        madurity_level,
        humi_score_category,
        current_humi_score_calculated_at,
        humi_score_last_30_days,
        humi_score_tracking,
        pillar_history_score,
        pillar_history_summary,
        pillar_usage_score,
        pillar_usage_summary,
        pillar_measure_score,
        pillar_measure_summary,
        pillar_information_score,
        pillar_information_summary,
        pillar_history_score_last_30_days,
        pillar_history_score_tracking,
        pillar_information_score_last_30_days,
        pillar_information_score_tracking,
        pillar_measure_score_last_30_days,
        pillar_measure_score_tracking,
        pillar_usage_score_last_30_days,
        pillar_usage_score_tracking
      `,
      )
      .eq('agent_id', numericId)
      .maybeSingle();

    if (error) {
      console.error('Index HUMI fetch error:', error);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos', details: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Index HUMI not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Index HUMI API:', err);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    );
  }
}
