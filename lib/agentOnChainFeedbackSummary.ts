import { humanizeWalletCategory } from '@/lib/agentTransactionalWallets';

export type OnChainFeedbackRow = {
  category: string;
  subcategory: string | null;
  avg_score: number;
};

export type OnChainFeedbackSummary = {
  on_chain_feedback_data: OnChainFeedbackRow[];
  on_chain_feedbacks_count: number;
  on_chain_feedbacks_valid_count: number;
  last_on_chain_feedback_record_at: string | null;
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

function parseTagStrings(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const s = item.trim();
    if (s) out.push(s);
  }
  return out;
}

function parseFeedbackItem(raw: unknown): OnChainFeedbackRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const tags = parseTagStrings(o.tags);
  const category = tags[0] ?? '';
  const subcategory = tags[1] ?? null;
  const avg_score = finiteNumber(o.avg_score);
  if (!category || avg_score === null) return null;
  return {
    category,
    subcategory,
    avg_score,
  };
}

export function humanizeFeedbackTag(tag: string): string {
  return humanizeWalletCategory(tag);
}

export function parseOnChainFeedbackSummary(raw: unknown): OnChainFeedbackSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const on_chain_feedbacks_count = finiteNumber(o.on_chain_feedbacks_count);
  const on_chain_feedbacks_valid_count = finiteNumber(o.on_chain_feedbacks_valid_count);
  if (on_chain_feedbacks_count === null || on_chain_feedbacks_valid_count === null) {
    return null;
  }

  if (!Array.isArray(o.on_chain_feedback_data)) return null;

  const on_chain_feedback_data: OnChainFeedbackRow[] = [];
  for (const item of o.on_chain_feedback_data) {
    const row = parseFeedbackItem(item);
    if (row) on_chain_feedback_data.push(row);
  }

  return {
    on_chain_feedback_data,
    on_chain_feedbacks_count,
    on_chain_feedbacks_valid_count,
    last_on_chain_feedback_record_at: optionalIsoString(o.last_on_chain_feedback_record_at),
  };
}

function tagSortKey(row: OnChainFeedbackRow): string {
  const sub = row.subcategory ?? '';
  return `${row.category}\0${sub}`;
}

export function buildCarouselRows(summary: OnChainFeedbackSummary): OnChainFeedbackRow[] {
  return [...summary.on_chain_feedback_data].sort((a, b) => {
    if (b.avg_score !== a.avg_score) return b.avg_score - a.avg_score;
    return tagSortKey(a).localeCompare(tagSortKey(b));
  });
}

export function formatFeedbackAvgScore(score: number): string {
  return score.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function feedbackValidRate(valid: number, total: number): number | null {
  if (total <= 0) return null;
  return (valid / total) * 100;
}

export function formatFeedbackRatePct(rate: number | null): string {
  if (rate === null) return '—';
  if (rate >= 10) return `${Math.round(rate)}%`;
  return `${rate.toFixed(1)}%`;
}
