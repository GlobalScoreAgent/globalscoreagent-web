'use client';

import type { HTMLAttributes } from 'react';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';

import AnimatedCounter from '@/app/(dashboard)/dashboard/components/AnimatedCounter';

import { cn } from '@/lib/utils';

type StatKey =
  | 'total_agents'
  | 'total_agents_active'
  | 'wallet_monitored'
  | 'owner_total'
  | 'agent_new'
  | 'feedback_new'
  | 'agents_with_feedback'
  | 'feedback_total';

type StatHalf = {
  key: StatKey;
  label: string;
  color: string;
};

type DualStatConfig = {
  left: StatHalf;
  right: StatHalf;
};

type DashboardStatsSnapshot = Record<StatKey, number> & Record<string, number | Record<string, number>>;

type Props = {
  currentStats: DashboardStatsSnapshot;
  isDark: boolean;
  t: Translations;
  locale?: string;
  section?: 'top' | 'bottom' | 'all';
  compact?: boolean;
  className?: string;
};

/** Yesterday in UTC (aligns with dashboard MV “previous day” counters). */
function formatYesterdayUtc(locale: string): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(d);
}

function DualStatCard({
  config,
  currentStats,
  isDark,
  compact = false,
  className,
  ...rest
}: {
  config: DualStatConfig;
  currentStats: DashboardStatsSnapshot;
  isDark: boolean;
  compact?: boolean;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const accentColor = config.left.color;

  return (
    <div
      {...rest}
      className={cn(
        'flex w-full flex-row items-stretch overflow-hidden border backdrop-blur-sm',
        compact && 'h-full',
        compact ? 'rounded-md' : 'rounded-lg',
        isDark ? 'border-zinc-700/50 bg-zinc-900/80' : 'border-zinc-200/50 bg-white/80',
        className,
      )}
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${config.left.color}15 0%, rgba(39,39,42,0.85) 30%, rgba(39,39,42,0.95) 70%, ${config.right.color}10 100%)`
          : `linear-gradient(135deg, ${config.left.color}20 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 70%, ${config.right.color}15 100%)`,
        boxShadow: isDark
          ? `0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}35`
          : `0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px ${accentColor}40`,
      }}
    >
      {[config.left, config.right].map((half, index) => (
        <div
          key={half.key}
          className={cn(
            'flex flex-1 flex-col items-center justify-center',
            compact ? 'gap-1 p-1.5' : 'gap-1 p-2',
            index === 0 && 'border-r',
            isDark ? 'border-zinc-700/50' : 'border-zinc-200/50',
          )}
        >
          <p
            className={cn(
              'text-center font-black tabular-nums leading-none',
              compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl',
              isDark ? 'text-white' : 'text-zinc-900',
            )}
            suppressHydrationWarning
          >
            <AnimatedCounter
              end={(() => {
                const value = currentStats[half.key];
                return typeof value === 'number' ? value : 0;
              })()}
            />
          </p>
          <div className="flex justify-center">
            <span
              className={cn(
                'rounded-md font-semibold leading-tight',
                compact ? 'px-2 py-0.5 text-xs sm:text-sm' : 'px-2 py-0.5 text-xs',
              )}
              style={{
                color: half.color,
                backgroundColor: `${half.color}18`,
                border: `1px solid ${half.color}40`,
              }}
            >
              {half.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardStatsGrid({
  currentStats,
  isDark,
  t,
  locale = 'en-US',
  section = 'all',
  compact = false,
  className,
}: Props) {
  const yesterdayLabel = formatYesterdayUtc(locale);
  const dualCards: DualStatConfig[] = [
    {
      left: { key: 'total_agents', label: t.registeredAgents, color: '#facc15' },
      right: { key: 'total_agents_active', label: t.activeAgents, color: '#22c55e' },
    },
    {
      left: { key: 'owner_total', label: t.dashboardKpiOwnerTotal, color: '#06b6d4' },
      right: { key: 'wallet_monitored', label: t.monitoredWallets, color: '#a855f7' },
    },
    {
      left: {
        key: 'agent_new',
        label: `${t.dashboardKpiAgentNew} · ${yesterdayLabel}`,
        color: '#f97316',
      },
      right: {
        key: 'feedback_new',
        label: `${t.dashboardKpiFeedbackNew} · ${yesterdayLabel}`,
        color: '#ec4899',
      },
    },
    {
      left: {
        key: 'agents_with_feedback',
        label: t.dashboardKpiAgentsWithFeedback,
        color: '#14b8a6',
      },
      right: {
        key: 'feedback_total',
        label: t.dashboardKpiFeedbackTotal,
        color: '#3b82f6',
      },
    },
  ];

  const visibleCards =
    section === 'top'
      ? dualCards.slice(0, 2)
      : section === 'bottom'
        ? dualCards.slice(2, 4)
        : dualCards;

  const gridClass =
    section === 'all'
      ? 'grid-cols-1 sm:grid-cols-2 grid-rows-none sm:grid-rows-2'
      : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={cn('grid w-full', compact && 'h-full', compact ? 'gap-1.5' : 'gap-2', gridClass, className)}>
      {visibleCards.map((config) => (
        <DualStatCard
          key={`${config.left.key}-${config.right.key}`}
          config={config}
          currentStats={currentStats}
          isDark={isDark}
          compact={compact}
        />
      ))}
    </div>
  );
}
