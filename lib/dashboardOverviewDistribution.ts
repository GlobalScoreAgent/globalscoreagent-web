import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { DistributionCarouselSlide } from '@/components/dashboard/DistributionCarouselPanel';
import {
  MATURITY_ORDER,
  normalizeMaturityDistribution,
} from '@/lib/dashboardMaturityDistribution';
import {
  METADATA_BUCKET_COLORS,
  METADATA_ORDER,
  METADATA_TKEY,
  normalizeMetadataDistribution,
} from '@/lib/dashboardMetadataDistribution';

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
    const value = normalized[seg.key] ?? 0;
    if (value > 0) {
      row[seg.key] = value;
      rowKeys.push(seg.key);
    }
  }
  const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
  return { row, rowKeys, total };
}

function buildMetadataStack(dist: Record<string, number>) {
  const normalized = normalizeMetadataDistribution(dist);
  const row: Record<string, number | string> = { name: 'meta' };
  const rowKeys: string[] = [];
  for (const seg of METADATA_ORDER) {
    const value = normalized[seg.key] ?? 0;
    if (value > 0) {
      row[seg.key] = value;
      rowKeys.push(seg.key);
    }
  }
  const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
  return { row, rowKeys, total };
}

export type GlobalDistributionMetric = 'humi' | 'wami' | 'meta';

export const GLOBAL_DISTRIBUTION_METRICS: GlobalDistributionMetric[] = ['humi', 'wami', 'meta'];

export function buildGlobalDistributionSlide(
  stats: GlobalDistributionStats,
  t: Translations,
  metric: GlobalDistributionMetric,
): DistributionCarouselSlide | null {
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
  const metaColor = (key: string) => {
    const tkey = METADATA_TKEY[key as keyof typeof METADATA_TKEY];
    return tkey ? METADATA_BUCKET_COLORS[tkey] ?? '#71717a' : '#71717a';
  };

  if (metric === 'humi') {
    const humiStack = buildMaturityStack(stats.humi_index_distribution ?? {}, 'humi');
    if (humiStack.total <= 0) return null;
    return {
      id: 'humi',
      metricLabel: t.humiDistributionTitle,
      rowKeys: humiStack.rowKeys,
      row: humiStack.row,
      colors: maturityColor,
      labelForKey: maturityLabelForKey,
    };
  }

  if (metric === 'wami') {
    const wamiStack = buildMaturityStack(stats.wami_index_distribution ?? {}, 'wami');
    if (wamiStack.total <= 0) return null;
    return {
      id: 'wami',
      metricLabel: t.wamiDistributionTitle,
      rowKeys: wamiStack.rowKeys,
      row: wamiStack.row,
      colors: maturityColor,
      labelForKey: maturityLabelForKey,
    };
  }

  const metaStack = buildMetadataStack(stats.agent_metadata_distribution ?? {});
  if (metaStack.total <= 0) return null;
  return {
    id: 'meta',
    metricLabel: t.metadataRichnessTitle,
    rowKeys: metaStack.rowKeys,
    row: metaStack.row,
    colors: metaColor,
    labelForKey: metaLabelForKey,
  };
}

export function buildGlobalDistributionSlides(
  stats: GlobalDistributionStats,
  t: Translations,
): DistributionCarouselSlide[] {
  return GLOBAL_DISTRIBUTION_METRICS.map((metric) =>
    buildGlobalDistributionSlide(stats, t, metric),
  ).filter((slide): slide is DistributionCarouselSlide => slide != null);
}
