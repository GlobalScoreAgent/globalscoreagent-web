import { apiJsonResponse } from '@/lib/api/route-config';
import { callUserLogoutProcess, parseLoginLogId } from '@/lib/gsa/logout-process';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

type LogoutProcessBody = {
  login_log_id?: unknown;
};

export async function POST(request: Request) {
  let body: LogoutProcessBody = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as LogoutProcessBody;
    }
  } catch {
    return apiJsonResponse({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const loginLogId = parseLoginLogId(body.login_log_id);
  if (loginLogId == null) {
    return apiJsonResponse({ success: false, error: 'Invalid login_log_id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rpcClient = user ? supabase : getSupabaseAdmin();
  if (!rpcClient) {
    return apiJsonResponse(
      { success: false, error: 'Supabase no configurado' },
      { status: 503 },
    );
  }

  try {
    await callUserLogoutProcess(rpcClient, loginLogId);
    return apiJsonResponse({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'logout_process_failed';
    console.warn('[auth/logout-process]', message);
    return apiJsonResponse({ success: true, warning: message });
  }
}
