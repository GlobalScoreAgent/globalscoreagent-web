'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import {
  formatProtocolAvgScore,
  formatProtocolRatePct,
  humanizeProtocolActivity,
  humanizeProtocolEntity,
  slidePaymentRate,
  slideValidRate,
  type ProtocolActivityRow,
} from '@/lib/agentProtocolActivitySummary';
import { cn } from '@/lib/utils';

type Props = {
  rows: ProtocolActivityRow[];
  isDark: boolean;
  t: Translations;
  resetKey?: string;
  formatDate: (iso: string | null | undefined) => string;
};

export function AgentProtocolActivityCarousel({
  rows,
  isDark,
  t,
  resetKey,
  formatDate,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const valueClass = isDark ? 'text-zinc-200' : 'text-zinc-900';
  const sectionTitleClass = cn(
    'text-xs font-semibold uppercase tracking-wide',
    isDark ? 'text-zinc-400' : 'text-zinc-600',
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [resetKey, rows.length]);

  const sectionHeader = (counter: string | null) => (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h3 className={sectionTitleClass}>{t.agentDetailProtocolActivityItemsTitle}</h3>
      {counter ? (
        <span className={`shrink-0 text-xs tabular-nums ${muted}`}>{counter}</span>
      ) : null}
    </div>
  );

  if (rows.length === 0) {
    return (
      <div>
        {sectionHeader(null)}
        <p className={`text-sm text-center ${muted}`}>{t.agentDetailProtocolActivityEmpty}</p>
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

  const entityBadgeClass = isDark
    ? 'border-sky-500/35 bg-sky-500/10 text-sky-200'
    : 'border-sky-400/50 bg-sky-50 text-sky-800';

  const activityBadgeClass = isDark
    ? 'border-violet-500/35 bg-violet-500/10 text-violet-200'
    : 'border-violet-400/50 bg-violet-50 text-violet-800';

  const validRateLabel = formatProtocolRatePct(
    slideValidRate(activeRow.count, activeRow.revoke_count),
  );
  const paymentRateLabel = formatProtocolRatePct(
    slidePaymentRate(activeRow.count, activeRow.payment_count),
  );

  const slideAriaLabel = (row: ProtocolActivityRow, i: number) =>
    `${humanizeProtocolEntity(row.entity)} / ${humanizeProtocolActivity(row.activity)} (${i + 1}/${rows.length})`;

  return (
    <div>
      {sectionHeader(`${safeIndex + 1} / ${rows.length}`)}

      <div className="flex items-stretch gap-2">
        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goPrev}
            aria-label={t.agentDetailProtocolActivityPrev}
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
            <span className={`text-xs ${muted}`}>{t.agentDetailProtocolActivityEntityLabel}:</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                entityBadgeClass,
              )}
            >
              {humanizeProtocolEntity(activeRow.entity)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className={`text-xs ${muted}`}>{t.agentDetailProtocolActivityActivityLabel}:</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                activityBadgeClass,
              )}
            >
              {humanizeProtocolActivity(activeRow.activity)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className={`text-xs ${muted}`}>{t.agentDetailProtocolActivityCountLabel}</p>
              <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>
                {activeRow.count.toLocaleString()}
              </p>
            </div>
            <div>
              <p className={`text-xs ${muted}`}>{t.agentDetailProtocolActivityAvgScoreLabel}</p>
              <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>
                {formatProtocolAvgScore(activeRow.avg_score)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
            <div>
              <p className={`text-xs ${muted}`}>{t.agentDetailProtocolActivityRevokeCountLabel}</p>
              <p className={cn('mt-1 font-semibold tabular-nums', valueClass)}>
                {activeRow.revoke_count.toLocaleString()}
              </p>
            </div>
            <div>
              <p className={`text-xs ${muted}`}>{t.agentDetailProtocolActivityPaymentCountLabel}</p>
              <p className={cn('mt-1 font-semibold tabular-nums', valueClass)}>
                {activeRow.payment_count.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
                {t.agentDetailProtocolActivitySlideValidRateLabel}
              </p>
              <p className={cn('mt-1 text-lg font-bold tabular-nums', valueClass)}>
                {validRateLabel}
              </p>
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
                {t.agentDetailProtocolActivitySlidePaymentRateLabel}
              </p>
              <p className={cn('mt-1 text-lg font-bold tabular-nums', valueClass)}>
                {paymentRateLabel}
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
              {t.agentDetailProtocolActivityLastAtLabel}
            </p>
            <p className={cn('mt-1 text-sm', valueClass)}>{formatDate(activeRow.last_at)}</p>
          </div>
        </div>

        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goNext}
            aria-label={t.agentDetailProtocolActivityNext}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {rows.map((row, i) => (
            <button
              key={`${row.entity}-${row.activity}-${i}`}
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
