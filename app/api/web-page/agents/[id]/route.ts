import { NextRequest, NextResponse } from 'next/server';
import { fetchAgentDetail } from '@/lib/agents/agentDetailFetch';
import { parseAgentRouteLookupBy } from '@/lib/dashboardAgentLookup';
import { getSupabaseReadClient } from '@/lib/supabase/read';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const supabase = getSupabaseReadClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase no configurado' },
        { status: 503 },
      );
    }

    const idParam = context.params.id;
    const numericId = parseInt(idParam, 10);
    if (!idParam || Number.isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid agent id' }, { status: 400 });
    }

    const lookupBy = parseAgentRouteLookupBy(new URL(request.url).searchParams.get('by'));
    const result = await fetchAgentDetail(supabase, numericId, lookupBy);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status },
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (err) {
    console.error('Public agent detail API:', err);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    );
  }
}
