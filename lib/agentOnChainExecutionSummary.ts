import { humanizeWalletCategory } from '@/lib/agentTransactionalWallets';

export type OnChainExecutionRow = {
  category: string;
  count: number;
  last_at: string | null;
  first_at: string | null;
};

export type OnChainExecutionSummary = {
  on_chain_executions_data: OnChainExecutionRow[];
  on_chain_executions_count: number;
  on_chain_execution_valid_count: number;
  last_on_chain_execution_record_at: string | null;
  first_on_chain_execution_recorded_at: string | null;
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

function parseExecutionItem(raw: unknown): OnChainExecutionRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const category = typeof o.category === 'string' ? o.category.trim() : '';
  const count = finiteNumber(o.count);
  if (!category || count === null) return null;
  return {
    category,
    count,
    last_at: optionalIsoString(o.last_at),
    first_at: optionalIsoString(o.first_at),
  };
}

export function humanizeExecutionCategory(category: string): string {
  return humanizeWalletCategory(category);
}

export function parseOnChainExecutionSummary(raw: unknown): OnChainExecutionSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const on_chain_executions_count = finiteNumber(o.on_chain_executions_count);
  const on_chain_execution_valid_count = finiteNumber(o.on_chain_execution_valid_count);
  if (on_chain_executions_count === null || on_chain_execution_valid_count === null) {
    return null;
  }

  if (!Array.isArray(o.on_chain_executions_data)) return null;

  const on_chain_executions_data: OnChainExecutionRow[] = [];
  for (const item of o.on_chain_executions_data) {
    const row = parseExecutionItem(item);
    if (row) on_chain_executions_data.push(row);
  }

  return {
    on_chain_executions_data,
    on_chain_executions_count,
    on_chain_execution_valid_count,
    last_on_chain_execution_record_at: optionalIsoString(o.last_on_chain_execution_record_at),
    first_on_chain_execution_recorded_at: optionalIsoString(
      o.first_on_chain_execution_recorded_at,
    ),
  };
}

function lastAtSortKey(iso: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function buildCarouselRows(summary: OnChainExecutionSummary): OnChainExecutionRow[] {
  return [...summary.on_chain_executions_data].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return lastAtSortKey(b.last_at) - lastAtSortKey(a.last_at);
  });
}

export function executionValidRate(valid: number, total: number): number | null {
  if (total <= 0) return null;
  return (valid / total) * 100;
}

export function formatExecutionRatePct(rate: number | null): string {
  if (rate === null) return '—';
  if (rate >= 10) return `${Math.round(rate)}%`;
  return `${rate.toFixed(1)}%`;
}
