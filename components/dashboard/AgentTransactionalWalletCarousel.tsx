'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { getHumiMaturityColor, getHumiMaturityText } from '@/lib/agentHumiDisplay';
import type { TransactionalWalletRow } from '@/lib/agentTransactionalWallets';
import { humanizeWalletCategory } from '@/lib/agentTransactionalWallets';
import {
  getWalletCategoryExplanation,
  type WalletCategoryLang,
} from '@/lib/walletTransactionalCategoryExplanations';
import { cn } from '@/lib/utils';

type BadgeMode = 'category' | 'maturity';

type Props = {
  rows: TransactionalWalletRow[];
  isDark: boolean;
  lang: WalletCategoryLang;
  t: Translations;
  resetKey?: string;
  onCopy: (text: string) => void;
  sectionTitle?: string | null;
  hideSectionTitle?: boolean;
  /** Hide WAMI score block (overview transactional card). */
  hideWamiScore?: boolean;
  /** Hide category badge (overview: category is per-chain, not per-wallet). */
  hideCategoryBadge?: boolean;
  badgeMode?: BadgeMode;
  controlledIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
};

export function AgentTransactionalWalletCarousel({
  rows,
  isDark,
  lang,
  t,
  resetKey,
  onCopy,
  sectionTitle,
  hideSectionTitle = false,
  hideWamiScore = false,
  hideCategoryBadge = false,
  badgeMode = 'category',
  controlledIndex,
  onIndexChange,
  className,
}: Props) {
  const [internalIndex, setInternalIndex] = useState(0);
  const isControlled = controlledIndex !== undefined;
  const activeIndex = isControlled ? controlledIndex : internalIndex;

  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const sectionTitleClass = cn(
    'text-xs font-semibold uppercase tracking-wide',
    isDark ? 'text-zinc-400' : 'text-zinc-600',
  );

  useEffect(() => {
    if (!isControlled) setInternalIndex(0);
  }, [resetKey, rows.length, isControlled]);

  const setIndex = (next: number) => {
    if (isControlled) {
      onIndexChange?.(next);
    } else {
      setInternalIndex(next);
    }
  };

  const resolvedSectionTitle =
    sectionTitle === null || hideSectionTitle
      ? null
      : sectionTitle ?? t.agentDetailWalletDetailsTitle;

  const sectionHeader = (counter: string | null) =>
    resolvedSectionTitle || counter ? (
      <div className="mb-4 flex items-center justify-between gap-2">
        {resolvedSectionTitle ? (
          <h3 className={sectionTitleClass}>{resolvedSectionTitle}</h3>
        ) : (
          <span />
        )}
        {counter ? (
          <span className={`shrink-0 text-xs tabular-nums ${muted}`}>{counter}</span>
        ) : null}
      </div>
    ) : null;

  if (rows.length === 0) {
    return (
      <div className={cn('mb-6', className)}>
        {sectionHeader(null)}
        <p className={`text-sm ${muted}`}>{t.agentDetailTransactionalWalletEmpty}</p>
      </div>
    );
  }

  const safeIndex = ((activeIndex % rows.length) + rows.length) % rows.length;
  const activeRow = rows[safeIndex];
  const canNavigate = rows.length > 1;

  const goPrev = () => {
    if (!canNavigate) return;
    setIndex((safeIndex - 1 + rows.length) % rows.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setIndex((safeIndex + 1) % rows.length);
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

  const maturityLevel = activeRow.maturity_level ?? null;
  const maturityColor = getHumiMaturityColor(maturityLevel, null);
  const maturityLabel = getHumiMaturityText(maturityLevel, null, t);

  const categoryBadgeClass = isDark
    ? 'border-sky-500/35 bg-sky-500/10 text-sky-200'
    : 'border-sky-400/50 bg-sky-50 text-sky-800';

  const badgeLabel =
    badgeMode === 'maturity' ? t.agentWamiWalletMaturityLabel : t.agentDetailTransactionalWalletCategoryLabel;

  return (
    <div className={cn('mb-6', className)}>
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

          {!hideWamiScore ? (
            <div className="mt-4 text-center">
              <p className={`text-xs ${muted}`}>{t.agentDetailTransactionalWalletWamiLabel}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {activeRow.wami_score !== null ? String(activeRow.wami_score) : t.notAvailable}
              </p>
            </div>
          ) : null}

          {!(hideCategoryBadge && badgeMode === 'category') ? (
          <div className={cn('flex flex-wrap items-center justify-center gap-1.5', 'mt-4')}>
            <span className={`text-xs ${muted}`}>{badgeLabel}:</span>
            {badgeMode === 'maturity' ? (
              maturityLabel ? (
                <span
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    borderColor: `${maturityColor}66`,
                    backgroundColor: `${maturityColor}1a`,
                    color: maturityColor,
                  }}
                >
                  {maturityLabel}
                </span>
              ) : (
                <span className={isDark ? 'text-zinc-400 text-sm' : 'text-zinc-600 text-sm'}>
                  {t.notAvailable}
                </span>
              )
            ) : categoryLabel ? (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  categoryBadgeClass,
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
          ) : null}
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
              onClick={() => setIndex(i)}
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
