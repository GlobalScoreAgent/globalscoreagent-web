'use client';

import { useEffect } from 'react';
import { insightsCopy } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import type { DocHeading } from '@/lib/docs/extractHeadings';
import { scrollToInsightsHeading } from '@/lib/insights/scrollToHeading';
import { cn } from '@/lib/utils';

type InsightsTableOfContentsProps = {
  headings: DocHeading[];
  lang: 'es' | 'en';
};

export default function InsightsTableOfContents({
  headings,
  lang,
}: InsightsTableOfContentsProps) {
  const items = headings.filter((heading) => heading.level === 2 || heading.level === 3);
  if (items.length === 0) return null;

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;

    const timer = window.setTimeout(() => {
      scrollToInsightsHeading(hash);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [headings]);

  return (
    <nav
      aria-label={pick(lang, insightsCopy.tocTitle)}
      className={cn(
        'insights-toc-panel rounded-2xl border border-white/10 p-4',
        'lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto',
      )}
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
        {pick(lang, insightsCopy.tocTitle)}
      </p>
      <ul className="space-y-1 border-l border-white/10 pl-3">
        {items.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(event) => {
                if (scrollToInsightsHeading(heading.id)) {
                  event.preventDefault();
                }
              }}
              className={cn(
                'block py-1 text-sm leading-6 text-zinc-300 transition-colors hover:text-amber-200',
                heading.level === 3 && 'pl-3 text-xs leading-5 text-zinc-400',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
