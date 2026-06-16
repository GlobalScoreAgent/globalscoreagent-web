'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentDetailIndexScoreCard } from '@/components/dashboard/AgentDetailIndexScoreCard';
import { AgentHumiPillarBarChart } from '@/components/dashboard/AgentHumiPillarBarChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { WamiPillarChartPoint } from '@/lib/indexWamiPillars';
import { cn } from '@/lib/utils';

type Props = {
  onChainId: unknown;
  agentName: string;
  calculatedAt: string | null | undefined;
  calculatedAtLabel: string;
  formatDate: (dateString: string | null | undefined) => string;
  score: number;
  filterTier: string;
  filterLabel: string;
  accentColor: string;
  points: WamiPillarChartPoint[];
  isDark: boolean;
  locale: string;
  t: Translations;
};

export function AgentWamiAgentSummaryCard({
  onChainId,
  agentName,
  calculatedAt,
  calculatedAtLabel,
  formatDate,
  score,
  filterTier,
  filterLabel,
  accentColor,
  points,
  isDark,
  locale,
  t,
}: Props) {
  const cardInlay = dashboardCardInlayClass(isDark);
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const onChainIdText =
    onChainId !== null && onChainId !== undefined && String(onChainId).trim() !== ''
      ? String(onChainId)
      : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
      <div
        className={cn(
          cardInlay,
          'flex shrink-0 flex-col gap-3 p-4 sm:w-[min(100%,14rem)] lg:w-56',
        )}
      >
        {onChainIdText ? (
          <span
            className={cn(
              'w-fit max-w-full truncate rounded-full border px-3 py-1 font-mono text-xs',
              isDark
                ? 'border-gray-600 bg-white/5 text-gray-300'
                : 'border-zinc-300 bg-zinc-100 text-zinc-700',
            )}
          >
            {onChainIdText}
          </span>
        ) : null}
        <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">{agentName}</h1>
        <AgentDetailIndexScoreCard
          bare
          hideHeader
          categoryPlacement="below"
          score={score}
          filterTier={filterTier}
          filterLabel={filterLabel}
          accentColor={accentColor}
          notAvailableLabel={t.notAvailable}
          isDark={isDark}
          hidePlusButton
          density="compact"
        />
        <p className={cn('text-xs', muted)}>
          {calculatedAtLabel}{' '}
          <span className="tabular-nums">{formatDate(calculatedAt)}</span>
        </p>
      </div>
      <div className={cn(cardInlay, 'min-h-[14rem] h-56 min-w-0 flex-1 p-4')}>
        <AgentHumiPillarBarChart
          points={points}
          selectedPillarId={null}
          onPillarSelect={() => {}}
          isDark={isDark}
          locale={locale}
          emptyMessage={t.agentWamiPillarsEmpty}
          maxScoreLabel={t.agentWamiPillarMax}
          notAvailableLabel={t.notAvailable}
          orientation="vertical"
          interactive={false}
        />
      </div>
    </div>
  );
}
