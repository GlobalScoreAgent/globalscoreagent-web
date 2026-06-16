/** HUMI maturity badge colors and labels for agent directory and detail views. */

import {
  MATURITY_COLORS,
  MATURITY_KEYS,
  MATURITY_TKEY,
  type MaturityKey,
} from '@/lib/dashboardMaturityDistribution';

export type HumiTranslationsPick = {
  humiElite: string;
  humiVeryStable: string;
  humiStable: string;
  humiDeveloping: string;
  humiUnstable: string;
  humiNotCalculate: string;
  humiHighPerformance: string;
  humiModerateRisk: string;
  humiCritical: string;
};

export const HUMI_NOT_CALCULATED = 'Not Calculated';

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeAgentHumiScore(score: unknown): number {
  return finiteNumber(score) ?? 0;
}

export function normalizeAgentHumiMaturity(level: unknown): string {
  if (typeof level === 'string' && level.trim().length > 0) return level.trim();
  return HUMI_NOT_CALCULATED;
}

/** @alias normalizeAgentHumiMaturity — WAMI uses the same maturity tiers. */
export const normalizeAgentWamiMaturity = normalizeAgentHumiMaturity;

export function getAgentDetailMaturityTier(
  maturityLevel: string | null | undefined,
  legacyFilter?: string | null | undefined,
): string {
  const key = resolveAgentMaturityLevel(maturityLevel, legacyFilter);
  if (key) return key;
  if (isNotCalculatedMaturity(maturityLevel) || isNotCalculatedMaturity(legacyFilter)) {
    return HUMI_NOT_CALCULATED;
  }
  return '';
}

export function maturityKeyFromNumericScore(score: number): MaturityKey {
  if (score >= 90) return 'Elite';
  if (score >= 80) return 'Very Stable';
  if (score >= 65) return 'Stable';
  if (score >= 50) return 'Developing';
  return 'Unstable';
}

export function isNotCalculateFilterValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === 'not calculate' || normalized === 'not calculated';
}

/** DB rows without maturity (NULL); literals are normalized to NULL via import/migration. */
export function applyNotCalculatedMaturityFilter<T extends { is: (col: string, val: null) => T }>(
  query: T,
): T {
  return query.is('humi_madurity_level', null);
}

const LEGACY_TO_MATURITY: Record<string, MaturityKey> = {
  Critical: 'Unstable',
  'Moderate Risk': 'Developing',
  Stable: 'Stable',
  'High Performance': 'Very Stable',
  Elite: 'Elite',
};

function normalizeTierRaw(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isNotCalculatedMaturity(raw: string | null | undefined): boolean {
  if (raw == null || raw.trim() === '') return true;
  const normalized = normalizeTierRaw(raw);
  return normalized === 'not calculate' || normalized === 'not calculated';
}

export function resolveAgentMaturityLevel(
  maturityLevel: string | null | undefined,
  legacyFilter?: string | null | undefined,
): MaturityKey | null {
  const candidates = [maturityLevel, legacyFilter].filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );

  for (const raw of candidates) {
    if (isNotCalculatedMaturity(raw)) continue;

    const trimmed = raw.trim();
    if ((MATURITY_KEYS as string[]).includes(trimmed)) {
      return trimmed as MaturityKey;
    }

    const legacy = LEGACY_TO_MATURITY[trimmed];
    if (legacy) return legacy;
  }

  return null;
}

export function getHumiMaturityColor(
  maturityLevel: string | null | undefined,
  legacyFilter?: string | null | undefined,
): string {
  const key = resolveAgentMaturityLevel(maturityLevel, legacyFilter);
  if (key) return MATURITY_COLORS[key];
  return '#6B7280';
}

export function getHumiMaturityText(
  maturityLevel: string | null | undefined,
  legacyFilter: string | null | undefined,
  t: HumiTranslationsPick,
): string {
  const key = resolveAgentMaturityLevel(maturityLevel, legacyFilter);
  if (key) {
    const labelKey = MATURITY_TKEY[key];
    return t[labelKey];
  }
  if (isNotCalculatedMaturity(maturityLevel) || isNotCalculatedMaturity(legacyFilter)) {
    return t.humiNotCalculate;
  }
  return '';
}

/** @deprecated Prefer getHumiMaturityColor with humi_madurity_level + legacy fallback. */
export function getHumiScoreColor(humiFilter: string): string {
  return getHumiMaturityColor(null, humiFilter);
}

/** @deprecated Prefer getHumiMaturityText with humi_madurity_level + legacy fallback. */
export function getHumiScoreText(humiFilter: string, t: HumiTranslationsPick): string {
  const key = resolveAgentMaturityLevel(null, humiFilter);
  if (key) return t[MATURITY_TKEY[key]];

  const textMapping: Record<string, string> = {
    Elite: t.humiElite,
    'High Performance': t.humiHighPerformance,
    Stable: t.humiStable,
    'Moderate Risk': t.humiModerateRisk,
    Critical: t.humiCritical,
  };

  return textMapping[humiFilter] || humiFilter;
}
