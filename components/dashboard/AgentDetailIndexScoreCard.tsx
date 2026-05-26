'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import { cn } from '@/lib/utils';

type Props = {
  cardTitle?: string;
  cardHelpText?: string;
  score: number | null | undefined;
  filterTier: string;
  filterLabel: string;
  accentColor: string;
  plusAriaLabel?: string;
  detailsHref?: string;
  infoAriaLabel?: string;
  notAvailableLabel: string;
  isDark: boolean;
  className?: string;
  hidePlusButton?: boolean;
  hideHeader?: boolean;
  categoryPlacement?: 'below' | 'topRight';
  calculatedAt?: string | null;
  calculatedAtLabel?: string;
  formatDate?: (dateString: string | null | undefined) => string;
  /** When true, omit outer border/background (use inside AgentDetailCard). */
  bare?: boolean;
};

function formatScore(score: number | null | undefined): string | null {
  if (score === null || score === undefined) return null;
  const n = typeof score === 'number' ? score : Number(score);
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const plusBtnClass =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-sm transition-opacity';

function CategoryBadge({
  filterLabel,
  accentColor,
  className,
}: {
  filterLabel: string;
  accentColor: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex px-4 py-1.5 text-sm font-medium rounded-full border',
        className,
      )}
      style={{
        color: accentColor,
        borderColor: `${accentColor}55`,
        backgroundColor: `${accentColor}18`,
      }}
    >
      {filterLabel}
    </span>
  );
}

export function AgentDetailIndexScoreCard({
  cardTitle,
  cardHelpText,
  score,
  filterTier,
  filterLabel,
  accentColor,
  plusAriaLabel = '',
  detailsHref,
  infoAriaLabel = '',
  notAvailableLabel,
  isDark,
  className,
  hidePlusButton = false,
  hideHeader = false,
  categoryPlacement = 'below',
  calculatedAt,
  calculatedAtLabel,
  formatDate,
  bare = false,
}: Props) {
  const formattedScore = formatScore(score);
  const hasScore = formattedScore !== null;
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const plusEnabled = Boolean(detailsHref);
  const showCalculatedAt = Boolean(calculatedAtLabel && formatDate);
  const categoryTopRight = categoryPlacement === 'topRight';

  const plusControl = plusEnabled ? (
    <Link
      href={detailsHref!}
      className={cn(plusBtnClass, 'opacity-90 hover:opacity-100')}
      aria-label={plusAriaLabel}
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
    </Link>
  ) : (
    <button
      type="button"
      disabled
      className={cn(plusBtnClass, 'cursor-not-allowed opacity-40')}
      aria-label={plusAriaLabel}
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
    </button>
  );

  return (
    <div
      className={cn(
        'relative',
        !bare && [
          'rounded-2xl border p-4',
          isDark ? 'border-zinc-700/55 bg-zinc-900/40' : 'border-zinc-200/70 bg-white/85',
        ],
        bare && 'p-0',
        className,
      )}
    >
      {!hidePlusButton ? (
        <div className="absolute top-3 right-3 z-10">{plusControl}</div>
      ) : null}

      {filterTier && categoryTopRight ? (
        <div className="mb-3 flex justify-end">
          <CategoryBadge filterLabel={filterLabel} accentColor={accentColor} />
        </div>
      ) : null}

      {!hideHeader ? (
        <div className={cn('mb-3 flex items-center gap-1.5', !hidePlusButton && 'pr-10')}>
          <h3
            className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
          >
            {cardTitle}
          </h3>
          <DashboardInfoTooltip
            content={cardHelpText ?? ''}
            ariaLabel={infoAriaLabel}
            isDark={isDark}
            placement="top"
            tooltipClassName="max-w-[18rem] whitespace-normal"
          />
        </div>
      ) : null}

      <div
        className={cn(
          'flex items-baseline gap-0.5 tabular-nums',
          !hasScore && 'text-gray-400',
          hasScore && !filterTier && 'text-gray-300',
        )}
      >
        {hasScore ? (
          <>
            <span
              className="text-7xl font-bold leading-none"
              style={filterTier ? { color: accentColor } : undefined}
            >
              {formattedScore}
            </span>
            <span className={`text-2xl font-semibold leading-none ${muted}`}>/100</span>
          </>
        ) : (
          <span className="text-7xl font-bold leading-none">{notAvailableLabel}</span>
        )}
      </div>

      {filterTier && !categoryTopRight ? (
        <div className="mt-3">
          <CategoryBadge filterLabel={filterLabel} accentColor={accentColor} />
        </div>
      ) : null}

      {showCalculatedAt ? (
        <p className={cn('mt-4 text-xs', muted)}>
          {calculatedAtLabel}{' '}
          <span className="tabular-nums">{formatDate!(calculatedAt)}</span>
        </p>
      ) : null}
    </div>
  );
}
