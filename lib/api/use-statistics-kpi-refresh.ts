'use client';

import { useEffect } from 'react';

/** Re-fetch interval while the tab stays visible (5 minutes). */
export const STATISTICS_KPI_REFRESH_MS = 5 * 60 * 1000;

type StatisticsLoadFn = (options?: { silent?: boolean }) => void | Promise<void>;

/**
 * Initial load, bfcache restore, tab focus, and periodic refresh for KPI overlays.
 * Pass `silent: true` on background refreshes to avoid skeleton flashes.
 */
export function useStatisticsKpiRefresh(load: StatisticsLoadFn): void {
  useEffect(() => {
    void load();

    const refreshSilent = () => {
      void load({ silent: true });
    };

    const onPageShow = () => {
      refreshSilent();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSilent();
      }
    };

    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibilityChange);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshSilent();
      }
    }, STATISTICS_KPI_REFRESH_MS);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [load]);
}
