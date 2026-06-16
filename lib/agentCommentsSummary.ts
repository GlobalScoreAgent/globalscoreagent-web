export type CommentsSummary = {
  comment_count: number;
  comment_valid_count: number;
  comment_revoke_count: number;
  last_comment_record_at: string | null;
  first_comment_record_at: string | null;
};

export type CommentsPieKey = 'valid' | 'revoke' | 'other';

function finiteNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function optionalIsoString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length > 0 ? s : null;
}

export function parseCommentsSummary(raw: unknown): CommentsSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const comment_count = finiteNumber(o.comment_count);
  const comment_valid_count = finiteNumber(o.comment_valid_count);
  const comment_revoke_count = finiteNumber(o.comment_revoke_count);
  if (
    comment_count === null ||
    comment_valid_count === null ||
    comment_revoke_count === null
  ) {
    return null;
  }

  return {
    comment_count,
    comment_valid_count,
    comment_revoke_count,
    last_comment_record_at: optionalIsoString(o.last_comment_record_at),
    first_comment_record_at: optionalIsoString(o.first_comment_record_at),
  };
}

export function commentsRatio(valid: number, total: number): number | null {
  if (total <= 0) return null;
  return (valid / total) * 100;
}

export function formatCommentsRatioPct(ratio: number | null): string {
  if (ratio === null) return '—';
  if (ratio >= 10) return `${Math.round(ratio)}%`;
  return `${ratio.toFixed(1)}%`;
}

export function buildCommentsPieRow(summary: CommentsSummary): {
  rowKeys: CommentsPieKey[];
  row: Record<CommentsPieKey, number>;
} {
  const other = Math.max(
    0,
    summary.comment_count - summary.comment_valid_count - summary.comment_revoke_count,
  );
  const row: Partial<Record<CommentsPieKey, number>> = {};
  const rowKeys: CommentsPieKey[] = [];

  if (summary.comment_valid_count > 0) {
    row.valid = summary.comment_valid_count;
    rowKeys.push('valid');
  }
  if (summary.comment_revoke_count > 0) {
    row.revoke = summary.comment_revoke_count;
    rowKeys.push('revoke');
  }
  if (other > 0) {
    row.other = other;
    rowKeys.push('other');
  }

  return { rowKeys, row: row as Record<CommentsPieKey, number> };
}
