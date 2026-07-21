'use client';

import {
  pickAgentLang,
  type AgentBilingual,
  type WalcertCertType,
  walcertDashboardCopy,
} from '@/content/dashboard/walcert-examples';
import { pick } from '@/content/marketing/i18n';
import { cn } from '@/lib/utils';

type BadgeKind = 'live' | 'example';

type Props = {
  lang: 'es' | 'en';
  isDark: boolean;
  badge: BadgeKind;
  type: WalcertCertType;
  grade: string;
  gradeLabel: AgentBilingual;
  wallet?: string;
  analyzedAt?: string;
  note?: AgentBilingual | string;
  summary?: AgentBilingual;
  strengths?: AgentBilingual[];
  concerns?: AgentBilingual[];
  highlights?: { label: AgentBilingual; value: string }[];
};

function gradeTone(grade: string): string {
  const g = grade.toUpperCase();
  if (g === 'A') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
  if (g === 'B') return 'bg-lime-500/15 text-lime-400 border-lime-500/40';
  if (g === 'C') return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
  if (g === 'D') return 'bg-orange-500/15 text-orange-400 border-orange-500/40';
  return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
}

export default function WalcertCertificateCard({
  lang,
  isDark,
  badge,
  type,
  grade,
  gradeLabel,
  wallet,
  analyzedAt,
  note,
  summary,
  strengths,
  concerns,
  highlights,
}: Props) {
  const copy = walcertDashboardCopy;
  const cardClass = isDark
    ? 'rounded-2xl border border-zinc-700/60 bg-zinc-950/50 p-5'
    : 'rounded-2xl border border-zinc-200 bg-white p-5';

  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const body = isDark ? 'text-zinc-200' : 'text-zinc-700';

  return (
    <article className={cardClass}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
            badge === 'live'
              ? 'bg-sky-500/15 text-sky-400'
              : 'bg-violet-500/15 text-violet-400',
          )}
        >
          {pick(lang, badge === 'live' ? copy.liveBadge : copy.exampleBadge)}
        </span>
        <span className={cn('text-xs font-medium uppercase tracking-wide', muted)}>
          {pick(lang, copy.typeNames[type])}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl font-bold',
            gradeTone(grade),
          )}
        >
          {grade}
        </div>
        <div>
          <p className={cn('text-xs uppercase tracking-wide', muted)}>
            {pick(lang, copy.grade)}
          </p>
          <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-zinc-900')}>
            {pickAgentLang(lang, gradeLabel)}
          </p>
        </div>
      </div>

      {wallet ? (
        <p className={cn('mb-2 break-all font-mono text-xs', muted)}>{wallet}</p>
      ) : null}
      {analyzedAt ? (
        <p className={cn('mb-3 text-xs', muted)}>
          {pick(lang, copy.analyzedAt)}:{' '}
          {new Intl.DateTimeFormat(lang, {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(analyzedAt))}
        </p>
      ) : null}

      {summary ? (
        <div className="mb-4">
          <h4 className={cn('mb-1 text-xs font-semibold uppercase tracking-wide', muted)}>
            {pick(lang, copy.summary)}
          </h4>
          <p className={cn('text-sm leading-relaxed', body)}>
            {pickAgentLang(lang, summary)}
          </p>
        </div>
      ) : null}

      {highlights && highlights.length > 0 ? (
        <div className="mb-4">
          <h4 className={cn('mb-2 text-xs font-semibold uppercase tracking-wide', muted)}>
            {pick(lang, copy.highlights)}
          </h4>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {highlights.map((h, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-xl border px-3 py-2',
                  isDark ? 'border-zinc-700/80 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50',
                )}
              >
                <dt className={cn('text-[10px] uppercase tracking-wide', muted)}>
                  {pickAgentLang(lang, h.label)}
                </dt>
                <dd className={cn('mt-0.5 text-sm font-semibold', body)}>{h.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {strengths && strengths.length > 0 ? (
        <div className="mb-3">
          <h4 className={cn('mb-1 text-xs font-semibold uppercase tracking-wide', muted)}>
            {pick(lang, copy.strengths)}
          </h4>
          <ul className={cn('space-y-1.5 text-sm', body)}>
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500">•</span>
                <span>{pickAgentLang(lang, s)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {concerns && concerns.length > 0 ? (
        <div className="mb-3">
          <h4 className={cn('mb-1 text-xs font-semibold uppercase tracking-wide', muted)}>
            {pick(lang, copy.concerns)}
          </h4>
          <ul className={cn('space-y-1.5 text-sm', body)}>
            {concerns.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-500">•</span>
                <span>{pickAgentLang(lang, c)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {note ? (
        <p className={cn('mt-3 border-t pt-3 text-xs leading-relaxed', muted, isDark ? 'border-zinc-800' : 'border-zinc-200')}>
          {pickAgentLang(lang, note)}
        </p>
      ) : null}
    </article>
  );
}
