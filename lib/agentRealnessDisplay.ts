import type { HumiTranslationsPick } from '@/lib/agentHumiDisplay';

export type RealnessStatus = 'valid' | 'insufficient_info' | 'dummy' | 'test';

export type RealnessTranslationsPick = HumiTranslationsPick & {
  realnessStatusValid: string;
  realnessStatusInsufficientInfo: string;
  realnessStatusDummy: string;
  realnessStatusTest: string;
  realnessBusinessMeaningValid: string;
  realnessBusinessMeaningInsufficientInfo: string;
  realnessBusinessMeaningDummy: string;
  realnessBusinessMeaningTest: string;
};

const REALNESS_STATUS_COLORS: Record<RealnessStatus, string> = {
  valid: '#10B981',
  insufficient_info: '#F59E0B',
  dummy: '#EF4444',
  test: '#6B7280',
};

const NEUTRAL_COLOR = '#6B7280';

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeRealnessScore(score: unknown): number | null {
  return finiteNumber(score);
}

export function parseRealnessStatus(raw: unknown): RealnessStatus | null {
  if (typeof raw !== 'string') return null;
  const normalized = raw.trim().toLowerCase();
  if (
    normalized === 'valid' ||
    normalized === 'insufficient_info' ||
    normalized === 'dummy' ||
    normalized === 'test'
  ) {
    return normalized;
  }
  return null;
}

export function hasRealnessTier(status: RealnessStatus | null): boolean {
  return status !== null;
}

export function getRealnessStatusColor(status: RealnessStatus | null): string {
  if (!status) return NEUTRAL_COLOR;
  return REALNESS_STATUS_COLORS[status] ?? NEUTRAL_COLOR;
}

export function getRealnessStatusLabel(
  status: RealnessStatus | null,
  t: RealnessTranslationsPick,
): string {
  switch (status) {
    case 'valid':
      return t.realnessStatusValid;
    case 'insufficient_info':
      return t.realnessStatusInsufficientInfo;
    case 'dummy':
      return t.realnessStatusDummy;
    case 'test':
      return t.realnessStatusTest;
    default:
      return '';
  }
}

/** Non-empty when status exists — drives badge visibility and score tint in IndexScoreCard. */
export function getRealnessDisplayTier(status: RealnessStatus | null): string {
  return status ?? '';
}

export function getRealnessStatusBusinessMeaning(
  status: RealnessStatus | null,
  t: RealnessTranslationsPick,
): string {
  switch (status) {
    case 'valid':
      return t.realnessBusinessMeaningValid;
    case 'insufficient_info':
      return t.realnessBusinessMeaningInsufficientInfo;
    case 'dummy':
      return t.realnessBusinessMeaningDummy;
    case 'test':
      return t.realnessBusinessMeaningTest;
    default:
      return '';
  }
}
