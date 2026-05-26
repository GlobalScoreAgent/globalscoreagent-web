'use client';

import { useEffect, useRef, useState } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentHumiTrendChart } from '@/components/dashboard/AgentHumiTrendChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { HumiPillarId } from '@/lib/indexHumiPillars';
import type { HumiChartPoint } from '@/lib/indexHumiSeries';
import { cn } from '@/lib/utils';

type ViewMode = 'daily' | 'monthly';

type Props = {
  selectedPillarId: HumiPillarId | null;
  pillarLabel: string | null;
  dailySeries: HumiChartPoint[];
  monthlySeries: HumiChartPoint[];
  dailyRawMissing: boolean;
  monthlyRawMissing: boolean;
  accentColor: string;
  isDark: boolean;
  locale: string;
  t: Translations;
};

export function AgentHumiPillarTrendCard({
  selectedPillarId,
  pillarLabel,
  dailySeries,
  monthlySeries,
  dailyRawMissing,
  monthlyRawMissing,
  accentColor,
  isDark,
  locale,
  t,
}: Props) {
  const [view, setView] = useState<ViewMode>('daily');
  const cardInlay = dashboardCardInlayClass(isDark);
  const prevPillarRef = useRef<HumiPillarId | null>(null);

  useEffect(() => {
    if (
      selectedPillarId !== null &&
      prevPillarRef.current !== null &&
      selectedPillarId !== prevPillarRef.current
    ) {
      setView('daily');
    }
    prevPillarRef.current = selectedPillarId;
  }, [selectedPillarId]);

  const hasSelection = selectedPillarId !== null;
  const activeSeries = view === 'daily' ? dailySeries : monthlySeries;
  const activeRawMissing = view === 'daily' ? dailyRawMissing : monthlyRawMissing;
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const subtitleClass = isDark ? 'text-zinc-400' : 'text-zinc-500';

  const toggleBtn = (mode: ViewMode, label: string) => {
    const active = view === mode;
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => setView(mode)}
        className={cn(
          'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
          active
            ? isDark
              ? 'bg-emerald-600/25 text-emerald-300 ring-1 ring-emerald-500/40'
              : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
            : isDark
              ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 shrink-0">
        <h2 className="text-2xl font-semibold">{t.agentHumiPillarTrendTitle}</h2>
        {hasSelection && pillarLabel ? (
          <p className={cn('mt-1 text-sm font-medium', subtitleClass)}>{pillarLabel}</p>
        ) : null}
      </div>

      {hasSelection ? (
        <div className="mb-6 flex shrink-0 flex-wrap items-center justify-end gap-1">
          {toggleBtn('daily', t.agentHumiChart30d)}
          {toggleBtn('monthly', t.agentHumiChartMonthly)}
        </div>
      ) : null}

      <div className={cn('min-h-0 flex-1 p-4', cardInlay)}>
        {!hasSelection ? (
          <div className={cn('flex h-full items-center justify-center px-4 text-center text-sm', muted)}>
            {t.agentHumiPillarTrendSelectPillar}
          </div>
        ) : activeRawMissing ? (
          <div className={cn('flex h-full items-center justify-center px-4 text-center text-sm', muted)}>
            {t.agentHumiPillarTrendNoDbData}
          </div>
        ) : (
          <AgentHumiTrendChart
            data={activeSeries}
            accentColor={accentColor}
            isDark={isDark}
            locale={locale}
            emptyMessage={t.agentHumiChartEmpty}
            vsPreviousLabel={t.transactionalDeltaVsPrevious}
            yDomain={[0, 25]}
          />
        )}
      </div>
    </div>
  );
}
