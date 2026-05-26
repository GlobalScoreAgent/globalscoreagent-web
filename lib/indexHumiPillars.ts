import type { IndexHumiCardData } from '@/lib/indexHumi';

export type HumiPillarId = 'history' | 'usage' | 'measure' | 'information';

export type HumiPillarChartPoint = {
  id: HumiPillarId;
  label: string;
  value: number | null;
};

const PILLAR_ORDER: readonly {
  id: HumiPillarId;
  field: keyof Pick<
    IndexHumiCardData,
    | 'pillar_history_score'
    | 'pillar_usage_score'
    | 'pillar_measure_score'
    | 'pillar_information_score'
  >;
}[] = [
  { id: 'history', field: 'pillar_history_score' },
  { id: 'usage', field: 'pillar_usage_score' },
  { id: 'measure', field: 'pillar_measure_score' },
  { id: 'information', field: 'pillar_information_score' },
];

export function buildHumiPillarChartPoints(
  data: IndexHumiCardData | null,
  labels: Record<HumiPillarId, string>,
): HumiPillarChartPoint[] {
  return PILLAR_ORDER.map(({ id, field }) => ({
    id,
    label: labels[id],
    value: data?.[field] ?? null,
  }));
}

export function hasAnyPillarScore(points: HumiPillarChartPoint[]): boolean {
  return points.some((p) => p.value !== null && Number.isFinite(p.value));
}

export type PillarTrendFieldKeys = {
  last30Days: keyof Pick<
    IndexHumiCardData,
    | 'pillar_history_score_last_30_days'
    | 'pillar_history_score_tracking'
    | 'pillar_information_score_last_30_days'
    | 'pillar_information_score_tracking'
    | 'pillar_measure_score_last_30_days'
    | 'pillar_measure_score_tracking'
    | 'pillar_usage_score_last_30_days'
    | 'pillar_usage_score_tracking'
  >;
  tracking: keyof Pick<
    IndexHumiCardData,
    | 'pillar_history_score_last_30_days'
    | 'pillar_history_score_tracking'
    | 'pillar_information_score_last_30_days'
    | 'pillar_information_score_tracking'
    | 'pillar_measure_score_last_30_days'
    | 'pillar_measure_score_tracking'
    | 'pillar_usage_score_last_30_days'
    | 'pillar_usage_score_tracking'
  >;
};

export const PILLAR_TREND_FIELDS: Record<HumiPillarId, PillarTrendFieldKeys> = {
  history: {
    last30Days: 'pillar_history_score_last_30_days',
    tracking: 'pillar_history_score_tracking',
  },
  usage: {
    last30Days: 'pillar_usage_score_last_30_days',
    tracking: 'pillar_usage_score_tracking',
  },
  measure: {
    last30Days: 'pillar_measure_score_last_30_days',
    tracking: 'pillar_measure_score_tracking',
  },
  information: {
    last30Days: 'pillar_information_score_last_30_days',
    tracking: 'pillar_information_score_tracking',
  },
};

export function getPillarTrendRaw(
  data: IndexHumiCardData | null,
  pillarId: HumiPillarId,
): { last30Days: unknown; tracking: unknown } {
  const fields = PILLAR_TREND_FIELDS[pillarId];
  if (!data) {
    return { last30Days: null, tracking: null };
  }
  return {
    last30Days: data[fields.last30Days] ?? null,
    tracking: data[fields.tracking] ?? null,
  };
}

/** True when the DB field is null/undefined (no historical series stored). */
export function isPillarTrendRawMissing(raw: unknown): boolean {
  return raw === null || raw === undefined;
}
