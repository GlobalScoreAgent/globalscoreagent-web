'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { OwnerWalletDetailRow, OwnerWalletType } from '@/lib/agentOwnerWalletDetails';
import { cn } from '@/lib/utils';

type Props = {
  rows: OwnerWalletDetailRow[];
  isDark: boolean;
  t: Translations;
  formatDate: (iso: string) => string;
  resetKey?: string;
};

function walletTypeLabel(type: OwnerWalletType, t: Translations): string {
  return type === 'active'
    ? t.agentDetailOwnerWalletTypeActive
    : t.agentDetailOwnerWalletTypeHolder;
}

function walletTypeHelp(type: OwnerWalletType, t: Translations): string {
  return type === 'active'
    ? t.agentDetailOwnerWalletTypeActiveHelp
    : t.agentDetailOwnerWalletTypeHolderHelp;
}

function walletTypeStyles(type: OwnerWalletType, isDark: boolean): string {
  if (type === 'active') {
    return isDark
      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
      : 'border-emerald-400/50 bg-emerald-50 text-emerald-800';
  }
  return isDark
    ? 'border-zinc-600/50 bg-zinc-800/50 text-zinc-300'
    : 'border-zinc-300 bg-zinc-100 text-zinc-700';
}

export function OwnerWalletChainActivityCarousel({
  rows,
  isDark,
  t,
  formatDate,
  resetKey,
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
      <h3 className={sectionTitleClass}>{t.agentDetailOwnerActivityTitle}</h3>
      {counter ? (
        <span className={`shrink-0 text-xs tabular-nums ${muted}`}>{counter}</span>
      ) : null}
    </div>
  );

  if (rows.length === 0) {
    return (
      <div>
        {sectionHeader(null)}
        <p className={`text-sm ${muted}`}>{t.agentDetailOwnerActivityEmpty}</p>
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

  return (
    <div>
      {sectionHeader(`${safeIndex + 1} / ${rows.length}`)}

      <div className="flex items-stretch gap-2">
        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goPrev}
            aria-label={t.agentDetailOwnerActivityPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}

        <div
          className={cn(
            'min-w-0 flex-1 rounded-xl border px-4 py-4 text-center',
            isDark ? 'border-zinc-700/55 bg-zinc-950/40' : 'border-zinc-200/80 bg-zinc-50/80',
          )}
        >
          <p className="text-base font-semibold leading-snug">{activeRow.chain_name}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                walletTypeStyles(activeRow.owner_wallet_type, isDark),
              )}
            >
              {walletTypeLabel(activeRow.owner_wallet_type, t)}
              <DashboardInfoTooltip
                content={walletTypeHelp(activeRow.owner_wallet_type, t)}
                ariaLabel={t.agentDetailOwnerWalletTypeInfoAriaLabel}
                isDark={isDark}
                placement="top"
                tooltipClassName="max-w-[14rem] whitespace-normal normal-case"
              />
            </span>
          </div>
          <p className={`mt-3 text-xs ${muted}`}>
            {t.agentDetailOwnerFirstActivity}:{' '}
            <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
              {formatDate(activeRow.owner_first_activity_at)}
            </span>
          </p>
        </div>

        {canNavigate ? (
          <button
            type="button"
            className={navBtnClass}
            onClick={goNext}
            aria-label={t.agentDetailOwnerActivityNext}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {rows.map((row, i) => (
            <button
              key={`${row.chain_name}-${row.owner_first_activity_at}`}
              type="button"
              aria-label={`${row.chain_name} (${i + 1}/${rows.length})`}
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
