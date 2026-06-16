'use client';

import { useEffect, useRef, useState } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentHumiTrendChart } from '@/components/dashboard/AgentHumiTrendChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { HumiChartPoint } from '@/lib/indexHumiSeries';
import type { IndexDetailCopy } from '@/lib/indexDetailCopy';
import { getHumiIndexDetailCopy } from '@/lib/indexDetailCopy';
import { dashboardFormHeadingClass } from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { cn } from '@/lib/utils';

type ViewMode = 'daily' | 'monthly';
type TrendScope = 'index' | 'pillar';

type Props = {
  dailySeries: HumiChartPoint[];
  monthlySeries: HumiChartPoint[];
  accentColor: string;
  selectedPillarId: string | null;
  pillarLabel: string | null;
  pillarDailySeries: HumiChartPoint[];
  pillarMonthlySeries: HumiChartPoint[];
  pillarDailyRawMissing: boolean;
  pillarMonthlyRawMissing: boolean;
  pillarAccentColor: string;
  isDark: boolean;
  locale: string;
  t?: Translations;
  copy?: IndexDetailCopy;
  subtitleExtra?: string | null;
};

type ToggleOption<T extends string> = { value: T; label: string };

function TrendToggleGroup<T extends string>({
  groupLabel,
  value,
  options,
  onChange,
  isDark,
  mutedClassName,
}: {
  groupLabel: string;
  value: T;
  options: ToggleOption<T>[];
  onChange: (next: T) => void;
  isDark: boolean;
  mutedClassName: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span
        className={cn(
          'text-[10px] font-medium uppercase tracking-wide',
          mutedClassName,
        )}
      >
        {groupLabel}
      </span>
      <div
        role="group"
        aria-label={groupLabel}
        className={cn(
          'inline-flex max-w-full flex-wrap rounded-xl border p-1',
          isDark ? 'border-zinc-700/60 bg-white/5' : 'border-zinc-200 bg-zinc-100/80',
        )}
      >
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? isDark
                    ? 'bg-emerald-600/25 text-emerald-300 ring-1 ring-emerald-500/40'
                    : 'bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200'
                  : isDark
                    ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    : 'text-zinc-600 hover:bg-white/80 hover:text-zinc-900',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AgentHumiTrendCard({
  dailySeries,
  monthlySeries,
  accentColor,
  selectedPillarId,
  pillarLabel,
  pillarDailySeries,
  pillarMonthlySeries,
  pillarDailyRawMissing,
  pillarMonthlyRawMissing,
  pillarAccentColor,
  isDark,
  locale,
  t,
  copy,
  subtitleExtra,
}: Props) {
  const c = copy ?? getHumiIndexDetailCopy(t as Translations);
  const [scope, setScope] = useState<TrendScope>('index');
  const [view, setView] = useState<ViewMode>('daily');
  const cardInlay = dashboardCardInlayClass(isDark);
  const prevPillarRef = useRef<string | null>(null);
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const subtitleClass = isDark ? 'text-zinc-400' : 'text-zinc-500';

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

  const isPillarScope = scope === 'pillar';
  const hasPillarSelection = selectedPillarId !== null;

  const activeSeries = isPillarScope
    ? view === 'daily'
      ? pillarDailySeries
      : pillarMonthlySeries
    : view === 'daily'
      ? dailySeries
      : monthlySeries;

  const activeRawMissing = isPillarScope
    ? view === 'daily'
      ? pillarDailyRawMissing
      : pillarMonthlyRawMissing
    : false;

  const chartAccentColor = isPillarScope ? pillarAccentColor : accentColor;

  const scopeOptions: ToggleOption<TrendScope>[] = [
    { value: 'index', label: c.trendScopeIndex },
    { value: 'pillar', label: c.trendScopePillar },
  ];

  const periodOptions: ToggleOption<ViewMode>[] = [
    { value: 'daily', label: c.chart30d },
    { value: 'monthly', label: c.chartMonthly },
  ];

  return (
    <>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className={cn('shrink-0 text-2xl font-semibold', dashboardFormHeadingClass(isDark))}>
            {c.trendTitle}
          </h2>
          {isPillarScope && hasPillarSelection && pillarLabel ? (
            <p className={cn('mt-1 text-sm font-medium', subtitleClass)}>
              {subtitleExtra ? `${subtitleExtra} · ${pillarLabel}` : pillarLabel}
            </p>
          ) : subtitleExtra ? (
            <p className={cn('mt-1 text-sm font-medium', subtitleClass)}>{subtitleExtra}</p>
          ) : null}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-end sm:gap-4">
          <TrendToggleGroup
            groupLabel={c.trendScopeLabel}
            value={scope}
            options={scopeOptions}
            onChange={setScope}
            isDark={isDark}
            mutedClassName={muted}
          />
          <TrendToggleGroup
            groupLabel={c.trendPeriodLabel}
            value={view}
            options={periodOptions}
            onChange={setView}
            isDark={isDark}
            mutedClassName={muted}
          />
        </div>
      </div>

      <div className={cn('h-80 p-4', cardInlay)}>
        {isPillarScope && !hasPillarSelection ? (
          <div className={cn('flex h-full items-center justify-center px-4 text-center text-sm', muted)}>
            {c.pillarTrendSelectPillar}
          </div>
        ) : isPillarScope && activeRawMissing ? (
          <div className={cn('flex h-full items-center justify-center px-4 text-center text-sm', muted)}>
            {c.pillarTrendNoDbData}
          </div>
        ) : (
          <AgentHumiTrendChart
            data={activeSeries}
            accentColor={chartAccentColor}
            isDark={isDark}
            locale={locale}
            emptyMessage={c.chartEmpty}
            vsPreviousLabel={c.vsPreviousLabel}
            yDomain={isPillarScope ? [0, 25] : undefined}
          />
        )}
      </div>
    </>
  );
}
