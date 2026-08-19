'use client';

import { insightsCopy } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import type { InsightsUpcomingEntry } from '@/content/insights/upcoming';
import InsightsTagChip from '@/components/insights/InsightsTagChip';

type InsightsUpcomingNotesProps = {
  items: InsightsUpcomingEntry[];
  lang: 'es' | 'en';
  onInsightsHost: boolean;
};

export default function InsightsUpcomingNotes({
  items,
  lang,
  onInsightsHost,
}: InsightsUpcomingNotesProps) {
  if (items.length === 0) return null;

  return (
    <section id="upcoming" className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
        {pick(lang, insightsCopy.upcomingHeading)}
      </h2>
      <p className="mt-2 text-sm text-zinc-500">{pick(lang, insightsCopy.upcomingDek)}</p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="insights-card insights-glass rounded-2xl border border-dashed border-white/20 p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                {pick(lang, insightsCopy.comingSoon)}
              </span>
              {item.priority === 'high' ? (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-amber-200/70"
                  title="high"
                  aria-hidden
                />
              ) : null}
              {item.tags.map((tag) => (
                <InsightsTagChip
                  key={tag}
                  tag={tag}
                  lang={lang}
                  onInsightsHost={onInsightsHost}
                  muted
                  interactive={false}
                />
              ))}
            </div>
            <h3 className="mt-3 text-lg font-semibold leading-snug text-zinc-200">
              {pick(lang, item.title)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{pick(lang, item.description)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
