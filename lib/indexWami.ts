import { maturityKeyFromNumericScore } from '@/lib/agentHumiDisplay';

export type IndexWamiCardData = {
  wami_score: number | null;
  maturity_level: string | null;
  wami_score_calculated_at: string | null;
  wami_score_last_30_days: unknown;
  wami_score_tracking: unknown;
  pillar_origins_legitimacy_score: number | null;
  pillar_origins_legitimacy_summary: unknown;
  pillar_origins_legitimacy_last_30_days: unknown;
  pillar_origins_legitimacy_tracking: unknown;
  pillar_portfolio_quality_score: number | null;
  pillar_portfolio_quality_summary: unknown;
  pillar_portfolio_quality_last_30_days: unknown;
  pillar_portfolio_quality_tracking: unknown;
  pillar_activity_behavior_score: number | null;
  pillar_activity_behavior_summary: unknown;
  pillar_activity_behavior_last_30_days: unknown;
  pillar_activity_behavior_tracking: unknown;
  pillar_multi_chain_presence_maturity_score: number | null;
  pillar_multi_chain_presence_maturity_summary: unknown;
  pillar_multi_chain_presence_maturity_last_30_days: unknown;
  pillar_multi_chain_presence_maturity_tracking: unknown;
  wallets: unknown;
  wami_score_data: unknown;
  pillar_origins_legitimacy_score_data: unknown;
  pillar_portfolio_quality_score_data: unknown;
  pillar_activity_behavior_score_data: unknown;
  pillar_multi_chain_presence_maturity_score_data: unknown;
  maturity_level_data: unknown;
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

function clampIndexScore(value: unknown): number | null {
  const n = finiteNumber(value);
  if (n === null) return null;
  return Math.min(100, Math.max(0, n));
}

function parseOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function parseIndexWamiRow(raw: unknown): IndexWamiCardData | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  return {
    wami_score: clampIndexScore(o.wami_score),
    maturity_level: parseOptionalString(o.maturity_level),
    wami_score_calculated_at: parseOptionalString(o.wami_score_calculated_at),
    wami_score_last_30_days: o.wami_score_last_30_days ?? null,
    wami_score_tracking: o.wami_score_tracking ?? null,
    pillar_origins_legitimacy_score: clampPillarScore(o.pillar_origins_legitimacy_score),
    pillar_origins_legitimacy_summary: o.pillar_origins_legitimacy_summary ?? null,
    pillar_origins_legitimacy_last_30_days: o.pillar_origins_legitimacy_last_30_days ?? null,
    pillar_origins_legitimacy_tracking: o.pillar_origins_legitimacy_tracking ?? null,
    pillar_portfolio_quality_score: clampPillarScore(o.pillar_portfolio_quality_score),
    pillar_portfolio_quality_summary: o.pillar_portfolio_quality_summary ?? null,
    pillar_portfolio_quality_last_30_days: o.pillar_portfolio_quality_last_30_days ?? null,
    pillar_portfolio_quality_tracking: o.pillar_portfolio_quality_tracking ?? null,
    pillar_activity_behavior_score: clampPillarScore(o.pillar_activity_behavior_score),
    pillar_activity_behavior_summary: o.pillar_activity_behavior_summary ?? null,
    pillar_activity_behavior_last_30_days: o.pillar_activity_behavior_last_30_days ?? null,
    pillar_activity_behavior_tracking: o.pillar_activity_behavior_tracking ?? null,
    pillar_multi_chain_presence_maturity_score: clampPillarScore(
      o.pillar_multi_chain_presence_maturity_score,
    ),
    pillar_multi_chain_presence_maturity_summary:
      o.pillar_multi_chain_presence_maturity_summary ?? null,
    pillar_multi_chain_presence_maturity_last_30_days:
      o.pillar_multi_chain_presence_maturity_last_30_days ?? null,
    pillar_multi_chain_presence_maturity_tracking:
      o.pillar_multi_chain_presence_maturity_tracking ?? null,
    wallets: o.wallets ?? null,
    wami_score_data: o.wami_score_data ?? null,
    pillar_origins_legitimacy_score_data: o.pillar_origins_legitimacy_score_data ?? null,
    pillar_portfolio_quality_score_data: o.pillar_portfolio_quality_score_data ?? null,
    pillar_activity_behavior_score_data: o.pillar_activity_behavior_score_data ?? null,
    pillar_multi_chain_presence_maturity_score_data:
      o.pillar_multi_chain_presence_maturity_score_data ?? null,
    maturity_level_data: o.maturity_level_data ?? null,
  };
}

export function resolveWamiCategory(
  maturityLevel: string | null | undefined,
  score: number | null | undefined,
): string {
  const maturity = parseOptionalString(maturityLevel ?? undefined);
  if (maturity) return maturity;

  if (score !== null && score !== undefined && Number.isFinite(score)) {
    return maturityKeyFromNumericScore(score);
  }
  return '';
}
