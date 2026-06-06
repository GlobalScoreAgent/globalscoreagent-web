import { maturityKeyFromNumericScore } from '@/lib/agentHumiDisplay';

export type IndexHumiCardData = {
  humi_score: number | null;
  madurity_level: string | null;
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

function parseOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function parseIndexHumiRow(raw: unknown): IndexHumiCardData | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const humi_score = finiteNumber(o.humi_score);
  const madurity_level = parseOptionalString(o.madurity_level);
  const humi_score_category = parseOptionalString(o.humi_score_category);
  const current_humi_score_calculated_at = parseOptionalString(o.current_humi_score_calculated_at);

  return {
    humi_score,
    madurity_level,
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

/** Resolve display category: madurity_level → legacy category → score bands. */
export function resolveHumiCategory(
  madurityLevel: string | null | undefined,
  legacyCategory: string | null | undefined,
  score: number | null | undefined,
): string {
  const maturity = parseOptionalString(madurityLevel ?? undefined);
  if (maturity) return maturity;

  const category = parseOptionalString(legacyCategory ?? undefined);
  if (category) return category;

  if (score !== null && score !== undefined && Number.isFinite(score)) {
    return maturityKeyFromNumericScore(score);
  }
  return '';
}
