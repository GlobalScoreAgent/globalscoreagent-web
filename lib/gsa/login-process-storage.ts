import type { LoginProcessResult } from '@/lib/gsa/login-process';

export const LOGIN_PROCESS_STORAGE_KEY = 'gsa:loginProcess';

export function persistLoginProcess(result: LoginProcessResult): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem('gsa:manualLogout');
    sessionStorage.setItem(LOGIN_PROCESS_STORAGE_KEY, JSON.stringify(result));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadLoginProcess(): LoginProcessResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LOGIN_PROCESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LoginProcessResult;
    if (
      typeof parsed.profile_id !== 'number' ||
      typeof parsed.login_log_id !== 'number' ||
      parsed.login_log_id <= 0 ||
      (parsed.subscription !== 'Active' && parsed.subscription !== 'Disable')
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearLoginProcess(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(LOGIN_PROCESS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
