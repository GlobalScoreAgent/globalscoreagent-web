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
  /** When set, «+» runs this instead of navigating via detailsHref. */
  onPlusClick?: () => void;
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
  density?: 'default' | 'compact';
  align?: 'start' | 'end';
  tooltipClassName?: string;
  badgeHelpText?: string;
  badgeInfoAriaLabel?: string;
  hideCategory?: boolean;
};

function formatScore(score: number | null | undefined): string | null {
  if (score === null || score === undefined) return null;
  const n = typeof score === 'number' ? score : Number(score);
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const plusBtnClass =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-sm transition-opacity';

export function AgentDetailCategoryBadge({
  filterLabel,
  accentColor,
  className,
  compact = false,
}: {
  filterLabel: string;
  accentColor: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex font-medium rounded-full border',
        compact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
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
  onPlusClick,
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
  density = 'default',
  align = 'start',
  tooltipClassName,
  badgeHelpText,
  badgeInfoAriaLabel = '',
  hideCategory = false,
}: Props) {
  const formattedScore = formatScore(score);
  const hasScore = formattedScore !== null;
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const showCalculatedAt = Boolean(calculatedAtLabel && formatDate);
  const compact = density === 'compact';
  const alignEnd = align === 'end';

  const plusControl = onPlusClick ? (
    <button
      type="button"
      onClick={onPlusClick}
      className={cn(plusBtnClass, 'opacity-90 hover:opacity-100')}
      aria-label={plusAriaLabel}
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
    </button>
  ) : detailsHref ? (
    <Link
      href={detailsHref}
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

  const renderCategoryRow = (position: 'topRight' | 'below') => {
    if (hideCategory) return null;
    if (!filterTier) return null;
    if (categoryPlacement !== position) return null;

    return (
      <div
        className={cn(
          'flex items-center gap-1.5',
          position === 'topRight' ? 'mb-2' : 'mt-3',
          alignEnd && 'justify-end',
        )}
      >
        <AgentDetailCategoryBadge
          filterLabel={filterLabel}
          accentColor={accentColor}
          compact={compact}
        />
        {badgeHelpText ? (
          <DashboardInfoTooltip
            content={badgeHelpText}
            ariaLabel={badgeInfoAriaLabel}
            isDark={isDark}
            placement="top"
            tooltipClassName="max-w-[18rem] whitespace-normal"
          />
        ) : null}
      </div>
    );
  };

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

      {renderCategoryRow('topRight')}

      {!hideHeader ? (
        <div
          className={cn(
            'mb-2 flex items-center gap-1.5',
            alignEnd && 'justify-end',
            !hidePlusButton && 'pr-10',
          )}
        >
          <h3
            className={cn(
              'font-semibold uppercase tracking-wide',
              compact ? 'text-[10px]' : 'text-xs',
              isDark ? 'text-zinc-400' : 'text-zinc-600',
            )}
          >
            {cardTitle}
          </h3>
          <DashboardInfoTooltip
            content={cardHelpText ?? ''}
            ariaLabel={infoAriaLabel}
            isDark={isDark}
            placement="top"
            tooltipClassName={cn('max-w-[18rem] whitespace-normal', tooltipClassName)}
          />
        </div>
      ) : null}

      <div
        className={cn(
          'flex items-baseline gap-0.5 tabular-nums',
          alignEnd && 'justify-end',
          !hasScore && 'text-gray-400',
          hasScore && !filterTier && 'text-gray-300',
        )}
      >
        {hasScore ? (
          <>
            <span
              className={cn(
                'font-bold leading-none',
                compact ? 'text-4xl' : 'text-7xl',
              )}
              style={filterTier ? { color: accentColor } : undefined}
            >
              {formattedScore}
            </span>
            <span
              className={cn(
                'font-semibold leading-none',
                compact ? 'text-lg' : 'text-2xl',
                muted,
              )}
            >
              /100
            </span>
          </>
        ) : (
          <span className={cn('font-bold leading-none', compact ? 'text-2xl' : 'text-7xl')}>
            {notAvailableLabel}
          </span>
        )}
      </div>

      {renderCategoryRow('below')}

      {showCalculatedAt ? (
        <p className={cn('mt-4 text-xs', muted)}>
          {calculatedAtLabel}{' '}
          <span className="tabular-nums">{formatDate!(calculatedAt)}</span>
        </p>
      ) : null}
    </div>
  );
}
