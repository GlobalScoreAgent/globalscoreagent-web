import { parseHumiLast30Days, parseHumiMonthlyTracking, type HumiChartPoint } from '@/lib/indexHumiSeries';
import { unwrapWalletSeries } from '@/lib/indexWamiWalletData';
import type { IndexWamiCardData } from '@/lib/indexWami';

export const WAMI_INDEX_DAILY_SCORE_KEY = 'index_wami_score';
export const WAMI_INDEX_MONTHLY_SCORE_KEY = 'index_wami_score';
export const WAMI_PILLAR_DAILY_SCORE_KEY = 'pillar_score';
export const WAMI_PILLAR_MONTHLY_SCORE_KEY = 'avg_score';

const WAMI_INDEX_DAILY_FALLBACK_KEYS = ['index_wami_score', 'wami_score'] as const;

function finiteScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function resolveScoreFromRow(row: Record<string, unknown>, keys: readonly string[]): number | null {
  for (const key of keys) {
    const score = finiteScore(row[key]);
    if (score !== null) return score;
  }
  return null;
}

function parseWamiIndexLast30DaysRaw(
  raw: unknown,
  locale: string,
): HumiChartPoint[] {
  if (!Array.isArray(raw)) return [];

  const byDay = new Map<string, { iso: string; label: string; score: number }>();

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const dateRaw = row.date;
    if (typeof dateRaw !== 'string' || !dateRaw.trim()) continue;

    const iso = dateRaw.trim();
    const score = resolveScoreFromRow(row, WAMI_INDEX_DAILY_FALLBACK_KEYS);
    if (score === null) continue;

    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    const dayKey = d.toISOString().slice(0, 10);

    const prev = byDay.get(dayKey);
    if (!prev || iso.localeCompare(prev.iso) > 0) {
      byDay.set(dayKey, {
        iso,
        label: new Intl.DateTimeFormat(locale, {
          day: 'numeric',
          month: 'short',
          timeZone: 'UTC',
        }).format(d),
        score,
      });
    }
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, point]) => ({
      sortKey: dayKey,
      label: point.label,
      score: point.score,
    }));
}

export function parseWamiIndexLast30Days(
  data: IndexWamiCardData | null,
  walletAddress: string,
  locale: string,
): HumiChartPoint[] {
  const raw = unwrapWalletSeries(data?.wami_score_last_30_days ?? null, walletAddress);
  return parseWamiIndexLast30DaysRaw(raw, locale);
}

export function parseWamiIndexMonthlyTracking(
  data: IndexWamiCardData | null,
  walletAddress: string,
  locale: string,
): HumiChartPoint[] {
  const raw = unwrapWalletSeries(data?.wami_score_tracking ?? null, walletAddress);
  return parseHumiMonthlyTracking(raw, locale, WAMI_INDEX_MONTHLY_SCORE_KEY);
}

export function parseWamiPillarLast30Days(raw: unknown, locale: string): HumiChartPoint[] {
  return parseHumiLast30Days(raw, locale, WAMI_PILLAR_DAILY_SCORE_KEY);
}

export function parseWamiPillarMonthlyTracking(raw: unknown, locale: string): HumiChartPoint[] {
  return parseHumiMonthlyTracking(raw, locale, WAMI_PILLAR_MONTHLY_SCORE_KEY);
}
