export type HumiChartPoint = {
  sortKey: string;
  label: string;
  score: number;
};

function finiteScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function utcDayKey(isoDate: string): string | null {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function formatDailyLabel(isoDate: string, locale: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(d);
}

function formatMonthlyLabel(yyyyMm: string, locale: string): string {
  const [y, m] = yyyyMm.split('-').map((x) => parseInt(x, 10));
  if (!Number.isFinite(y) || !Number.isFinite(m)) return yyyyMm;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/** Daily HUMI — one point per UTC day (last snapshot wins). Index: index_humi_score; pillar: pillar_score. */
export function parseHumiLast30Days(
  raw: unknown,
  locale: string,
  scoreKey = 'index_humi_score',
): HumiChartPoint[] {
  if (!Array.isArray(raw)) return [];

  const byDay = new Map<string, { iso: string; label: string; score: number }>();

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const dateRaw = row.date;
    if (typeof dateRaw !== 'string' || !dateRaw.trim()) continue;

    const iso = dateRaw.trim();
    const score = finiteScore(row[scoreKey]);
    if (score === null) continue;

    const dayKey = utcDayKey(iso);
    if (!dayKey) continue;

    const prev = byDay.get(dayKey);
    if (!prev || iso.localeCompare(prev.iso) > 0) {
      byDay.set(dayKey, {
        iso,
        label: formatDailyLabel(iso, locale),
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

/** Monthly HUMI — date field is YYYY-MM. Index: index_humi_score; pillar: avg_score. */
export function parseHumiMonthlyTracking(
  raw: unknown,
  locale: string,
  scoreKey = 'index_humi_score',
): HumiChartPoint[] {
  if (!Array.isArray(raw)) return [];

  const points: HumiChartPoint[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const dateRaw = row.date;
    if (typeof dateRaw !== 'string' || !dateRaw.trim()) continue;

    const monthKey = dateRaw.trim();
    if (!/^\d{4}-\d{2}$/.test(monthKey)) continue;

    const score = finiteScore(row[scoreKey]);
    if (score === null) continue;

    points.push({
      sortKey: monthKey,
      label: formatMonthlyLabel(monthKey, locale),
      score,
    });
  }

  return points.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
