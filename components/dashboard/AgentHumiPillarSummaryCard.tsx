'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentHumiPillarSummaryBarChart } from '@/components/dashboard/AgentHumiPillarSummaryBarChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { PillarSummaryBlockId, PillarSummaryChartPoint } from '@/lib/indexHumiPillarSummary';
import { hasPillarSummaryChartData } from '@/lib/indexHumiPillarSummary';
import type { IndexDetailCopy } from '@/lib/indexDetailCopy';
import { getHumiIndexDetailCopy } from '@/lib/indexDetailCopy';
import { dashboardFormHeadingClass } from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { cn } from '@/lib/utils';

type Props = {
  selectedPillarId: string | null;
  selectedBlockId?: PillarSummaryBlockId | null;
  onBlockSelect?: (id: PillarSummaryBlockId) => void;
  pillarLabel: string | null;
  summaryPoints: PillarSummaryChartPoint[];
  summaryMissing: boolean;
  isDark: boolean;
  locale: string;
  t?: Translations;
  copy?: IndexDetailCopy;
  subtitleExtra?: string | null;
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
  copy,
  subtitleExtra,
}: Props) {
  const c = copy ?? getHumiIndexDetailCopy(t as Translations);
  const cardInlay = dashboardCardInlayClass(isDark);
  const hasSelection = selectedPillarId !== null;
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const subtitleClass = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const hasChart = hasSelection && !summaryMissing && hasPillarSummaryChartData(summaryPoints);

  const subtitle =
    hasSelection && pillarLabel
      ? subtitleExtra
        ? `${subtitleExtra} · ${pillarLabel}`
        : pillarLabel
      : subtitleExtra;

  return (
    <>
      <div className="mb-4">
        <h2 className={cn('text-xl font-semibold', dashboardFormHeadingClass(isDark))}>
          {c.pillarSummaryTitle}
        </h2>
        {subtitle ? (
          <p className={cn('mt-1 text-sm font-medium', subtitleClass)}>{subtitle}</p>
        ) : null}
      </div>

      <div className={cn('h-60 p-4', cardInlay)}>
        {!hasSelection ? (
          <div className={cn('flex h-full items-center justify-center px-4 text-center text-sm', muted)}>
            {c.pillarTrendSelectPillar}
          </div>
        ) : summaryMissing ? (
          <div className={cn('flex h-full items-center justify-center px-4 text-center text-sm', muted)}>
            {c.pillarSummaryNoData}
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
            {c.pillarSummaryNoData}
          </div>
        )}
      </div>
    </>
  );
}
