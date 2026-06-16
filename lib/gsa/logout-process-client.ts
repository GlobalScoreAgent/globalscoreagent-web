import { loadLoginProcess } from '@/lib/gsa/login-process-storage';

export type SessionEndReason =
  | 'manual_logout'
  | 'session_expired'
  | 'tab_closed'
  | 'unauthorized';

const LOGOUT_REPORTED_PREFIX = 'gsa:logoutReported:';

export function getStoredLoginLogId(): number | null {
  const stored = loadLoginProcess();
  if (!stored || typeof stored.login_log_id !== 'number' || stored.login_log_id <= 0) {
    return null;
  }
  return stored.login_log_id;
}

export function wasLogoutReported(loginLogId: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(`${LOGOUT_REPORTED_PREFIX}${loginLogId}`) === '1';
  } catch {
    return false;
  }
}

export function markLogoutReported(loginLogId: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${LOGOUT_REPORTED_PREFIX}${loginLogId}`, '1');
  } catch {
    /* ignore */
  }
}

export function isManualLogoutInProgress(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem('gsa:manualLogout') === '1';
  } catch {
    return false;
  }
}

export function markManualLogout(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem('gsa:manualLogout', '1');
  } catch {
    /* ignore */
  }
}

async function postLogoutProcess(loginLogId: number): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/logout-process', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_log_id: loginLogId }),
      keepalive: true,
    });
    const data = await res.json().catch(() => ({}));
    return res.ok && data?.success === true;
  } catch {
    return false;
  }
}

function beaconLogoutProcess(loginLogId: number): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') {
    return false;
  }
  try {
    return navigator.sendBeacon(
      '/api/auth/logout-process',
      new Blob([JSON.stringify({ login_log_id: loginLogId })], {
        type: 'application/json',
      }),
    );
  } catch {
    return false;
  }
}

export async function reportSessionEnd(
  reason: SessionEndReason,
  options?: { useBeacon?: boolean },
): Promise<void> {
  const loginLogId = getStoredLoginLogId();
  if (loginLogId == null || wasLogoutReported(loginLogId)) {
    return;
  }

  const ok = options?.useBeacon
    ? beaconLogoutProcess(loginLogId) || (await postLogoutProcess(loginLogId))
    : await postLogoutProcess(loginLogId);

  if (ok) {
    markLogoutReported(loginLogId);
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('[session-end] logout-process failed', { reason, loginLogId });
  }
}
