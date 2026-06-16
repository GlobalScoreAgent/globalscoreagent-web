import { humanizeWalletCategory } from '@/lib/agentTransactionalWallets';

export type ExternalSourceRow = {
  entity: string;
  score: number;
  last_at: string | null;
  first_at: string | null;
};

export type ExternalAuditSummary = {
  external_source_data: ExternalSourceRow[];
  external_source_count: number;
  external_source_score: number;
  external_source_valid_count: number;
  last_external_audit_record_at: string | null;
  first_external_audit_record_at: string | null;
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

function parseExternalSourceItem(raw: unknown): ExternalSourceRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const entity = typeof o.entity === 'string' ? o.entity.trim() : '';
  const score = finiteNumber(o.score);
  if (!entity || score === null) return null;
  return {
    entity,
    score,
    last_at: optionalIsoString(o.last_at),
    first_at: optionalIsoString(o.first_at),
  };
}

export function humanizeExternalEntity(entity: string): string {
  return humanizeWalletCategory(entity);
}

export function parseExternalAuditSummary(raw: unknown): ExternalAuditSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const external_source_count = finiteNumber(o.external_source_count);
  const external_source_score = finiteNumber(o.external_source_score);
  const external_source_valid_count = finiteNumber(o.external_source_valid_count);
  if (
    external_source_count === null ||
    external_source_score === null ||
    external_source_valid_count === null
  ) {
    return null;
  }

  if (!Array.isArray(o.external_source_data)) return null;

  const external_source_data: ExternalSourceRow[] = [];
  for (const item of o.external_source_data) {
    const row = parseExternalSourceItem(item);
    if (row) external_source_data.push(row);
  }

  return {
    external_source_data,
    external_source_count,
    external_source_score,
    external_source_valid_count,
    last_external_audit_record_at: optionalIsoString(o.last_external_audit_record_at),
    first_external_audit_record_at: optionalIsoString(o.first_external_audit_record_at),
  };
}

function lastAtSortKey(iso: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function buildCarouselRows(summary: ExternalAuditSummary): ExternalSourceRow[] {
  return [...summary.external_source_data].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return lastAtSortKey(b.last_at) - lastAtSortKey(a.last_at);
  });
}

export function formatExternalSourceScore(score: number): string {
  return score.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

export function formatExternalGlobalScore(score: number): string {
  return score.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}
