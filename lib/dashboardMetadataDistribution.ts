/**
 * Agent metadata richness distribution — shared keys, colors, and normalizer for dashboard.
 * Aligns with docs/español/agent-metadata-richness-analysis.md.
 */

export type MetadataRichnessKey =
  | 'Incomplete'
  | 'Limited'
  | 'Basic'
  | 'Moderate'
  | 'Strong'
  | 'Excellent';

export const METADATA_RICHNESS_KEYS: MetadataRichnessKey[] = [
  'Incomplete',
  'Limited',
  'Basic',
  'Moderate',
  'Strong',
  'Excellent',
];

export type MetadataTranslationKey =
  | 'metadataIncomplete'
  | 'metadataLimited'
  | 'metadataBasic'
  | 'metadataModerate'
  | 'metadataStrong'
  | 'metadataExcellent';

export type MetadataSegment = {
  key: MetadataRichnessKey;
  color: string;
  labelKey: MetadataTranslationKey;
  scoreRange: string;
};

export const METADATA_ORDER: MetadataSegment[] = [
  { key: 'Incomplete', color: '#991b1b', labelKey: 'metadataIncomplete', scoreRange: '< 50' },
  { key: 'Limited', color: '#dc2626', labelKey: 'metadataLimited', scoreRange: '< 50' },
  { key: 'Basic', color: '#f59e0b', labelKey: 'metadataBasic', scoreRange: '50–69' },
  { key: 'Moderate', color: '#eab308', labelKey: 'metadataModerate', scoreRange: '50–69' },
  { key: 'Strong', color: '#10b981', labelKey: 'metadataStrong', scoreRange: '70–84' },
  { key: 'Excellent', color: '#3b82f6', labelKey: 'metadataExcellent', scoreRange: '85–100' },
];

export const METADATA_COLORS: Record<MetadataRichnessKey, string> = Object.fromEntries(
  METADATA_ORDER.map((s) => [s.key, s.color]),
) as Record<MetadataRichnessKey, string>;

export const METADATA_SCORE_RANGES: Record<MetadataRichnessKey, string> = Object.fromEntries(
  METADATA_ORDER.map((s) => [s.key, s.scoreRange]),
) as Record<MetadataRichnessKey, string>;

export const METADATA_TKEY: Record<MetadataRichnessKey, MetadataTranslationKey> =
  Object.fromEntries(METADATA_ORDER.map((s) => [s.key, s.labelKey])) as Record<
    MetadataRichnessKey,
    MetadataTranslationKey
  >;

export const METADATA_BUCKET_COLORS: Record<MetadataTranslationKey, string> = Object.fromEntries(
  METADATA_ORDER.map((s) => [s.labelKey, s.color]),
) as Record<MetadataTranslationKey, string>;

/** Legacy DB / cleaned Spanish keys → new richness key. */
const LEGACY_METADATA_TO_KEY: Record<string, MetadataRichnessKey> = {
  'Mala (0-10)': 'Incomplete',
  'Baja (10-30)': 'Limited',
  'Regular (30-50)': 'Limited',
  'Buena (50-70)': 'Basic',
  'Excelente (70-90)': 'Strong',
  'Elite (90-100)': 'Excellent',
  Mala: 'Incomplete',
  Baja: 'Limited',
  Regular: 'Moderate',
  Bueno: 'Basic',
  Excelente: 'Strong',
  Elite: 'Excellent',
};

function emptyMetadataRecord(): Record<MetadataRichnessKey, number> {
  return Object.fromEntries(METADATA_RICHNESS_KEYS.map((k) => [k, 0])) as Record<
    MetadataRichnessKey,
    number
  >;
}

function addCount(
  out: Record<MetadataRichnessKey, number>,
  key: MetadataRichnessKey,
  value: number,
): void {
  if (Number.isFinite(value) && value > 0) {
    out[key] += value;
  }
}

/** Normalize raw JSON (flat counts) into metadata richness keys; merges legacy keys when present. */
export function normalizeMetadataDistribution(raw: unknown): Record<MetadataRichnessKey, number> {
  const out = emptyMetadataRecord();
  if (!raw || typeof raw !== 'object') return out;

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) continue;

    if ((METADATA_RICHNESS_KEYS as string[]).includes(key)) {
      addCount(out, key as MetadataRichnessKey, n);
      continue;
    }
    const mapped = LEGACY_METADATA_TO_KEY[key];
    if (mapped) {
      addCount(out, mapped, n);
    }
  }

  return out;
}
