'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentHumiPillarSummaryBarChart } from '@/components/dashboard/AgentHumiPillarSummaryBarChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { HumiPillarId } from '@/lib/indexHumiPillars';
import type { PillarSummaryChartPoint } from '@/lib/indexHumiPillarSummary';
import { hasPillarSummaryChartData } from '@/lib/indexHumiPillarSummary';
import { cn } from '@/lib/utils';

type Props = {
  selectedPillarId: HumiPillarId | null;
  pillarLabel: string | null;
  summaryPoints: PillarSummaryChartPoint[];
  summaryMissing: boolean;
  accentColor: string;
  isDark: boolean;
  locale: string;
  t: Translations;
};

export function AgentHumiPillarSummaryCard({
  selectedPillarId,
  pillarLabel,
  summaryPoints,
  summaryMissing,
  accentColor,
  isDark,
  locale,
  t,
}: Props) {
  const cardInlay = dashboardCardInlayClass(isDark);
  const hasSelection = selectedPillarId !== null;
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const subtitleClass = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const hasChart = hasSelection && !summaryMissing && hasPillarSummaryChartData(summaryPoints);

  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{t.agentHumiPillarSummaryTitle}</h2>
        {hasSelection && pillarLabel ? (
          <p className={cn('mt-1 text-sm font-medium', subtitleClass)}>{pillarLabel}</p>
        ) : null}
      </div>

      <div className={cn('h-60 p-4', cardInlay)}>
        {!hasSelection ? (
          <div className={cn('flex h-full items-center justify-center px-4 text-center text-sm', muted)}>
            {t.agentHumiPillarTrendSelectPillar}
          </div>
        ) : summaryMissing ? (
          <div className={cn('flex h-full items-center justify-center px-4 text-center text-sm', muted)}>
            {t.agentHumiPillarSummaryNoData}
          </div>
        ) : hasChart ? (
          <AgentHumiPillarSummaryBarChart
            points={summaryPoints}
            accentColor={accentColor}
            isDark={isDark}
            locale={locale}
          />
        ) : (
          <div className={cn('flex h-full items-center justify-center px-4 text-center text-sm', muted)}>
            {t.agentHumiPillarSummaryNoData}
          </div>
        )}
      </div>
    </>
  );
}
