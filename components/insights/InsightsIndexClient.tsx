'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { formatInsightsCount, insightsCopy, type InsightsTagId } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import type { InsightsUpcomingEntry } from '@/content/insights/upcoming';
import InsightsFeaturedPost from '@/components/insights/InsightsFeaturedPost';
import InsightsPostList from '@/components/insights/InsightsPostList';
import InsightsStatsStrip from '@/components/insights/InsightsStatsStrip';
import InsightsTopicTags from '@/components/insights/InsightsTopicTags';
import InsightsUpcomingNotes from '@/components/insights/InsightsUpcomingNotes';
import type { LoadedInsightsPost } from '@/lib/insights/loadPost';

type InsightsIndexClientProps = {
  postsByLang: Record<'es' | 'en', LoadedInsightsPost[]>;
  upcoming: InsightsUpcomingEntry[];
  tagIds: InsightsTagId[];
  publishedTagIds: InsightsTagId[];
  activeTag: InsightsTagId | null;
  onInsightsHost: boolean;
};

export default function InsightsIndexClient({
  postsByLang,
  upcoming,
  tagIds,
  publishedTagIds,
  activeTag,
  onInsightsHost,
}: InsightsIndexClientProps) {
  const { language } = useLanguage();
  const posts = postsByLang[language];
  const filtered = activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts;
  const featured = filtered[0] ?? null;
  const rest = featured ? filtered.filter((post) => post.slug !== featured.slug) : [];

  return (
    <div className="space-y-16">
      <header>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-amber-200/80">
          {pick(language, insightsCopy.indexKicker)}
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-5xl">
          {pick(language, insightsCopy.indexTitle)}
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-400">
          {pick(language, insightsCopy.indexDek)}
        </p>
        <p className="mt-3 text-sm text-zinc-500">{formatInsightsCount(posts.length, language)}</p>
        <div className="mt-6 h-px w-16 bg-gradient-to-r from-amber-200/50 to-transparent" />
      </header>

      {featured ? (
        <InsightsFeaturedPost post={featured} onInsightsHost={onInsightsHost} />
      ) : (
        <p className="text-zinc-500">
          {pick(language, activeTag ? insightsCopy.emptyFilter : insightsCopy.empty)}
        </p>
      )}

      <InsightsStatsStrip lang={language} />

      <InsightsPostList posts={rest} onInsightsHost={onInsightsHost} />

      <InsightsUpcomingNotes
        items={upcoming}
        lang={language}
        onInsightsHost={onInsightsHost}
      />

      <InsightsTopicTags
        tags={tagIds}
        publishedTags={publishedTagIds}
        activeTag={activeTag}
        lang={language}
        onInsightsHost={onInsightsHost}
      />
    </div>
  );
}
