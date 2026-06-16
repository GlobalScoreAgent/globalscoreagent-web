type Lang = 'es' | 'en';

export type PillarExecutiveSummaryKey =
  | 'key_strengths'
  | 'main_concerns'
  | 'recommendation'
  | 'overall_assessment'
  | 'business_interpretation';

export const PILLAR_EXECUTIVE_SUMMARY_ORDER: readonly PillarExecutiveSummaryKey[] = [
  'key_strengths',
  'main_concerns',
  'recommendation',
  'overall_assessment',
  'business_interpretation',
];

export type PillarExecutiveSummaryRow = {
  key: PillarExecutiveSummaryKey;
  label: string;
  description: string;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function getPillarExecutiveSummaryRaw(raw: unknown): Record<string, unknown> | null {
  if (!isPlainObject(raw)) return null;
  const summary = raw.summary;
  if (!isPlainObject(summary)) return null;
  return summary;
}

export function hasPillarExecutiveSummary(raw: unknown): boolean {
  return getPillarExecutiveSummaryRaw(raw) !== null;
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function localizedFieldValue(
  summary: Record<string, unknown>,
  key: PillarExecutiveSummaryKey,
  lang: Lang,
): string | null {
  const primary = lang === 'es' ? readNonEmptyString(summary[`${key}_esp`]) : readNonEmptyString(summary[`${key}_eng`]);
  if (primary) return primary;

  const fallback = lang === 'es' ? readNonEmptyString(summary[`${key}_eng`]) : readNonEmptyString(summary[`${key}_esp`]);
  return fallback;
}

function formatArrayFieldValue(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const items = value
    .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
    .filter((item) => item.length > 0);
  if (items.length === 0) return null;
  return items.join(' · ');
}

function formatFieldDescription(
  summary: Record<string, unknown>,
  key: PillarExecutiveSummaryKey,
  lang: Lang,
  emptyLabel: string,
): string {
  const isArrayField = key === 'key_strengths' || key === 'main_concerns';

  if (isArrayField) {
    const primary = lang === 'es' ? summary[`${key}_esp`] : summary[`${key}_eng`];
    const formatted = formatArrayFieldValue(primary);
    if (formatted) return formatted;

    const fallback = lang === 'es' ? summary[`${key}_eng`] : summary[`${key}_esp`];
    const fallbackFormatted = formatArrayFieldValue(fallback);
    return fallbackFormatted ?? emptyLabel;
  }

  return localizedFieldValue(summary, key, lang) ?? emptyLabel;
}

export function parsePillarExecutiveSummaryRows(
  raw: unknown,
  lang: Lang,
  labels: Record<PillarExecutiveSummaryKey, string>,
  emptyLabel: string,
): PillarExecutiveSummaryRow[] {
  const summary = getPillarExecutiveSummaryRaw(raw);
  if (!summary) return [];

  return PILLAR_EXECUTIVE_SUMMARY_ORDER.map((key) => ({
    key,
    label: labels[key],
    description: formatFieldDescription(summary, key, lang, emptyLabel),
  }));
}
