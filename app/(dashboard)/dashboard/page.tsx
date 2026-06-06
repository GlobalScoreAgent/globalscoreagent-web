// app/(dashboard)/dashboard/page.tsx
// Versión final corregida - Tres cards + carrete full-width debajo

'use client';

import { useDashboardLogin } from './components/DashboardLoginContext';
import { useLanguage } from './components/LanguageContext';
import AnimatedCounter from './components/AnimatedCounter';
import { DashboardChainCards } from '@/components/dashboard/DashboardChainCards';
import { DashboardGlobalDistributionCard } from '@/components/dashboard/DashboardGlobalDistributionCard';
import { DashboardNonceInsightCard } from '@/components/dashboard/DashboardNonceInsightCard';
import type { DashboardChainRow } from '@/lib/dashboardChains';
import { normalizeMetadataDistribution } from '@/lib/dashboardMetadataDistribution';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

type LoadState = 'loading' | 'ready' | 'error';

// Componente de navegación de estadísticas
function StatsNavigator({ currentStats, isDark, t }: any) {
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    {
      key: 'total_agents',
      label: t.registeredAgents,
      description: t.totalAgentsDescription,
      image: '/dashboard_registered_symbol.png',
      color: '#facc15',
    },
    {
      key: 'total_agents_active',
      label: t.activeAgents,
      description: t.activeAgentsDescription,
      image: '/dashboard_active_symbol.png',
      color: '#22c55e',
    },
    {
      key: 'total_agents_with_feedbacks',
      label: t.agentsWithFeedback,
      description: t.agentsWithFeedbackDescription,
      image: '/dashboard_feedback_symbol.png',
      color: '#3b82f6',
    },
    {
      key: 'wallet_monitored',
      label: t.monitoredWallets,
      description: t.monitoredWalletsDescription,
      image: '/dashboard_wallets_symbol.png',
      color: '#a855f7',
    },
  ];

  const current = stats[currentStat];

  return (
    <div className="flex flex-col items-center gap-8 h-full">
      <motion.div
        key={currentStat}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`w-full rounded-3xl p-8 transition-all hover:scale-[1.02] hover:-translate-y-1 flex-1 flex flex-col relative overflow-hidden backdrop-blur-sm ${isDark ? 'bg-zinc-900/80 border border-zinc-700/50' : 'bg-white/80 border border-zinc-200/50'}`}
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${current.color}15 0%, rgba(39,39,42,0.85) 30%, rgba(39,39,42,0.95) 70%, ${current.color}10 100%)`
            : `linear-gradient(135deg, ${current.color}20 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 70%, ${current.color}15 100%)`,
          boxShadow: isDark
            ? `0 16px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${current.color}35, inset 0 1px 0 rgba(255,255,255,0.1)`
            : `0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px ${current.color}40, inset 0 1px 0 rgba(255,255,255,0.6)`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full"
          style={{
            background: `radial-gradient(circle, ${current.color} 0%, transparent 70%)`,
            transform: 'translate(20px, -20px)',
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, ${current.color} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        <div className="flex-1 flex items-center justify-center">
          <p
            className={`text-9xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}
            suppressHydrationWarning
          >
            <AnimatedCounter end={currentStats[current.key] ?? 0} />
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <div
            className={`px-4 py-2 rounded-2xl text-sm font-medium ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-amber-400/20 text-amber-600'}`}
          >
            {t.erc8004Label}
          </div>
          <div
            className={`px-4 py-2 rounded-2xl text-sm font-medium ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}
          >
            {t.realTimeLabel}
          </div>
          <div
            className={`px-4 py-2 rounded-2xl text-sm font-bold ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-500/20 text-blue-600'}`}
          >
            {current.label}
          </div>
        </div>
      </motion.div>

      <div className="flex gap-4">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={() => setCurrentStat(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentStat === index
                ? 'bg-amber-400 scale-125 shadow-lg'
                : `bg-zinc-600 hover:bg-zinc-500 ${isDark ? 'hover:bg-zinc-400' : 'hover:bg-zinc-500'}`
            }`}
            style={{
              backgroundColor: currentStat === index ? stat.color : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
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
          window.location.href = buildAuthLoginUrl('/dashboard');
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

  const currentStats = useMemo(() => {
    if (!stats) return null;

    return {
      total_agents: Number(stats.total_agents) || 0,
      total_agents_active: Number(stats.total_agents_active) || 0,
      total_agents_with_feedbacks: Number(stats.total_agents_with_feedbacks) || 0,
      wallet_monitored: Number(stats.wallet_monitored) || 0,
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
          window.location.href = buildAuthLoginUrl('/dashboard');
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
      <div className="max-w-screen-2xl mx-auto">
        {loginReady && !isSubscriptionActive && (
          <div className="py-24 text-center px-4">
            <p
              className={`text-lg max-w-xl mx-auto ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
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
          <div className="py-24 text-center px-4">
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
          <>
            <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
              <div className="flex min-h-0 min-w-0 lg:col-span-5">
                <StatsNavigator currentStats={currentStats} isDark={isDark} t={t} />
              </div>
              <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:col-span-7 lg:flex-row lg:items-stretch">
                <DashboardNonceInsightCard
                  isDark={isDark}
                  t={t}
                  agentNonce={stats?.agent_nonce}
                  className="min-h-0 flex-1"
                />
                <DashboardGlobalDistributionCard
                  isDark={isDark}
                  t={t}
                  currentStats={{
                    humi_index_distribution: currentStats.humi_index_distribution,
                    wami_index_distribution: currentStats.wami_index_distribution,
                    agent_metadata_distribution: currentStats.agent_metadata_distribution,
                  }}
                  className="min-h-0 flex-1"
                />
              </div>
            </div>

            <div className="mb-16">
              <DashboardChainCards chains={dashboardChains} isDark={isDark} t={t} lang={lang} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
