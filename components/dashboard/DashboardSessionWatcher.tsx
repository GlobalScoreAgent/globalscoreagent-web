'use client';

import { useEffect } from 'react';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import {
  isManualLogoutInProgress,
  reportSessionEnd,
} from '@/lib/gsa/logout-process-client';

async function getSupabaseClient() {
  const { createClient } = await import('@/utils/supabase/client');
  return createClient();
}

export default function DashboardSessionWatcher() {
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    void (async () => {
      const supabase = await getSupabaseClient();
      if (cancelled) return;

      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event !== 'SIGNED_OUT') return;
        if (isManualLogoutInProgress()) return;

        void (async () => {
          await reportSessionEnd('session_expired');
          window.location.href = buildAuthLoginUrl('/dashboard');
        })();
      });

      subscription = authSubscription;
    })();

    const onPageHide = () => {
      if (isManualLogoutInProgress()) return;
      void reportSessionEnd('tab_closed', { useBeacon: true });
    };

    window.addEventListener('pagehide', onPageHide);

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  return null;
}
