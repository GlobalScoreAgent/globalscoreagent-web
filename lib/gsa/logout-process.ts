import type { SupabaseClient } from '@supabase/supabase-js';

export function parseLoginLogId(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

export async function callUserLogoutProcess(
  supabase: SupabaseClient,
  loginLogId: number,
): Promise<void> {
  const id = parseLoginLogId(loginLogId);
  if (id == null) {
    throw new Error('Invalid login_log_id');
  }

  const { error } = await supabase.schema('gsa').rpc('user_logout_process', {
    p_login_log_id: id,
  });

  if (error) {
    throw new Error(error.message);
  }
}
