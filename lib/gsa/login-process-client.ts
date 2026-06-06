import type { LoginProcessRequest, LoginProcessResult } from '@/lib/gsa/login-process';
import { persistLoginProcess } from '@/lib/gsa/login-process-storage';

export async function clientLoginProcess(
  request?: LoginProcessRequest,
): Promise<LoginProcessResult> {
  const res = await fetch('/api/auth/login-process', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request ?? {}),
  });

  const data = await res.json();

  if (!res.ok || !data?.success) {
    throw new Error(
      typeof data?.error === 'string' ? data.error : 'login_process_failed',
    );
  }

  const result: LoginProcessResult = {
    profile_id: data.profile_id,
    subscription: data.subscription,
    new_user: data.new_user === true,
    message_es: data.message_es ?? '',
    message_en: data.message_en ?? '',
  };

  persistLoginProcess(result);
  return result;
}
