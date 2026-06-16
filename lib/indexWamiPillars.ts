import type { IndexWamiCardData } from '@/lib/indexWami';
import { WAMI_PILLAR_DAILY_SCORE_KEY } from '@/lib/indexWamiSeries';
import {
  getWalletPillarSummaryRaw,
  unwrapWalletSeries,
} from '@/lib/indexWamiWalletData';

export type WamiPillarId = 'origins' | 'portfolio' | 'activity' | 'multichain';

export type WamiPillarChartPoint = {
  id: WamiPillarId;
  label: string;
  value: number | null;
};

const PILLAR_ORDER: readonly {
  id: WamiPillarId;
  scoreField: keyof Pick<
    IndexWamiCardData,
    | 'pillar_origins_legitimacy_score'
    | 'pillar_portfolio_quality_score'
    | 'pillar_activity_behavior_score'
    | 'pillar_multi_chain_presence_maturity_score'
  >;
  trendScoreKey: string;
}[] = [
  {
    id: 'origins',
    scoreField: 'pillar_origins_legitimacy_score',
    trendScoreKey: 'pillar_origins_legitimacy_score',
  },
  {
    id: 'portfolio',
    scoreField: 'pillar_portfolio_quality_score',
    trendScoreKey: 'pillar_portfolio_quality_score',
  },
  {
    id: 'activity',
    scoreField: 'pillar_activity_behavior_score',
    trendScoreKey: 'pillar_activity_behavior_score',
  },
  {
    id: 'multichain',
    scoreField: 'pillar_multi_chain_presence_maturity_score',
    trendScoreKey: 'pillar_multi_chain_presence_maturity_score',
  },
];

export const PILLAR_SUMMARY_FIELDS: Record<
  WamiPillarId,
  keyof Pick<
    IndexWamiCardData,
    | 'pillar_origins_legitimacy_summary'
    | 'pillar_portfolio_quality_summary'
    | 'pillar_activity_behavior_summary'
    | 'pillar_multi_chain_presence_maturity_summary'
  >
> = {
  origins: 'pillar_origins_legitimacy_summary',
  portfolio: 'pillar_portfolio_quality_summary',
  activity: 'pillar_activity_behavior_summary',
  multichain: 'pillar_multi_chain_presence_maturity_summary',
};

export const PILLAR_SCORE_DATA_FIELDS: Record<
  WamiPillarId,
  keyof Pick<
    IndexWamiCardData,
    | 'pillar_origins_legitimacy_score_data'
    | 'pillar_portfolio_quality_score_data'
    | 'pillar_activity_behavior_score_data'
    | 'pillar_multi_chain_presence_maturity_score_data'
  >
> = {
  origins: 'pillar_origins_legitimacy_score_data',
  portfolio: 'pillar_portfolio_quality_score_data',
  activity: 'pillar_activity_behavior_score_data',
  multichain: 'pillar_multi_chain_presence_maturity_score_data',
};

export const PILLAR_TREND_FIELDS: Record<
  WamiPillarId,
  {
    last30Days: keyof Pick<
      IndexWamiCardData,
      | 'pillar_origins_legitimacy_last_30_days'
      | 'pillar_portfolio_quality_last_30_days'
      | 'pillar_activity_behavior_last_30_days'
      | 'pillar_multi_chain_presence_maturity_last_30_days'
    >;
    tracking: keyof Pick<
      IndexWamiCardData,
      | 'pillar_origins_legitimacy_tracking'
      | 'pillar_portfolio_quality_tracking'
      | 'pillar_activity_behavior_tracking'
      | 'pillar_multi_chain_presence_maturity_tracking'
    >;
    trendScoreKey: string;
  }
> = {
  origins: {
    last30Days: 'pillar_origins_legitimacy_last_30_days',
    tracking: 'pillar_origins_legitimacy_tracking',
    trendScoreKey: WAMI_PILLAR_DAILY_SCORE_KEY,
  },
  portfolio: {
    last30Days: 'pillar_portfolio_quality_last_30_days',
    tracking: 'pillar_portfolio_quality_tracking',
    trendScoreKey: WAMI_PILLAR_DAILY_SCORE_KEY,
  },
  activity: {
    last30Days: 'pillar_activity_behavior_last_30_days',
    tracking: 'pillar_activity_behavior_tracking',
    trendScoreKey: WAMI_PILLAR_DAILY_SCORE_KEY,
  },
  multichain: {
    last30Days: 'pillar_multi_chain_presence_maturity_last_30_days',
    tracking: 'pillar_multi_chain_presence_maturity_tracking',
    trendScoreKey: WAMI_PILLAR_DAILY_SCORE_KEY,
  },
};

export function getWalletPillarSummaryRawForPillar(
  data: IndexWamiCardData | null,
  pillarId: WamiPillarId,
  walletAddress: string,
): unknown | null {
  if (!data) return null;
  const field = PILLAR_SUMMARY_FIELDS[pillarId];
  return getWalletPillarSummaryRaw(data[field], walletAddress);
}

function readWalletScoreFromArray(raw: unknown, walletAddress: string): number | null {
  if (!walletAddress || !Array.isArray(raw)) return null;
  const target = walletAddress.trim().toLowerCase();

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const o = entry as Record<string, unknown>;
    const addr =
      typeof o.wallet_address === 'string'
        ? o.wallet_address.trim().toLowerCase()
        : null;
    if (!addr || addr !== target) continue;
    const n = typeof o.score === 'number' ? o.score : Number(o.score);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

export function getWalletPillarScore(
  data: IndexWamiCardData | null,
  pillarId: WamiPillarId,
  walletAddress: string,
): number | null {
  if (!data) return null;
  const field = PILLAR_SCORE_DATA_FIELDS[pillarId];
  return readWalletScoreFromArray(data[field], walletAddress);
}

export function buildWamiAgentPillarChartPoints(
  data: IndexWamiCardData | null,
  labels: Record<WamiPillarId, string>,
): WamiPillarChartPoint[] {
  return PILLAR_ORDER.map(({ id, scoreField }) => ({
    id,
    label: labels[id],
    value: data?.[scoreField] ?? null,
  }));
}

export function buildWamiWalletPillarChartPoints(
  data: IndexWamiCardData | null,
  walletAddress: string,
  labels: Record<WamiPillarId, string>,
): WamiPillarChartPoint[] {
  return PILLAR_ORDER.map(({ id }) => ({
    id,
    label: labels[id],
    value: getWalletPillarScore(data, id, walletAddress),
  }));
}

export function getWamiPillarTrendRaw(
  data: IndexWamiCardData | null,
  pillarId: WamiPillarId,
  walletAddress: string,
): { last30Days: unknown; tracking: unknown; trendScoreKey: string } {
  const fields = PILLAR_TREND_FIELDS[pillarId];
  if (!data || !walletAddress) {
    return { last30Days: null, tracking: null, trendScoreKey: fields.trendScoreKey };
  }
  return {
    last30Days: unwrapWalletSeries(data[fields.last30Days], walletAddress),
    tracking: unwrapWalletSeries(data[fields.tracking], walletAddress),
    trendScoreKey: fields.trendScoreKey,
  };
}

export function isWamiTrendRawMissing(raw: unknown): boolean {
  return raw === null || raw === undefined;
}

export function getWamiPillarTrendScoreKey(pillarId: WamiPillarId): string {
  return PILLAR_TREND_FIELDS[pillarId].trendScoreKey;
}
