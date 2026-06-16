import type { LoginProcessRequest, LoginProcessResult } from '@/lib/gsa/login-process';
import { loadLoginProcess, persistLoginProcess } from '@/lib/gsa/login-process-storage';

function parseLoginProcessResponse(data: Record<string, unknown>): LoginProcessResult {
  if (typeof data.login_log_id !== 'number' || data.login_log_id <= 0) {
    throw new Error('Invalid login_log_id from login-process');
  }

  return {
    profile_id: data.profile_id as number,
    login_log_id: data.login_log_id,
    subscription: data.subscription as LoginProcessResult['subscription'],
    new_user: data.new_user === true,
    message_es: typeof data.message_es === 'string' ? data.message_es : '',
    message_en: typeof data.message_en === 'string' ? data.message_en : '',
  };
}

let loginProcessInFlight: Promise<LoginProcessResult> | null = null;

export async function fetchLoginProcessFromApi(
  request?: LoginProcessRequest,
): Promise<LoginProcessResult> {
  if (loginProcessInFlight) {
    return loginProcessInFlight;
  }

  loginProcessInFlight = (async () => {
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

    const result = parseLoginProcessResponse(data as Record<string, unknown>);
    persistLoginProcess(result);
    return result;
  })();

  try {
    return await loginProcessInFlight;
  } finally {
    loginProcessInFlight = null;
  }
}

export async function clientLoginProcess(
  request?: LoginProcessRequest,
): Promise<LoginProcessResult> {
  return fetchLoginProcessFromApi(request);
}

export function getValidLoginProcessCache(): LoginProcessResult | null {
  return loadLoginProcess();
}
