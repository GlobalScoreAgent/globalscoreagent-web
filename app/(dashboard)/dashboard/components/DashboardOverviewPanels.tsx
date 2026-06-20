'use client';

import { DashboardChainCards } from '@/components/dashboard/DashboardChainCards';
import { DashboardGlobalDistributionBarCard } from '@/components/dashboard/DashboardGlobalDistributionBarCard';
import { DashboardGlobalTop10AgentsCard } from '@/components/dashboard/DashboardGlobalTop10AgentsCard';
import { DashboardNonceInsightCard } from '@/components/dashboard/DashboardNonceInsightCard';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { parseBest10AgentsHumi, type DashboardChainRow } from '@/lib/dashboardChains';
import type { Translations } from './LanguageContext';

export type DashboardOverviewPanelsProps = {
  stats: Record<string, unknown>;
  dashboardChains: DashboardChainRow[];
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
  dashboardChains,
  currentStats,
  top10Agents,
  isDark,
  t,
  lang,
}: DashboardOverviewPanelsProps) {
  const distributionStats = distributionStatsPick(currentStats);

  return (
    <>
      <div className="mb-16 flex flex-col gap-4 md:hidden">
        <DashboardStatsGrid section="all" currentStats={currentStats} isDark={isDark} t={t} />
        <DashboardGlobalTop10AgentsCard isDark={isDark} t={t} lang={lang} agents={top10Agents} className="w-full" />
        <DashboardNonceInsightCard
          isDark={isDark}
          t={t}
          agentNonce={stats?.agent_nonce}
          className="min-h-[220px] w-full"
        />
        <DashboardGlobalDistributionBarCard
          isDark={isDark}
          t={t}
          currentStats={distributionStats}
          stackedBarOrientation="vertical"
          legendPlacement="bottom"
          className="w-full min-h-[280px]"
        />
      </div>

      <div className="mb-16 hidden flex-col gap-2 md:flex">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 lg:h-[15rem] lg:items-stretch lg:gap-2">
          <DashboardStatsGrid
            compact
            section="top"
            currentStats={currentStats}
            isDark={isDark}
            t={t}
            className="h-full min-h-0 lg:col-span-5 lg:col-start-1"
          />
          <div className="flex min-h-0 flex-col gap-2 lg:col-span-7 lg:col-start-6 lg:flex-row lg:overflow-hidden">
            <DashboardNonceInsightCard
              compact
              isDark={isDark}
              t={t}
              agentNonce={stats?.agent_nonce}
              className="h-full min-h-0 w-full min-w-0 flex-1"
            />
            <DashboardGlobalTop10AgentsCard
              compact
              isDark={isDark}
              t={t}
              lang={lang}
              agents={top10Agents}
              className="h-full min-h-0 w-full min-w-0 flex-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 lg:h-[16rem] lg:items-stretch lg:gap-2">
          <DashboardStatsGrid
            compact
            section="bottom"
            currentStats={currentStats}
            isDark={isDark}
            t={t}
            className="h-full min-h-0 lg:col-span-5 lg:col-start-1"
          />
          <div className="min-h-0 overflow-hidden lg:col-span-7 lg:col-start-6">
            <DashboardGlobalDistributionBarCard
              compact
              isDark={isDark}
              t={t}
              currentStats={distributionStats}
              stackedBarOrientation="horizontal"
              legendPlacement="side"
              className="h-full min-h-0 w-full"
            />
          </div>
        </div>
      </div>

      <div className="mb-16">
        <DashboardChainCards chains={dashboardChains} isDark={isDark} t={t} lang={lang} />
      </div>
    </>
  );
}
