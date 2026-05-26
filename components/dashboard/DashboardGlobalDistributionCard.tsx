'use client';

import { useMemo } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import {
  DistributionCarouselPanel,
  type DistributionCarouselSlide,
} from '@/components/dashboard/DistributionCarouselPanel';
import { cn } from '@/lib/utils';

export type GlobalDistributionStats = {
  humi_index_distribution: Record<string, number>;
  wami_index_distribution: Record<string, number>;
  agent_metadata_distribution: Record<
    string,
    { count: number; percentage: number } | undefined
  >;
};

const GLOBAL_HUMI_ORDER = [
  { rangeKey: '0-10', slug: 'r0_10', color: '#dc2626', labelKey: 'humiCritical' as const },
  { rangeKey: '10-30', slug: 'r10_30', color: '#f97316', labelKey: 'humiModerateRisk' as const },
  { rangeKey: '30-60', slug: 'r30_60', color: '#eab308', labelKey: 'humiStable' as const },
  { rangeKey: '60-80', slug: 'r60_80', color: '#84cc16', labelKey: 'humiHighPerformance' as const },
  { rangeKey: '80-100', slug: 'r80_100', color: '#22c55e', labelKey: 'humiElite' as const },
];

const GLOBAL_WAMI_ORDER = GLOBAL_HUMI_ORDER;

const GLOBAL_META_ORDER = [
  { dbKey: 'Mala', slug: 'mala', color: '#dc2626', labelKey: 'metadataPoor' as const },
  { dbKey: 'Baja', slug: 'baja', color: '#f97316', labelKey: 'metadataLow' as const },
  { dbKey: 'Regular', slug: 'regular', color: '#f59e0b', labelKey: 'metadataRegular' as const },
  { dbKey: 'Bueno', slug: 'bueno', color: '#10b981', labelKey: 'metadataGood' as const },
  { dbKey: 'Excelente', slug: 'excelente', color: '#3b82f6', labelKey: 'metadataExcellent' as const },
  { dbKey: 'Elite', slug: 'elite', color: '#a855f7', labelKey: 'metadataElite' as const },
];

function buildRangeStack(
  dist: Record<string, number>,
  order: typeof GLOBAL_HUMI_ORDER,
  rowName: string,
) {
  const row: Record<string, number | string> = { name: rowName };
  const rowKeys: string[] = [];
  for (const seg of order) {
    row[seg.slug] = Number(dist[seg.rangeKey]) || 0;
    rowKeys.push(seg.slug);
  }
  const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
  return { row, rowKeys, total };
}

type Props = {
  isDark: boolean;
  t: Translations;
  currentStats: GlobalDistributionStats;
  className?: string;
};

export function DashboardGlobalDistributionCard({ isDark, t, currentStats, className }: Props) {
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';

  const humiStack = useMemo(
    () => buildRangeStack(currentStats.humi_index_distribution ?? {}, GLOBAL_HUMI_ORDER, 'humi'),
    [currentStats.humi_index_distribution],
  );

  const wamiStack = useMemo(
    () => buildRangeStack(currentStats.wami_index_distribution ?? {}, GLOBAL_WAMI_ORDER, 'wami'),
    [currentStats.wami_index_distribution],
  );

  const metaStack = useMemo(() => {
    const md = currentStats.agent_metadata_distribution ?? {};
    const row: Record<string, number | string> = { name: 'meta' };
    const rowKeys: string[] = [];
    for (const seg of GLOBAL_META_ORDER) {
      const c = md[seg.dbKey]?.count;
      row[seg.slug] = c ?? 0;
      rowKeys.push(seg.slug);
    }
    const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
    return { row, rowKeys, total };
  }, [currentStats.agent_metadata_distribution]);

  const distributionSlides = useMemo((): DistributionCarouselSlide[] => {
    const humiLabelForKey = (slug: string) => {
      const seg = GLOBAL_HUMI_ORDER.find((s) => s.slug === slug);
      return seg ? `${seg.rangeKey} · ${t[seg.labelKey]}` : slug;
    };
    const wamiLabelForKey = (slug: string) => {
      const seg = GLOBAL_WAMI_ORDER.find((s) => s.slug === slug);
      return seg ? `${seg.rangeKey} · ${t[seg.labelKey]}` : slug;
    };
    const metaLabelForKey = (slug: string) => {
      const seg = GLOBAL_META_ORDER.find((s) => s.slug === slug);
      return seg ? t[seg.labelKey] : slug;
    };
    const humiColor = (slug: string) => GLOBAL_HUMI_ORDER.find((s) => s.slug === slug)?.color ?? '#71717a';
    const wamiColor = (slug: string) => GLOBAL_WAMI_ORDER.find((s) => s.slug === slug)?.color ?? '#71717a';
    const metaColor = (slug: string) => GLOBAL_META_ORDER.find((s) => s.slug === slug)?.color ?? '#71717a';

    const slides: DistributionCarouselSlide[] = [];
    if (humiStack.total > 0) {
      slides.push({
        id: 'humi',
        metricLabel: t.humiDistributionTitle,
        rowKeys: humiStack.rowKeys,
        row: humiStack.row,
        colors: humiColor,
        labelForKey: humiLabelForKey,
      });
    }
    if (metaStack.total > 0) {
      slides.push({
        id: 'meta',
        metricLabel: t.metadataRichnessTitle,
        rowKeys: metaStack.rowKeys,
        row: metaStack.row,
        colors: metaColor,
        labelForKey: metaLabelForKey,
      });
    }
    if (wamiStack.total > 0) {
      slides.push({
        id: 'wami',
        metricLabel: t.wamiDistributionTitle,
        rowKeys: wamiStack.rowKeys,
        row: wamiStack.row,
        colors: wamiColor,
        labelForKey: wamiLabelForKey,
      });
    }
    return slides;
  }, [humiStack, metaStack, wamiStack, t]);

  return (
    <AgentDetailCard
      isDark={isDark}
      variant="metadata"
      accentHex="#a855f7"
      className={cn('min-h-0 w-full min-w-0 flex-1', className)}
      contentClassName="flex flex-col gap-3 p-4 pt-14 sm:p-5 sm:pt-14"
    >
      <div className="absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)]">
        <div
          className={`rounded-lg border px-3 py-1 text-xs font-bold tracking-wider ${
            isDark ? 'border-violet-400/20 bg-violet-400/10 text-violet-300' : 'border-violet-400/30 bg-violet-400/15 text-violet-700'
          }`}
        >
          {t.dashboardOverviewDistributionTitle}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {distributionSlides.length > 0 ? (
          <DistributionCarouselPanel
            slides={distributionSlides}
            resetKey="overview"
            panelTitle={t.dashboardOverviewDistributionTitle}
            prevLabel={t.chainDistributionPrev}
            nextLabel={t.chainDistributionNext}
            isDark={isDark}
            legendPlacement="side"
            chartVariant="pie"
            bordered={false}
            showPanelTitle={false}
            className="min-h-[220px] sm:min-h-[260px]"
          />
        ) : (
          <p className={`text-xs ${muted}`}>—</p>
        )}
      </div>
    </AgentDetailCard>
  );
}
