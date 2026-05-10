/**
 * Parse `agent_feedback_analysis` JSON from agents — radar axes use fixed English
 * `subject` strings from the API; map them to i18n keys for display.
 */

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';

export type FeedbackAxisSubjectKey = keyof Pick<
  Translations,
  | 'feedbackAxisCommentQuality'
  | 'feedbackAxisAttestationQuality'
  | 'feedbackAxisFeedbackVolume'
  | 'feedbackAxisProtocolActivity'
  | 'feedbackAxisExecutionSuccess'
  | 'feedbackAxisAttestationValidity'
  | 'feedbackAxisPaidProtocolActivity'
  | 'feedbackAxisFreshness'
>;

export type ParsedFeedbackAxis = {
  subjectKey: FeedbackAxisSubjectKey;
  rawSubject: string;
  value: number;
  fullMark: number;
};

export type ParsedAgentFeedbackAnalysis = {
  axes: ParsedFeedbackAxis[];
};

/**
 * Vertex order for radar / legends: stable across agents regardless of API array order.
 * Matches documented API axis sequence (Comment Quality → … → Freshness).
 */
export const FEEDBACK_AXIS_CANONICAL_ORDER: readonly FeedbackAxisSubjectKey[] = [
  'feedbackAxisCommentQuality',
  'feedbackAxisAttestationQuality',
  'feedbackAxisFeedbackVolume',
  'feedbackAxisProtocolActivity',
  'feedbackAxisExecutionSuccess',
  'feedbackAxisAttestationValidity',
  'feedbackAxisPaidProtocolActivity',
  'feedbackAxisFreshness',
] as const;

function canonicalAxisOrderIndex(key: FeedbackAxisSubjectKey): number {
  const i = FEEDBACK_AXIS_CANONICAL_ORDER.indexOf(key);
  return i === -1 ? 999 : i;
}

/** Sort parsed axes by canonical dimension order (for numbered radar vertices). */
export function sortParsedFeedbackAxes(axes: ParsedFeedbackAxis[]): ParsedFeedbackAxis[] {
  return [...axes].sort(
    (a, b) => canonicalAxisOrderIndex(a.subjectKey) - canonicalAxisOrderIndex(b.subjectKey)
  );
}

/** API `subject` → translation key (stable contract). */
const SUBJECT_TO_KEY: Record<string, FeedbackAxisSubjectKey> = {
  'Comment Quality': 'feedbackAxisCommentQuality',
  'Attestation Quality': 'feedbackAxisAttestationQuality',
  'Feedback Volume': 'feedbackAxisFeedbackVolume',
  'Protocol Activity': 'feedbackAxisProtocolActivity',
  'Execution Success': 'feedbackAxisExecutionSuccess',
  'Attestation Validity': 'feedbackAxisAttestationValidity',
  'Paid Protocol Activity': 'feedbackAxisPaidProtocolActivity',
  Freshness: 'feedbackAxisFreshness',
};

function toFiniteNumber(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function parseAgentFeedbackAnalysis(raw: unknown): ParsedAgentFeedbackAnalysis | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object') return null;
  const axesRaw = (raw as { axes?: unknown }).axes;
  if (!Array.isArray(axesRaw) || axesRaw.length === 0) return null;

  const axes: ParsedFeedbackAxis[] = [];
  for (const item of axesRaw) {
    if (!item || typeof item !== 'object') continue;
    const subject =
      typeof (item as { subject?: unknown }).subject === 'string'
        ? String((item as { subject: string }).subject).trim()
        : '';
    const subjectKey = SUBJECT_TO_KEY[subject];
    if (!subjectKey) continue;

    const fullMark = toFiniteNumber((item as { fullMark?: unknown }).fullMark, 100);
    const cap = fullMark > 0 ? fullMark : 100;
    let value = toFiniteNumber((item as { value?: unknown }).value, 0);
    if (!Number.isFinite(value)) value = 0;
    value = Math.max(0, Math.min(cap, value));

    axes.push({
      subjectKey,
      rawSubject: subject,
      value,
      fullMark: cap,
    });
  }

  if (axes.length === 0) return null;
  return { axes: sortParsedFeedbackAxes(axes) };
}
