import { NextRequest, NextResponse } from 'next/server';
import { requireActiveDashboardUser } from '@/lib/auth/require-active-subscription';
import { fetchAgentHumiIndex } from '@/lib/agents/agentDetailFetch';
import { parseAgentRouteLookupBy } from '@/lib/dashboardAgentLookup';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const auth = await requireActiveDashboardUser();
    if (!auth.ok) return auth.response;

    const idParam = context.params.id;
    const numericId = parseInt(idParam, 10);
    if (!idParam || Number.isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid agent id' }, { status: 400 });
    }

    const lookupBy = parseAgentRouteLookupBy(new URL(request.url).searchParams.get('by'));
    const result = await fetchAgentHumiIndex(auth.supabase, numericId, lookupBy);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status },
      );
    }

    return NextResponse.json({ data: result.data });
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
