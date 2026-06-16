'use client';

import dynamic from 'next/dynamic';
import { useDashboardLogin } from './components/DashboardLoginContext';
import { useLanguage } from './components/LanguageContext';
import { parseBest10AgentsHumi, type DashboardChainRow } from '@/lib/dashboardChains';
import { normalizeMetadataDistribution } from '@/lib/dashboardMetadataDistribution';
import { handleDashboardUnauthorized } from '@/lib/auth/handle-dashboard-unauthorized';
import { useState, useEffect, useMemo } from 'react';

const DashboardOverviewPanels = dynamic(() => import('./components/DashboardOverviewPanels'), {
  ssr: false,
  loading: () => null,
});

type LoadState = 'loading' | 'ready' | 'error';

export default function DashboardPageClient() {
  const { t, theme, lang } = useLanguage();
  const { loginReady, isSubscriptionActive, loginMessage } = useDashboardLogin();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [dashboardChains, setDashboardChains] = useState<DashboardChainRow[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    if (!loginReady || !isSubscriptionActive) {
      return;
    }

    const load = async () => {
      setLoadState('loading');

      try {
        const res = await fetch('/api/dashboard/overview', { credentials: 'include' });

        if (res.status === 401) {
          await handleDashboardUnauthorized();
          return;
        }

        const body = await res.json();

        if (!res.ok || !body?.success || !body.stats) {
          console.error('Error loading dashboard overview:', body?.details ?? body);
          setStats(null);
          setDashboardChains([]);
          setLoadState('error');
          return;
        }

        setStats(body.stats);
        setDashboardChains((body.chains as DashboardChainRow[]) ?? []);
        setLoadState('ready');
      } catch (err) {
        console.error('Error loading dashboard overview:', err);
        setStats(null);
        setDashboardChains([]);
        setLoadState('error');
      }
    };

    void load();
  }, [loginReady, isSubscriptionActive]);

  const top10Agents = useMemo(
    () => parseBest10AgentsHumi(stats?.top_10_agents),
    [stats],
  );

  const currentStats = useMemo(() => {
    if (!stats) return null;

    return {
      total_agents: Number(stats.total_agents) || 0,
      total_agents_active: Number(stats.total_agents_active) || 0,
      wallet_monitored: Number(stats.wallet_monitored) || 0,
      owner_total: Number(stats.owner_total) || 0,
      agent_new: Number(stats.agent_new) || 0,
      feedback_new: Number(stats.feedback_new) || 0,
      agents_with_feedback: Number(stats.agents_with_feedback) || 0,
      feedback_total: Number(stats.feedback_total) || 0,
      humi_index_distribution:
        (stats.humi_index_distribution as Record<string, number>) ?? {},
      wami_index_distribution:
        (stats.wami_index_distribution as Record<string, number>) ?? {},
      agent_metadata_distribution: normalizeMetadataDistribution(stats.agent_metadata_richness),
    };
  }, [stats]);

  const retryLoad = () => {
    setLoadState('loading');
    void fetch('/api/dashboard/overview', { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) {
          await handleDashboardUnauthorized();
          return;
        }
        const body = await res.json();
        if (!res.ok || !body?.success || !body.stats) {
          setLoadState('error');
          return;
        }
        setStats(body.stats);
        setDashboardChains((body.chains as DashboardChainRow[]) ?? []);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  };

  const subscriptionMessage =
    loginMessage && (lang === 'es' ? loginMessage.es : loginMessage.en);

  return (
    <div className={`min-h-full ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <div className="mx-auto max-w-screen-2xl">
        {loginReady && !isSubscriptionActive && (
          <div className="px-4 py-24 text-center">
            <p
              className={`mx-auto max-w-xl text-lg ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
              role="status"
            >
              {subscriptionMessage ||
                (lang === 'es'
                  ? 'El perfil no tiene una suscripción activa'
                  : 'The profile does not have an active subscription')}
            </p>
          </div>
        )}

        {isSubscriptionActive && loadState === 'loading' && (
          <div className="py-24 text-center">
            <p className={`text-lg ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {t.dashboardDataLoading}
            </p>
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

        {isSubscriptionActive && loadState === 'ready' && currentStats && (
          <DashboardOverviewPanels
            stats={stats!}
            dashboardChains={dashboardChains}
            currentStats={currentStats}
            top10Agents={top10Agents}
            isDark={isDark}
            t={t}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}
