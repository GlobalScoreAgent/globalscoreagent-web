import { humanizeWalletCategory } from '@/lib/agentTransactionalWallets';

export type ProtocolActivityRow = {
  entity: string;
  activity: string;
  count: number;
  avg_score: number;
  revoke_count: number;
  payment_count: number;
  last_at: string | null;
  first_at: string | null;
};

export type ProtocolActivitySummary = {
  protocol_activity_data: ProtocolActivityRow[];
  protocol_activity_count: number;
  protocol_activity_score: number;
  protocol_activity_valid_count: number;
  protocol_activity_valid_payment_count: number;
  last_protocol_activity_record_at: string | null;
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

function parseActivityItem(raw: unknown): ProtocolActivityRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const entity = typeof o.entity === 'string' ? o.entity.trim() : '';
  const activity = typeof o.activity === 'string' ? o.activity.trim() : '';
  const count = finiteNumber(o.count);
  const avg_score = finiteNumber(o.avg_score);
  const revoke_count = finiteNumber(o.revoke_count) ?? 0;
  const payment_count = finiteNumber(o.payment_count) ?? 0;
  if (!entity || !activity || count === null || avg_score === null) {
    return null;
  }
  return {
    entity,
    activity,
    count,
    avg_score,
    revoke_count,
    payment_count,
    last_at: optionalIsoString(o.last_at),
    first_at: optionalIsoString(o.first_at),
  };
}

export function humanizeProtocolEntity(entity: string): string {
  return humanizeWalletCategory(entity);
}

export function humanizeProtocolActivity(activity: string): string {
  return humanizeWalletCategory(activity);
}

export function parseProtocolActivitySummary(raw: unknown): ProtocolActivitySummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const protocol_activity_count = finiteNumber(o.protocol_activity_count);
  const protocol_activity_score = finiteNumber(o.protocol_activity_score);
  const protocol_activity_valid_count = finiteNumber(o.protocol_activity_valid_count);
  const protocol_activity_valid_payment_count = finiteNumber(
    o.protocol_activity_valid_payment_count,
  );
  if (
    protocol_activity_count === null ||
    protocol_activity_score === null ||
    protocol_activity_valid_count === null ||
    protocol_activity_valid_payment_count === null
  ) {
    return null;
  }

  if (!Array.isArray(o.protocol_activity_data)) return null;

  const protocol_activity_data: ProtocolActivityRow[] = [];
  for (const item of o.protocol_activity_data) {
    const row = parseActivityItem(item);
    if (row) protocol_activity_data.push(row);
  }

  return {
    protocol_activity_data,
    protocol_activity_count,
    protocol_activity_score,
    protocol_activity_valid_count,
    protocol_activity_valid_payment_count,
    last_protocol_activity_record_at: optionalIsoString(o.last_protocol_activity_record_at),
  };
}

function lastAtSortKey(iso: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function buildCarouselRows(summary: ProtocolActivitySummary): ProtocolActivityRow[] {
  return [...summary.protocol_activity_data].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return lastAtSortKey(b.last_at) - lastAtSortKey(a.last_at);
  });
}

export function slideValidRate(count: number, revoke_count: number): number | null {
  if (count <= 0) return null;
  return ((count - revoke_count) / count) * 100;
}

export function slidePaymentRate(count: number, payment_count: number): number | null {
  if (count <= 0) return null;
  return (payment_count / count) * 100;
}

export function globalValidRate(valid: number, total: number): number | null {
  if (total <= 0) return null;
  return (valid / total) * 100;
}

export function globalPaymentRate(payment: number, total: number): number | null {
  if (total <= 0) return null;
  return (payment / total) * 100;
}

export function formatProtocolRatePct(rate: number | null): string {
  if (rate === null) return '—';
  if (rate >= 10) return `${Math.round(rate)}%`;
  return `${rate.toFixed(1)}%`;
}

export function formatProtocolActivityScore(score: number): string {
  return score.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatProtocolAvgScore(score: number): string {
  return score.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
