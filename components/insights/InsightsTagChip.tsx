'use client';

import Link from 'next/link';
import { insightsTagLabels, type InsightsTagId } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import { insightsHref, withInsightsLang } from '@/lib/insights/site';
import { cn } from '@/lib/utils';

type InsightsTagChipProps = {
  tag: InsightsTagId;
  lang: 'es' | 'en';
  onInsightsHost: boolean;
  active?: boolean;
  muted?: boolean;
  interactive?: boolean;
};

export default function InsightsTagChip({
  tag,
  lang,
  onInsightsHost,
  active = false,
  muted = false,
  interactive = true,
}: InsightsTagChipProps) {
  const className = cn(
    'inline-flex rounded-full border px-2.5 py-0.5 text-xs tracking-wide',
    active
      ? 'border-amber-200/40 bg-amber-200/10 text-amber-100'
      : muted
        ? 'border-zinc-700/40 bg-transparent text-zinc-500'
        : 'border-zinc-700/50 bg-zinc-800/40 text-zinc-300',
    interactive && !active && !muted && 'transition-colors hover:border-amber-200/25 hover:text-amber-100',
    interactive && muted && 'transition-colors hover:border-zinc-600 hover:text-zinc-300',
  );
  const label = pick(lang, insightsTagLabels[tag]);

  if (!interactive) {
    return <span className={className}>{label}</span>;
  }

  const base = insightsHref(undefined, onInsightsHost);
  const href = withInsightsLang(
    active ? base : `${base}${base.includes('?') ? '&' : '?'}tag=${tag}`,
    lang,
  );

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
