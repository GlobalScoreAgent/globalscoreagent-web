'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { TransactionalWalletRow } from '@/lib/agentTransactionalWallets';
import { humanizeWalletCategory } from '@/lib/agentTransactionalWallets';
import {
  getWalletCategoryExplanation,
  type WalletCategoryLang,
} from '@/lib/walletTransactionalCategoryExplanations';
import { cn } from '@/lib/utils';

type Props = {
  rows: TransactionalWalletRow[];
  isDark: boolean;
  lang: WalletCategoryLang;
  t: Translations;
  resetKey?: string;
  onCopy: (text: string) => void;
};

export function AgentTransactionalWalletCarousel({
  rows,
  isDark,
  lang,
  t,
  resetKey,
  onCopy,
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
      <h3 className={sectionTitleClass}>{t.agentDetailWalletDetailsTitle}</h3>
      {counter ? (
        <span className={`shrink-0 text-xs tabular-nums ${muted}`}>{counter}</span>
      ) : null}
    </div>
  );

  if (rows.length === 0) {
    return (
      <div className="mb-6">
        {sectionHeader(null)}
        <p className={`text-sm ${muted}`}>{t.agentDetailTransactionalWalletEmpty}</p>
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

  const categoryLabel = activeRow.wallet_category
    ? humanizeWalletCategory(activeRow.wallet_category)
    : null;
  const categoryHelp =
    activeRow.wallet_category != null
      ? getWalletCategoryExplanation(activeRow.wallet_category, lang) ??
        t.agentDetailWalletCategoryExplanationFallback
      : null;

  const badgeClass = isDark
    ? 'border-sky-500/35 bg-sky-500/10 text-sky-200'
    : 'border-sky-400/50 bg-sky-50 text-sky-800';

  return (
    <div className="mb-6">
      {sectionHeader(`${safeIndex + 1} / ${rows.length}`)}

      <div className="flex items-stretch gap-2">
        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goPrev}
            aria-label={t.agentDetailTransactionalWalletPrev}
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
          <div className="flex items-start justify-center gap-2">
            <p
              className={cn(
                'min-w-0 flex-1 break-all text-center font-mono text-xs leading-relaxed',
                isDark ? 'text-zinc-200' : 'text-zinc-800',
              )}
            >
              {activeRow.address}
            </p>
            <button
              type="button"
              className={cn(
                'shrink-0 rounded-lg border p-1.5 transition-colors',
                isDark
                  ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  : 'border-zinc-300 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700',
              )}
              onClick={() => onCopy(activeRow.address)}
            >
              <Copy size={14} />
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className={`text-xs ${muted}`}>{t.agentDetailTransactionalWalletWamiLabel}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {activeRow.wami_score !== null ? String(activeRow.wami_score) : t.notAvailable}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <span className={`text-xs ${muted}`}>
              {t.agentDetailTransactionalWalletCategoryLabel}:
            </span>
            {categoryLabel ? (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  badgeClass,
                )}
              >
                {categoryLabel}
                {categoryHelp ? (
                  <DashboardInfoTooltip
                    content={categoryHelp}
                    ariaLabel={t.agentDetailWalletCategoryInfoAriaLabel}
                    isDark={isDark}
                    placement="top"
                    tooltipClassName="max-w-[16rem] whitespace-normal normal-case"
                  />
                ) : null}
              </span>
            ) : (
              <span className={isDark ? 'text-zinc-400 text-sm' : 'text-zinc-600 text-sm'}>
                {t.notAvailable}
              </span>
            )}
          </div>
        </div>

        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goNext}
            aria-label={t.agentDetailTransactionalWalletNext}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {rows.map((row, i) => (
            <button
              key={`${row.address}-${i}`}
              type="button"
              aria-label={`${row.address} (${i + 1}/${rows.length})`}
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
