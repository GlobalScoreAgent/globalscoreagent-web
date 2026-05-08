/**
 * Construye series para gráficos de detalle desde JSON plano nonce_history/balance_history.
 * Orden conceptual: today, 7d, … 12m. Omite null; conserva 0.
 */

export type DeltaChartPoint = { label: string; value: number };

function readDelta(obj: Record<string, unknown> | null | undefined, key: string): number | null {
  if (!obj || typeof obj !== 'object') return null;
  const raw = obj[key];
  if (raw === undefined || raw === null) return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

export type ChartLabelResolver = (
  bucket: 'today' | '7d' | '15d' | '1m' | '2m' | '3m' | '6m' | '9m' | '12m'
) => string;

export function buildNonceDeltaSeries(
  history: unknown,
  nonceCurrent: number | null | undefined,
  labelOf: ChartLabelResolver
): DeltaChartPoint[] {
  const obj = (history && typeof history === 'object' ? history : {}) as Record<string, unknown>;
  const out: DeltaChartPoint[] = [];

  const today = nonceCurrent;
  if (today !== undefined && today !== null && Number.isFinite(Number(today))) {
    out.push({ label: labelOf('today'), value: Number(today) });
  }

  const keysToLabel: { key: string; bucket: Parameters<ChartLabelResolver>[0] }[] = [
    { key: 'nonce_delta_7days', bucket: '7d' },
    { key: 'nonce_delta_15days', bucket: '15d' },
    { key: 'nonce_delta_1month', bucket: '1m' },
    { key: 'nonce_delta_2month', bucket: '2m' },
    { key: 'nonce_delta_3month', bucket: '3m' },
    { key: 'nonce_delta_6month', bucket: '6m' },
    { key: 'nonce_delta_9month', bucket: '9m' },
    { key: 'nonce_delta_12month', bucket: '12m' },
  ];

  for (const { key, bucket } of keysToLabel) {
    const v = readDelta(obj, key);
    if (v !== null) {
      out.push({ label: labelOf(bucket), value: v });
    }
  }

  return out;
}

export function buildBalanceDeltaSeries(
  history: unknown,
  balanceCurrent: number | null | undefined,
  labelOf: ChartLabelResolver
): DeltaChartPoint[] {
  const obj = (history && typeof history === 'object' ? history : {}) as Record<string, unknown>;
  const out: DeltaChartPoint[] = [];

  const today = balanceCurrent;
  if (today !== undefined && today !== null && Number.isFinite(Number(today))) {
    out.push({ label: labelOf('today'), value: Number(today) });
  }

  const keysToLabel: { key: string; bucket: Parameters<ChartLabelResolver>[0] }[] = [
    { key: 'balance_delta_7days', bucket: '7d' },
    { key: 'balance_delta_15days', bucket: '15d' },
    { key: 'balance_delta_1month', bucket: '1m' },
    { key: 'balance_delta_2month', bucket: '2m' },
    { key: 'balance_delta_3month', bucket: '3m' },
    { key: 'balance_delta_6month', bucket: '6m' },
    { key: 'balance_delta_9month', bucket: '9m' },
    { key: 'balance_delta_12month', bucket: '12m' },
  ];

  for (const { key, bucket } of keysToLabel) {
    const v = readDelta(obj, key);
    if (v !== null) {
      out.push({ label: labelOf(bucket), value: v });
    }
  }

  return out;
}
