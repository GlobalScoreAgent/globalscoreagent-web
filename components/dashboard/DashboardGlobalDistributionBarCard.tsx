'use client';

import { useMemo } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import {
  DashboardPremiumDonut,
  type PremiumDonutSegment,
} from '@/components/dashboard/DashboardPremiumDonut';
import {
  buildGlobalDistributionSlide,
  type GlobalDistributionMetric,
  type GlobalDistributionStats,
} from '@/lib/dashboardOverviewDistribution';
import { cn } from '@/lib/utils';

const METRIC_ACCENT: Record<
  GlobalDistributionMetric,
  { accentHex: string; badgeDark: string; badgeLight: string }
> = {
  humi: {
    accentHex: '#34d399',
    badgeDark: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    badgeLight: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-700',
  },
  wami: {
    accentHex: '#60a5fa',
    badgeDark: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
    badgeLight: 'border-sky-400/30 bg-sky-400/15 text-sky-700',
  },
  meta: {
    accentHex: '#a855f7',
    badgeDark: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
    badgeLight: 'border-violet-400/30 bg-violet-400/15 text-violet-700',
  },
};

type Props = {
  metric: GlobalDistributionMetric;
  isDark: boolean;
  t: Translations;
  currentStats: GlobalDistributionStats;
  locale: string;
  compact?: boolean;
  className?: string;
};

export function DashboardGlobalDistributionBarCard({
  metric,
  isDark,
  t,
  currentStats,
  locale,
  compact = false,
  className,
}: Props) {
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const accent = METRIC_ACCENT[metric];

  const slide = useMemo(
    () => buildGlobalDistributionSlide(currentStats, t, metric),
    [currentStats, t, metric],
  );

  const segments = useMemo((): PremiumDonutSegment[] => {
    if (!slide) return [];
    return slide.rowKeys
      .map((key) => {
        const value = Number(slide.row[key]) || 0;
        if (value <= 0) return null;
        return {
          key,
          name: slide.labelForKey(key),
          value,
          color: slide.colors(key),
        };
      })
      .filter((s): s is PremiumDonutSegment => s != null);
  }, [slide]);

  return (
    <div className={cn('flex h-full min-h-0 w-full flex-col', className)}>
      <AgentDetailCard
        isDark={isDark}
        variant="metadata"
        accentHex={accent.accentHex}
        className="flex h-full min-h-0 w-full flex-1 flex-col"
        contentClassName={cn(
          'flex h-full min-h-0 flex-1 flex-col',
          compact ? 'gap-2 p-3 pt-9' : 'gap-3 p-4 pt-14 sm:p-5 sm:pt-14',
        )}
      >
        <div className={cn('absolute left-4 z-10 max-w-[calc(100%-2rem)]', compact ? 'top-2' : 'top-4')}>
          <div
            className={cn(
              'rounded-lg border font-bold tracking-wider',
              compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
              isDark ? accent.badgeDark : accent.badgeLight,
            )}
          >
            {slide?.metricLabel ??
              (metric === 'humi'
                ? t.humiDistributionTitle
                : metric === 'wami'
                  ? t.wamiDistributionTitle
                  : t.metadataRichnessTitle)}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {slide && segments.length > 0 ? (
            <DashboardPremiumDonut
              segments={segments}
              isDark={isDark}
              locale={locale}
              totalLabel={t.distributionDonutTotalLabel}
              segmentsLabel={t.distributionDonutSegmentsLabel}
              className="min-h-0 w-full flex-1"
            />
          ) : (
            <p className={`text-xs ${muted}`}>—</p>
          )}
        </div>
      </AgentDetailCard>
    </div>
  );
}
