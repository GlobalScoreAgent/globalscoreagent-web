'use client';

import { insightsCopy, type InsightsTagId } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import InsightsTagChip from '@/components/insights/InsightsTagChip';
import { insightsHref, withInsightsLang } from '@/lib/insights/site';

type InsightsTopicTagsProps = {
  tags: InsightsTagId[];
  publishedTags: InsightsTagId[];
  activeTag: InsightsTagId | null;
  lang: 'es' | 'en';
  onInsightsHost: boolean;
};

export default function InsightsTopicTags({
  tags,
  publishedTags,
  activeTag,
  lang,
  onInsightsHost,
}: InsightsTopicTagsProps) {
  if (tags.length === 0) return null;
  const published = new Set(publishedTags);
  const clearHref = withInsightsLang(insightsHref(undefined, onInsightsHost), lang);

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
        {pick(lang, insightsCopy.topicsHeading)}
      </h2>
      <p className="mt-2 text-sm text-zinc-500">{pick(lang, insightsCopy.topicsDek)}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <InsightsTagChip
            key={tag}
            tag={tag}
            lang={lang}
            onInsightsHost={onInsightsHost}
            active={activeTag === tag}
            muted={!published.has(tag)}
          />
        ))}
      </div>
      {activeTag ? (
        <p className="mt-3">
          <a href={clearHref} className="text-sm text-zinc-500 transition-colors hover:text-amber-200">
            {pick(lang, insightsCopy.clearFilter)}
          </a>
        </p>
      ) : null}
    </section>
  );
}
