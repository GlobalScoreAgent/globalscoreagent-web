import { humiFilterFromNumericScore } from '@/lib/dashboardChains';

export type IndexHumiCardData = {
  humi_score: number | null;
  humi_score_category: string | null;
  current_humi_score_calculated_at: string | null;
  humi_score_last_30_days: unknown;
  humi_score_tracking: unknown;
  pillar_history_score: number | null;
  pillar_history_summary: unknown;
  pillar_usage_score: number | null;
  pillar_usage_summary: unknown;
  pillar_measure_score: number | null;
  pillar_measure_summary: unknown;
  pillar_information_score: number | null;
  pillar_information_summary: unknown;
  pillar_history_score_last_30_days: unknown;
  pillar_history_score_tracking: unknown;
  pillar_information_score_last_30_days: unknown;
  pillar_information_score_tracking: unknown;
  pillar_measure_score_last_30_days: unknown;
  pillar_measure_score_tracking: unknown;
  pillar_usage_score_last_30_days: unknown;
  pillar_usage_score_tracking: unknown;
};

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function clampPillarScore(value: unknown): number | null {
  const n = finiteNumber(value);
  if (n === null) return null;
  return Math.min(25, Math.max(0, n));
}

export function parseIndexHumiRow(raw: unknown): IndexHumiCardData | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const humi_score = finiteNumber(o.humi_score);
  const categoryRaw = o.humi_score_category;
  const humi_score_category =
    typeof categoryRaw === 'string' && categoryRaw.trim().length > 0
      ? categoryRaw.trim()
      : null;

  const calculatedRaw = o.current_humi_score_calculated_at;
  const current_humi_score_calculated_at =
    typeof calculatedRaw === 'string' && calculatedRaw.trim().length > 0
      ? calculatedRaw.trim()
      : null;

  return {
    humi_score,
    humi_score_category,
    current_humi_score_calculated_at,
    humi_score_last_30_days: o.humi_score_last_30_days ?? null,
    humi_score_tracking: o.humi_score_tracking ?? null,
    pillar_history_score: clampPillarScore(o.pillar_history_score),
    pillar_history_summary: o.pillar_history_summary ?? null,
    pillar_usage_score: clampPillarScore(o.pillar_usage_score),
    pillar_usage_summary: o.pillar_usage_summary ?? null,
    pillar_measure_score: clampPillarScore(o.pillar_measure_score),
    pillar_measure_summary: o.pillar_measure_summary ?? null,
    pillar_information_score: clampPillarScore(o.pillar_information_score),
    pillar_information_summary: o.pillar_information_summary ?? null,
    pillar_history_score_last_30_days: o.pillar_history_score_last_30_days ?? null,
    pillar_history_score_tracking: o.pillar_history_score_tracking ?? null,
    pillar_information_score_last_30_days: o.pillar_information_score_last_30_days ?? null,
    pillar_information_score_tracking: o.pillar_information_score_tracking ?? null,
    pillar_measure_score_last_30_days: o.pillar_measure_score_last_30_days ?? null,
    pillar_measure_score_tracking: o.pillar_measure_score_tracking ?? null,
    pillar_usage_score_last_30_days: o.pillar_usage_score_last_30_days ?? null,
    pillar_usage_score_tracking: o.pillar_usage_score_tracking ?? null,
  };
}

export function resolveHumiCategory(
  category: string | null | undefined,
  score: number | null | undefined,
): string {
  if (typeof category === 'string' && category.trim().length > 0) {
    return category.trim();
  }
  if (score !== null && score !== undefined && Number.isFinite(score)) {
    return humiFilterFromNumericScore(score);
  }
  return '';
}
