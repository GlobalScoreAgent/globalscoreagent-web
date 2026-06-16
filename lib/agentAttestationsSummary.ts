export type AttestationsSummary = {
  attestation_score_avg: number;
  attestation_spam_count: number;
  attestations_total_count: number;
  attestations_valid_count: number;
  attestations_revoke_count: number;
  last_attestation_record_at: string | null;
  first_attestation_record_at: string | null;
};

export type AttestationsPieKey = 'valid' | 'spam' | 'revoke' | 'other';

function finiteNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function optionalIsoString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length > 0 ? s : null;
}

export function parseAttestationsSummary(raw: unknown): AttestationsSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const attestation_score_avg = finiteNumber(o.attestation_score_avg);
  const attestation_spam_count = finiteNumber(o.attestation_spam_count);
  const attestations_total_count = finiteNumber(o.attestations_total_count);
  const attestations_valid_count = finiteNumber(o.attestations_valid_count);
  const attestations_revoke_count = finiteNumber(o.attestations_revoke_count);
  if (
    attestation_score_avg === null ||
    attestation_spam_count === null ||
    attestations_total_count === null ||
    attestations_valid_count === null ||
    attestations_revoke_count === null
  ) {
    return null;
  }

  return {
    attestation_score_avg,
    attestation_spam_count,
    attestations_total_count,
    attestations_valid_count,
    attestations_revoke_count,
    last_attestation_record_at: optionalIsoString(o.last_attestation_record_at),
    first_attestation_record_at: optionalIsoString(o.first_attestation_record_at),
  };
}

export function attestationsRate(valid: number, total: number): number | null {
  if (total <= 0) return null;
  return (valid / total) * 100;
}

export function formatAttestationsRatePct(rate: number | null): string {
  if (rate === null) return '—';
  if (rate >= 10) return `${Math.round(rate)}%`;
  return `${rate.toFixed(1)}%`;
}

export function formatAttestationScoreAvg(score: number): string {
  return score.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function buildAttestationsPieRow(summary: AttestationsSummary): {
  rowKeys: AttestationsPieKey[];
  row: Record<AttestationsPieKey, number>;
} {
  const other = Math.max(
    0,
    summary.attestations_total_count -
      summary.attestations_valid_count -
      summary.attestation_spam_count -
      summary.attestations_revoke_count,
  );
  const row: Partial<Record<AttestationsPieKey, number>> = {};
  const rowKeys: AttestationsPieKey[] = [];

  if (summary.attestations_valid_count > 0) {
    row.valid = summary.attestations_valid_count;
    rowKeys.push('valid');
  }
  if (summary.attestation_spam_count > 0) {
    row.spam = summary.attestation_spam_count;
    rowKeys.push('spam');
  }
  if (summary.attestations_revoke_count > 0) {
    row.revoke = summary.attestations_revoke_count;
    rowKeys.push('revoke');
  }
  if (other > 0) {
    row.other = other;
    rowKeys.push('other');
  }

  return { rowKeys, row: row as Record<AttestationsPieKey, number> };
}
