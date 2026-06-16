import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import { clearDashboardPreferencesHydration } from '@/lib/gsa/dashboard-preferences-hydration';
import { clearLoginProcess } from '@/lib/gsa/login-process-storage';
import {
  markManualLogout,
  reportSessionEnd,
} from '@/lib/gsa/logout-process-client';
import { createClient } from '@/utils/supabase/client';

function clearAgentNavigationStorage(): void {
  try {
    sessionStorage.removeItem('gsa:agentsRecent');
    sessionStorage.removeItem('gsa:agentFavorites');
  } catch {
    /* ignore */
  }
}

export async function performDashboardLogout(redirectPath = '/dashboard'): Promise<void> {
  markManualLogout();
  await reportSessionEnd('manual_logout');

  clearAgentNavigationStorage();
  clearLoginProcess();
  clearDashboardPreferencesHydration();

  const supabase = createClient();
  await supabase.auth.signOut();

  window.location.href = buildAuthLoginUrl(redirectPath);
}
