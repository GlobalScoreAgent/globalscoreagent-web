'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentHumiPillarSummaryBarChart } from '@/components/dashboard/AgentHumiPillarSummaryBarChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { HumiPillarId } from '@/lib/indexHumiPillars';
import type { PillarSummaryBlockId, PillarSummaryChartPoint } from '@/lib/indexHumiPillarSummary';
import { hasPillarSummaryChartData } from '@/lib/indexHumiPillarSummary';
import { dashboardFormHeadingClass } from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { cn } from '@/lib/utils';

type Props = {
  selectedPillarId: HumiPillarId | null;
  selectedBlockId?: PillarSummaryBlockId | null;
  onBlockSelect?: (id: PillarSummaryBlockId) => void;
  pillarLabel: string | null;
  summaryPoints: PillarSummaryChartPoint[];
  summaryMissing: boolean;
  isDark: boolean;
  locale: string;
  t: Translations;
};

export function AgentHumiPillarSummaryCard({
  selectedPillarId,
  selectedBlockId = null,
  onBlockSelect,
  pillarLabel,
  summaryPoints,
  summaryMissing,
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
        <h2 className={cn('text-xl font-semibold', dashboardFormHeadingClass(isDark))}>
          {t.agentHumiPillarSummaryTitle}
        </h2>
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
            selectedBlockId={selectedBlockId}
            onBlockSelect={onBlockSelect}
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
