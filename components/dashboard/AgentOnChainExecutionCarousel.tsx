'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import {
  humanizeExecutionCategory,
  type OnChainExecutionRow,
} from '@/lib/agentOnChainExecutionSummary';
import { cn } from '@/lib/utils';

type Props = {
  rows: OnChainExecutionRow[];
  isDark: boolean;
  t: Translations;
  resetKey?: string;
  formatDate: (iso: string | null | undefined) => string;
};

export function AgentOnChainExecutionCarousel({
  rows,
  isDark,
  t,
  resetKey,
  formatDate,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const sectionTitleClass = cn(
    'text-xs font-semibold uppercase tracking-wide',
    isDark ? 'text-zinc-400' : 'text-zinc-600',
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [resetKey, rows.length]);

  const sectionHeader = (counter: string | null) => (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h3 className={sectionTitleClass}>{t.agentDetailOnChainExecutionCategoriesTitle}</h3>
      {counter ? (
        <span className={`shrink-0 text-xs tabular-nums ${muted}`}>{counter}</span>
      ) : null}
    </div>
  );

  if (rows.length === 0) {
    return (
      <div>
        {sectionHeader(null)}
        <p className={`text-sm text-center ${muted}`}>{t.agentDetailOnChainExecutionEmpty}</p>
      </div>
    );
  }

  const safeIndex = activeIndex % rows.length;
  const activeRow = rows[safeIndex];
  const canNavigate = rows.length > 1;

  const goPrev = () => {
    if (!canNavigate) return;
    setActiveIndex((i) => (i - 1 + rows.length) % rows.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setActiveIndex((i) => (i + 1) % rows.length);
  };

  const navBtnClass = cn(
    'rounded-lg border p-1.5 transition-colors shrink-0',
    isDark
      ? 'border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
      : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50',
  );

  const badgeClass = isDark
    ? 'border-sky-500/35 bg-sky-500/10 text-sky-200'
    : 'border-sky-400/50 bg-sky-50 text-sky-800';

  const categoryLabel = humanizeExecutionCategory(activeRow.category);

  return (
    <div>
      {sectionHeader(`${safeIndex + 1} / ${rows.length}`)}

      <div className="flex items-stretch gap-2">
        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goPrev}
            aria-label={t.agentDetailOnChainExecutionPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}

        <div
          className={cn(
            'min-w-0 flex-1 rounded-xl border px-4 py-4',
            isDark ? 'border-zinc-700/55 bg-zinc-950/40' : 'border-zinc-200/80 bg-zinc-50/80',
          )}
        >
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className={`text-xs ${muted}`}>
              {t.agentDetailOnChainExecutionCategoryLabel}:
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                badgeClass,
              )}
            >
              {categoryLabel}
            </span>
          </div>

          <div className="mt-4 text-center">
            <p className={`text-xs ${muted}`}>{t.agentDetailOnChainExecutionCountLabel}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {activeRow.count.toLocaleString()}
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
              {t.agentDetailOnChainExecutionLastAtLabel}
            </p>
            <p className={cn('mt-1 text-sm', isDark ? 'text-zinc-200' : 'text-zinc-900')}>
              {formatDate(activeRow.last_at)}
            </p>
          </div>
        </div>

        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goNext}
            aria-label={t.agentDetailOnChainExecutionNext}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {rows.map((row, i) => (
            <button
              key={`${row.category}-${i}`}
              type="button"
              aria-label={`${humanizeExecutionCategory(row.category)} (${i + 1}/${rows.length})`}
              aria-current={i === safeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                i === safeIndex
                  ? isDark
                    ? 'bg-sky-400'
                    : 'bg-sky-600'
                  : isDark
                    ? 'bg-zinc-600 hover:bg-zinc-500'
                    : 'bg-zinc-300 hover:bg-zinc-400',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
