'use client';

import { useMemo } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import {
  DistributionCarouselPanel,
  type DistributionCarouselSlide,
} from '@/components/dashboard/DistributionCarouselPanel';
import {
  MATURITY_ORDER,
  normalizeMaturityDistribution,
} from '@/lib/dashboardMaturityDistribution';
import {
  METADATA_ORDER,
  normalizeMetadataDistribution,
} from '@/lib/dashboardMetadataDistribution';
import { cn } from '@/lib/utils';

export type GlobalDistributionStats = {
  humi_index_distribution: Record<string, number>;
  wami_index_distribution: Record<string, number>;
  agent_metadata_distribution: Record<string, number>;
};

function buildMaturityStack(dist: Record<string, number>, rowName: string) {
  const normalized = normalizeMaturityDistribution(dist);
  const row: Record<string, number | string> = { name: rowName };
  const rowKeys: string[] = [];
  for (const seg of MATURITY_ORDER) {
    row[seg.key] = normalized[seg.key] ?? 0;
    rowKeys.push(seg.key);
  }
  const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
  return { row, rowKeys, total };
}

function buildMetadataStack(dist: Record<string, number>) {
  const normalized = normalizeMetadataDistribution(dist);
  const row: Record<string, number | string> = { name: 'meta' };
  const rowKeys: string[] = [];
  for (const seg of METADATA_ORDER) {
    row[seg.key] = normalized[seg.key] ?? 0;
    rowKeys.push(seg.key);
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
    () => buildMaturityStack(currentStats.humi_index_distribution ?? {}, 'humi'),
    [currentStats.humi_index_distribution],
  );

  const wamiStack = useMemo(
    () => buildMaturityStack(currentStats.wami_index_distribution ?? {}, 'wami'),
    [currentStats.wami_index_distribution],
  );

  const metaStack = useMemo(
    () => buildMetadataStack(currentStats.agent_metadata_distribution ?? {}),
    [currentStats.agent_metadata_distribution],
  );

  const distributionSlides = useMemo((): DistributionCarouselSlide[] => {
    const maturityLabelForKey = (key: string) => {
      const seg = MATURITY_ORDER.find((s) => s.key === key);
      return seg ? `${seg.scoreRange} · ${t[seg.labelKey]}` : key;
    };
    const maturityColor = (key: string) =>
      MATURITY_ORDER.find((s) => s.key === key)?.color ?? '#71717a';

    const metaLabelForKey = (key: string) => {
      const seg = METADATA_ORDER.find((s) => s.key === key);
      return seg ? `${seg.scoreRange} · ${t[seg.labelKey]}` : key;
    };
    const metaColor = (key: string) =>
      METADATA_ORDER.find((s) => s.key === key)?.color ?? '#71717a';

    const slides: DistributionCarouselSlide[] = [];
    if (humiStack.total > 0) {
      slides.push({
        id: 'humi',
        metricLabel: t.humiDistributionTitle,
        rowKeys: humiStack.rowKeys,
        row: humiStack.row,
        colors: maturityColor,
        labelForKey: maturityLabelForKey,
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
        colors: maturityColor,
        labelForKey: maturityLabelForKey,
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
      contentClassName="flex min-h-[280px] flex-col gap-3 p-4 pt-14 sm:p-5 sm:pt-14"
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
            legendDensity="comfortable"
            chartVariant="pie"
            bordered={false}
            showPanelTitle={false}
            pieInnerRadius="40%"
            pieOuterRadius="88%"
            className="min-h-[280px] flex-1 sm:min-h-[320px]"
            chartClassName="flex-1"
          />
        ) : (
          <p className={`text-xs ${muted}`}>—</p>
        )}
      </div>
    </AgentDetailCard>
  );
}
