/**
 * HUMI/WAMI maturity distribution — shared keys, colors, and normalizer for dashboard.
 * Aligns with docs/español/index-humi.md and index-wami.md.
 */

import { MATURITY_KEYS, type MaturityKey } from '@/lib/web-page/statistics';

export type { MaturityKey };
export { MATURITY_KEYS };

export type MaturityTranslationKey =
  | 'humiUnstable'
  | 'humiDeveloping'
  | 'humiStable'
  | 'humiVeryStable'
  | 'humiElite';

export type MaturitySegment = {
  key: MaturityKey;
  color: string;
  labelKey: MaturityTranslationKey;
  scoreRange: string;
};

export const MATURITY_ORDER: MaturitySegment[] = [
  { key: 'Unstable', color: '#dc2626', labelKey: 'humiUnstable', scoreRange: '0–49' },
  { key: 'Developing', color: '#f97316', labelKey: 'humiDeveloping', scoreRange: '50–64' },
  { key: 'Stable', color: '#4ade80', labelKey: 'humiStable', scoreRange: '65–79' },
  { key: 'Very Stable', color: '#22c55e', labelKey: 'humiVeryStable', scoreRange: '80–89' },
  { key: 'Elite', color: '#15803d', labelKey: 'humiElite', scoreRange: '90–100' },
];

export const MATURITY_COLORS: Record<MaturityKey, string> = Object.fromEntries(
  MATURITY_ORDER.map((s) => [s.key, s.color]),
) as Record<MaturityKey, string>;

export const MATURITY_SCORE_RANGES: Record<MaturityKey, string> = Object.fromEntries(
  MATURITY_ORDER.map((s) => [s.key, s.scoreRange]),
) as Record<MaturityKey, string>;

export const MATURITY_TKEY: Record<MaturityKey, MaturityTranslationKey> = Object.fromEntries(
  MATURITY_ORDER.map((s) => [s.key, s.labelKey]),
) as Record<MaturityKey, MaturityTranslationKey>;

/** Chain-card legacy bucket names → maturity key. */
const LEGACY_CHAIN_TO_MATURITY: Record<string, MaturityKey> = {
  Critical: 'Unstable',
  'Moderate Risk': 'Developing',
  Stable: 'Stable',
  'High Performance': 'Very Stable',
  Elite: 'Elite',
};

/** Global overview legacy range keys → maturity key. */
const LEGACY_RANGE_TO_MATURITY: Record<string, MaturityKey> = {
  '0-10': 'Unstable',
  '10-30': 'Unstable',
  '30-60': 'Developing',
  '60-80': 'Stable',
  '80-100': 'Very Stable',
};

function emptyMaturityRecord(): Record<MaturityKey, number> {
  return Object.fromEntries(MATURITY_KEYS.map((k) => [k, 0])) as Record<MaturityKey, number>;
}

function addCount(out: Record<MaturityKey, number>, key: MaturityKey, value: number): void {
  if (Number.isFinite(value) && value > 0) {
    out[key] += value;
  }
}

/** Normalize raw JSON (flat counts) into maturity keys; merges legacy keys when present. */
export function normalizeMaturityDistribution(raw: unknown): Record<MaturityKey, number> {
  const out = emptyMaturityRecord();
  if (!raw || typeof raw !== 'object') return out;

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) continue;

    if ((MATURITY_KEYS as string[]).includes(key)) {
      addCount(out, key as MaturityKey, n);
      continue;
    }
    const fromChain = LEGACY_CHAIN_TO_MATURITY[key];
    if (fromChain) {
      addCount(out, fromChain, n);
      continue;
    }
    const fromRange = LEGACY_RANGE_TO_MATURITY[key];
    if (fromRange) {
      addCount(out, fromRange, n);
    }
  }

  return out;
}
