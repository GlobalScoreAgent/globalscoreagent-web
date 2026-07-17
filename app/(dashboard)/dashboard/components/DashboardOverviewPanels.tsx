'use client';

import { useMemo } from 'react';
import { DashboardGlobalDistributionBarCard } from '@/components/dashboard/DashboardGlobalDistributionBarCard';
import { DashboardGlobalTop10AgentsCard } from '@/components/dashboard/DashboardGlobalTop10AgentsCard';
import {
  DashboardMonitoredChainsRow,
  parseMonitoredChains,
} from '@/components/dashboard/DashboardMonitoredChainsRow';
import { DashboardNonceInsightCard } from '@/components/dashboard/DashboardNonceInsightCard';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { GLOBAL_DISTRIBUTION_METRICS } from '@/lib/dashboardOverviewDistribution';
import { parseBest10AgentsHumi } from '@/lib/dashboardChains';
import type { Translations } from './LanguageContext';

export type DashboardOverviewPanelsProps = {
  stats: Record<string, unknown>;
  currentStats: {
    total_agents: number;
    total_agents_active: number;
    wallet_monitored: number;
    owner_total: number;
    agent_new: number;
    feedback_new: number;
    agents_with_feedback: number;
    feedback_total: number;
    humi_index_distribution: Record<string, number>;
    wami_index_distribution: Record<string, number>;
    agent_metadata_distribution: Record<string, number>;
  };
  top10Agents: ReturnType<typeof parseBest10AgentsHumi>;
  isDark: boolean;
  t: Translations;
  lang: 'es' | 'en';
};

const distributionStatsPick = (currentStats: DashboardOverviewPanelsProps['currentStats']) => ({
  humi_index_distribution: currentStats.humi_index_distribution,
  wami_index_distribution: currentStats.wami_index_distribution,
  agent_metadata_distribution: currentStats.agent_metadata_distribution,
});

export default function DashboardOverviewPanels({
  stats,
  currentStats,
  top10Agents,
  isDark,
  t,
  lang,
}: DashboardOverviewPanelsProps) {
  const distributionStats = distributionStatsPick(currentStats);
  const monitoredChains = useMemo(
    () => parseMonitoredChains(stats?.monitored_chains),
    [stats?.monitored_chains],
  );
  const locale = lang === 'es' ? 'es-ES' : 'en-US';

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:hidden">
        <DashboardStatsGrid
          section="all"
          currentStats={currentStats}
          isDark={isDark}
          t={t}
          locale={locale}
        />
        <DashboardGlobalTop10AgentsCard isDark={isDark} t={t} lang={lang} agents={top10Agents} className="w-full" />
        <DashboardNonceInsightCard
          isDark={isDark}
          t={t}
          agentNonce={stats?.agent_nonce}
          className="min-h-[220px] w-full"
          locale={locale}
        />
        {GLOBAL_DISTRIBUTION_METRICS.map((metric) => (
          <DashboardGlobalDistributionBarCard
            key={metric}
            metric={metric}
            isDark={isDark}
            t={t}
            currentStats={distributionStats}
            locale={locale}
            className="w-full min-h-[320px]"
          />
        ))}
        <DashboardMonitoredChainsRow chains={monitoredChains} isDark={isDark} t={t} className="mt-2" />
      </div>

      <div className="mb-8 hidden flex-col gap-2 md:flex">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:h-[16rem] md:items-stretch md:gap-2">
          <DashboardStatsGrid
            compact
            section="all"
            currentStats={currentStats}
            isDark={isDark}
            t={t}
            locale={locale}
            className="h-full min-h-0 md:col-span-8"
          />
          <DashboardNonceInsightCard
            compact
            isDark={isDark}
            t={t}
            agentNonce={stats?.agent_nonce}
            className="h-full min-h-0 w-full min-w-0 md:col-span-4"
            locale={locale}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:h-[24rem] md:items-stretch md:gap-2">
          <div className="grid min-h-0 grid-cols-1 gap-2 md:col-span-8 md:grid-cols-3">
            {GLOBAL_DISTRIBUTION_METRICS.map((metric) => (
              <DashboardGlobalDistributionBarCard
                key={metric}
                metric={metric}
                compact
                isDark={isDark}
                t={t}
                currentStats={distributionStats}
                locale={locale}
                className="h-full min-h-0 w-full"
              />
            ))}
          </div>
          <DashboardGlobalTop10AgentsCard
            isDark={isDark}
            t={t}
            lang={lang}
            agents={top10Agents}
            className="h-full min-h-0 w-full min-w-0 md:col-span-4"
          />
        </div>

        <DashboardMonitoredChainsRow chains={monitoredChains} isDark={isDark} t={t} className="mt-4 mb-8" />
      </div>
    </>
  );
}
