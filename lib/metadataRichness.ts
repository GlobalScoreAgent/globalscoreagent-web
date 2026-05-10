/**
 * Helpers for agent metadata richness score (detail page) — tiers align with
 * dashboard metadata buckets in lib/dashboardChains.
 */

import {
  METADATA_BUCKET_COLORS,
  type MetadataTranslationKey,
} from '@/lib/dashboardChains';

export function clampRichnessScore(n: number): number {
  return Math.min(100, Math.max(0, n));
}

/** Map 0–100 score to metadata tier label + bar colors (same as chain/dashboard metadata distribution). */
export function metadataRichnessTier(score: number | null | undefined): {
  labelKey: MetadataTranslationKey;
  colorHex: string;
  clamped: number;
} | null {
  if (score === null || score === undefined) return null;
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  const clamped = clampRichnessScore(n);
  let labelKey: MetadataTranslationKey;
  if (clamped < 10) labelKey = 'metadataPoor';
  else if (clamped < 30) labelKey = 'metadataLow';
  else if (clamped < 50) labelKey = 'metadataRegular';
  else if (clamped < 70) labelKey = 'metadataGood';
  else if (clamped < 90) labelKey = 'metadataExcellent';
  else labelKey = 'metadataElite';
  return {
    labelKey,
    colorHex: METADATA_BUCKET_COLORS[labelKey],
    clamped,
  };
}

export type RichnessLayerKey = 'basic' | 'intermediate' | 'advanced';

export type RichnessDetailEntry = {
  slug: string;
  rawKey: string;
  value: number;
};

export type ParsedRichnessLayer = {
  layerKey: RichnessLayerKey;
  layerScore: number;
  detailEntries: RichnessDetailEntry[];
};

export type ParsedMetadataRichness = {
  totalScore: number | null;
  calculatedAt: string | null;
  layers: ParsedRichnessLayer[];
};

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function parseMetadataRichnessInformation(raw: unknown): ParsedMetadataRichness | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const layersObj = o.layers;
  if (!layersObj || typeof layersObj !== 'object') return null;
  const L = layersObj as Record<string, unknown>;

  const rootTotal =
    o.total_score !== undefined && o.total_score !== null ? num(o.total_score) : null;
  const layersEmbeddedTotal =
    L.total_score !== undefined && L.total_score !== null ? num(L.total_score) : null;
  const totalScore = rootTotal !== null ? rootTotal : layersEmbeddedTotal;

  const calculatedAt = typeof o.calculated_at === 'string' ? o.calculated_at : null;

  const defs: { layerKey: RichnessLayerKey; scoreField: string; detailsField: string }[] = [
    { layerKey: 'basic', scoreField: 'basic_score', detailsField: 'basic_details' },
    { layerKey: 'intermediate', scoreField: 'intermediate_score', detailsField: 'intermediate_details' },
    { layerKey: 'advanced', scoreField: 'advanced_score', detailsField: 'advanced_details' },
  ];

  const layers: ParsedRichnessLayer[] = [];
  for (const def of defs) {
    const layerScore = num(L[def.scoreField]);
    const details = L[def.detailsField];
    const detailEntries: RichnessDetailEntry[] = [];
    if (details && typeof details === 'object') {
      for (const [rawKey, val] of Object.entries(details as Record<string, unknown>)) {
        const slug = `k_${rawKey.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_')}`;
        detailEntries.push({ slug, rawKey, value: num(val) });
      }
    }
    layers.push({ layerKey: def.layerKey, layerScore, detailEntries });
  }

  return {
    totalScore: totalScore !== null && Number.isFinite(totalScore) ? totalScore : null,
    calculatedAt,
    layers,
  };
}

export function humanizeRichnessDetailKey(rawKey: string): string {
  return rawKey
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
