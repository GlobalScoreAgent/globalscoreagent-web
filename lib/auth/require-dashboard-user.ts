import type { User } from '@supabase/supabase-js';
import type { NextResponse } from 'next/server';
import { apiJsonResponse } from '@/lib/api/route-config';
import { createClient } from '@/utils/supabase/server';

type DashboardAuthSuccess = {
  ok: true;
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

type DashboardAuthFailure = {
  ok: false;
  response: NextResponse;
};

export type DashboardAuthResult = DashboardAuthSuccess | DashboardAuthFailure;

export async function requireDashboardUser(): Promise<DashboardAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return {
      ok: false,
      response: apiJsonResponse({ success: false, error: 'No autenticado' }, { status: 401 }),
    };
  }

  return { ok: true, user, supabase };
}
