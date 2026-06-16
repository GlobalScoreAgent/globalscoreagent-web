import { humanizeWalletCategory } from '@/lib/agentTransactionalWallets';

export type IdentityAnalysisSummary = {
  identity_score: number;
  identity_stage: string;
  last_identity_record_at: string | null;
};

function finiteNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function optionalIsoString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length > 0 ? s : null;
}

export function humanizeIdentityStage(stage: string): string {
  return humanizeWalletCategory(stage);
}

export function parseIdentityAnalysisSummary(raw: unknown): IdentityAnalysisSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const identity_score = finiteNumber(o.identity_score);
  const identity_stage = typeof o.identity_stage === 'string' ? o.identity_stage.trim() : '';
  if (identity_score === null || !identity_stage) return null;

  return {
    identity_score,
    identity_stage,
    last_identity_record_at: optionalIsoString(o.last_identity_record_at),
  };
}

export function formatIdentityScore(score: number): string {
  return score.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
