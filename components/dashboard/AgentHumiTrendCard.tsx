'use client';

import { useState } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentHumiTrendChart } from '@/components/dashboard/AgentHumiTrendChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { HumiChartPoint } from '@/lib/indexHumiSeries';
import { cn } from '@/lib/utils';

type ViewMode = 'daily' | 'monthly';

type Props = {
  dailySeries: HumiChartPoint[];
  monthlySeries: HumiChartPoint[];
  accentColor: string;
  isDark: boolean;
  locale: string;
  t: Translations;
};

export function AgentHumiTrendCard({
  dailySeries,
  monthlySeries,
  accentColor,
  isDark,
  locale,
  t,
}: Props) {
  const [view, setView] = useState<ViewMode>('daily');
  const cardInlay = dashboardCardInlayClass(isDark);

  const activeSeries = view === 'daily' ? dailySeries : monthlySeries;

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
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="shrink-0 text-2xl font-semibold">{t.agentHumiChartTitle}</h2>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {toggleBtn('daily', t.agentHumiChart30d)}
          {toggleBtn('monthly', t.agentHumiChartMonthly)}
        </div>
      </div>

      <div className={cn('h-80 p-4', cardInlay)}>
        <AgentHumiTrendChart
          data={activeSeries}
          accentColor={accentColor}
          isDark={isDark}
          locale={locale}
          emptyMessage={t.agentHumiChartEmpty}
          vsPreviousLabel={t.transactionalDeltaVsPrevious}
        />
      </div>
    </>
  );
}
