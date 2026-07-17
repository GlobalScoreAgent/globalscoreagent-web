'use client';

import dynamic from 'next/dynamic';
import { useDashboardLogin } from '../components/DashboardLoginContext';
import { useLanguage } from '../components/LanguageContext';
import { AgentsDirectorySearching } from '@/components/dashboard/AgentsDirectorySearching';
import { SubscriptionInactiveNotice } from '@/components/dashboard/SubscriptionInactiveNotice';
import { handleDashboardUnauthorized } from '@/lib/auth/handle-dashboard-unauthorized';
import type { DashboardChainRow } from '@/lib/dashboardChains';
import { useEffect, useState } from 'react';

const DashboardChainCards = dynamic(
  () =>
    import('@/components/dashboard/DashboardChainCards').then((m) => m.DashboardChainCards),
  { ssr: false, loading: () => null },
);

type LoadState = 'loading' | 'ready' | 'error';

export default function ChainsPageClient() {
  const { t, theme, lang } = useLanguage();
  const { loginReady, isSubscriptionActive } = useDashboardLogin();
  const isDark = theme === 'dark';

  const [dashboardChains, setDashboardChains] = useState<DashboardChainRow[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [searchLoadingKey, setSearchLoadingKey] = useState(0);

  useEffect(() => {
    if (!loginReady || !isSubscriptionActive) {
      return;
    }

    const load = async () => {
      setSearchLoadingKey((k) => k + 1);
      setLoadState('loading');

      try {
        const res = await fetch('/api/dashboard/overview', { credentials: 'include' });

        if (res.status === 401) {
          await handleDashboardUnauthorized();
          return;
        }

        const body = await res.json();

        if (!res.ok || !body?.success) {
          console.error('Error loading dashboard chains:', body?.details ?? body);
          setDashboardChains([]);
          setLoadState('error');
          return;
        }

        setDashboardChains((body.chains as DashboardChainRow[]) ?? []);
        setLoadState('ready');
      } catch (err) {
        console.error('Error loading dashboard chains:', err);
        setDashboardChains([]);
        setLoadState('error');
      }
    };

    void load();
  }, [loginReady, isSubscriptionActive]);

  const retryLoad = () => {
    setSearchLoadingKey((k) => k + 1);
    setLoadState('loading');
    void fetch('/api/dashboard/overview', { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) {
          await handleDashboardUnauthorized();
          return;
        }
        const body = await res.json();
        if (!res.ok || !body?.success) {
          setLoadState('error');
          return;
        }
        setDashboardChains((body.chains as DashboardChainRow[]) ?? []);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  };

  return (
    <div className={`min-h-full ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <div className="mx-auto max-w-screen-2xl">
        {loginReady && !isSubscriptionActive && <SubscriptionInactiveNotice />}

        {isSubscriptionActive && loadState === 'loading' && (
          <div className="flex justify-center py-16">
            <AgentsDirectorySearching
              key={searchLoadingKey}
              label={t.dashboardDataLoading}
              isDark={isDark}
            />
          </div>
        )}

        {isSubscriptionActive && loadState === 'error' && (
          <div className="px-4 py-24 text-center">
            <p className={`text-lg ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {t.dashboardDataLoadError}
            </p>
            <button
              type="button"
              onClick={retryLoad}
              className={`mt-6 rounded-xl px-5 py-2 text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
              }`}
            >
              {t.dashboardDataRetry}
            </button>
          </div>
        )}

        {isSubscriptionActive && loadState === 'ready' && (
          <div className="mb-16">
            <DashboardChainCards chains={dashboardChains} isDark={isDark} t={t} lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
}
