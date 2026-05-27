export const HUMI_BAND_GREEN = '#22c55e';
export const HUMI_BAND_YELLOW = '#eab308';
export const HUMI_BAND_RED = '#dc2626';
export const HUMI_BAND_NEUTRAL = '#6B7280';

function finiteScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Pillar score bands (0–25): green >= 20, yellow >= 10 and < 20, red < 10. */
export function getPillarScoreBandColor(score: number | null | undefined): string {
  const n = finiteScore(score);
  if (n === null) return HUMI_BAND_NEUTRAL;
  if (n >= 20) return HUMI_BAND_GREEN;
  if (n >= 10) return HUMI_BAND_YELLOW;
  return HUMI_BAND_RED;
}

/** Block score as percentage of block max (0–100). */
export function getBlockScorePercent(score: number, max: number): number | null {
  const s = finiteScore(score);
  const m = finiteScore(max);
  if (s === null || m === null || m <= 0) return null;
  return (s / m) * 100;
}

/** Block bands by % of max: green >= 75%, yellow >= 50% and < 75%, red < 50%. */
export function getBlockPercentBandColor(
  score: number | null | undefined,
  max: number,
): string {
  const pct = getBlockScorePercent(score ?? NaN, max);
  if (pct === null) return HUMI_BAND_NEUTRAL;
  if (pct >= 75) return HUMI_BAND_GREEN;
  if (pct >= 50) return HUMI_BAND_YELLOW;
  return HUMI_BAND_RED;
}
