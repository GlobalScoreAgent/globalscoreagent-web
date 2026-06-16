/** One-time server preference hydration per browser tab session. */

export const DASHBOARD_PREFERENCES_HYDRATED_KEY = 'gsa:dashboard-preferences-hydrated';

export function hasHydratedDashboardPreferences(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(DASHBOARD_PREFERENCES_HYDRATED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markDashboardPreferencesHydrated(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DASHBOARD_PREFERENCES_HYDRATED_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearDashboardPreferencesHydration(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DASHBOARD_PREFERENCES_HYDRATED_KEY);
  } catch {
    /* ignore */
  }
}
