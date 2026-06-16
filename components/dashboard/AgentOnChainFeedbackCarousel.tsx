'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import {
  formatFeedbackAvgScore,
  humanizeFeedbackTag,
  type OnChainFeedbackRow,
} from '@/lib/agentOnChainFeedbackSummary';
import { cn } from '@/lib/utils';

type Props = {
  rows: OnChainFeedbackRow[];
  isDark: boolean;
  t: Translations;
  resetKey?: string;
};

export function AgentOnChainFeedbackCarousel({ rows, isDark, t, resetKey }: Props) {
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
      <h3 className={sectionTitleClass}>{t.agentDetailOnChainFeedbackItemsTitle}</h3>
      {counter ? (
        <span className={`shrink-0 text-xs tabular-nums ${muted}`}>{counter}</span>
      ) : null}
    </div>
  );

  if (rows.length === 0) {
    return (
      <div>
        {sectionHeader(null)}
        <p className={`text-sm text-center ${muted}`}>{t.agentDetailOnChainFeedbackEmpty}</p>
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

  const categoryBadgeClass = isDark
    ? 'border-sky-500/35 bg-sky-500/10 text-sky-200'
    : 'border-sky-400/50 bg-sky-50 text-sky-800';

  const subcategoryBadgeClass = isDark
    ? 'border-violet-500/35 bg-violet-500/10 text-violet-200'
    : 'border-violet-400/50 bg-violet-50 text-violet-800';

  const categoryLabel = humanizeFeedbackTag(activeRow.category);
  const subcategoryLabel = activeRow.subcategory
    ? humanizeFeedbackTag(activeRow.subcategory)
    : t.notAvailable;

  const slideAriaLabel = (row: OnChainFeedbackRow, i: number) => {
    const sub = row.subcategory ? humanizeFeedbackTag(row.subcategory) : t.notAvailable;
    return `${humanizeFeedbackTag(row.category)} / ${sub} (${i + 1}/${rows.length})`;
  };

  return (
    <div>
      {sectionHeader(`${safeIndex + 1} / ${rows.length}`)}

      <div className="flex items-stretch gap-2">
        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goPrev}
            aria-label={t.agentDetailOnChainFeedbackPrev}
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
            <span className={`text-xs ${muted}`}>{t.agentDetailOnChainFeedbackCategoryLabel}:</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                categoryBadgeClass,
              )}
            >
              {categoryLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className={`text-xs ${muted}`}>
              {t.agentDetailOnChainFeedbackSubcategoryLabel}:
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                activeRow.subcategory ? subcategoryBadgeClass : isDark ? 'text-zinc-400' : 'text-zinc-600',
                activeRow.subcategory ? '' : 'border-transparent bg-transparent text-sm normal-case',
              )}
            >
              {subcategoryLabel}
            </span>
          </div>

          <div className="mt-4 text-center">
            <p className={`text-xs ${muted}`}>{t.agentDetailOnChainFeedbackAvgScoreLabel}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatFeedbackAvgScore(activeRow.avg_score)}
            </p>
          </div>
        </div>

        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goNext}
            aria-label={t.agentDetailOnChainFeedbackNext}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {rows.map((row, i) => (
            <button
              key={`${row.category}-${row.subcategory ?? 'none'}-${i}`}
              type="button"
              aria-label={slideAriaLabel(row, i)}
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
