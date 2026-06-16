import { apiJsonResponse } from '@/lib/api/route-config';
import { runLoginProcessForUser, type LoginProcessRequest } from '@/lib/gsa/login-process';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return apiJsonResponse({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  let body: LoginProcessRequest = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as LoginProcessRequest;
    }
  } catch {
    return apiJsonResponse({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const result = await runLoginProcessForUser(supabase, user, body);
    return apiJsonResponse({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[auth/login-process]', err);
    return apiJsonResponse(
      {
        success: false,
        error: err instanceof Error ? err.message : 'login_process_failed',
      },
      { status: 500 },
    );
  }
}
