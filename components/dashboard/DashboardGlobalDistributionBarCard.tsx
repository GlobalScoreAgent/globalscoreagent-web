'use client';

import { useMemo } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { DistributionCarouselPanel } from '@/components/dashboard/DistributionCarouselPanel';
import {
  buildGlobalDistributionSlides,
  type GlobalDistributionStats,
} from '@/lib/dashboardOverviewDistribution';
import { cn } from '@/lib/utils';

type Props = {
  isDark: boolean;
  t: Translations;
  currentStats: GlobalDistributionStats;
  compact?: boolean;
  className?: string;
};

export function DashboardGlobalDistributionBarCard({
  isDark,
  t,
  currentStats,
  compact = false,
  className,
}: Props) {
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';

  const distributionSlides = useMemo(
    () => buildGlobalDistributionSlides(currentStats, t),
    [currentStats, t],
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
    <AgentDetailCard
      isDark={isDark}
      variant="metadata"
      accentHex="#a855f7"
      className={cn('flex h-full min-h-0 w-full flex-1 flex-col', className)}
      contentClassName={cn(
        'flex h-full min-h-0 flex-1 flex-col',
        compact ? 'gap-2 p-3 pt-9' : 'gap-3 p-4 pt-14 sm:p-5 sm:pt-14',
      )}
    >
      <div className={cn('absolute left-4 z-10 max-w-[calc(100%-2rem)]', compact ? 'top-2' : 'top-4')}>
        <div
          className={cn(
            'rounded-lg border font-bold tracking-wider',
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
            isDark
              ? 'border-violet-400/20 bg-violet-400/10 text-violet-300'
              : 'border-violet-400/30 bg-violet-400/15 text-violet-700',
          )}
        >
          {t.dashboardOverviewDistributionTitle}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {distributionSlides.length > 0 ? (
          <DistributionCarouselPanel
            slides={distributionSlides}
            resetKey="overview-bar"
            panelTitle={t.dashboardOverviewDistributionTitle}
            prevLabel={t.chainDistributionPrev}
            nextLabel={t.chainDistributionNext}
            isDark={isDark}
            legendPlacement="side"
            legendDensity="default"
            chartVariant="stackedBar"
            stackedBarOrientation="horizontal"
            bordered={false}
            showPanelTitle={false}
            className="min-h-0 w-full flex-1"
            chartClassName="h-full w-full min-h-0 flex-1"
          />
        ) : (
          <p className={`text-xs ${muted}`}>—</p>
        )}
      </div>
    </AgentDetailCard>
    </div>
  );
}
