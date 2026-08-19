'use client';

import Link from 'next/link';
import { formatReadMinutes, insightsCopy } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import InsightsTagChip from '@/components/insights/InsightsTagChip';
import type { LoadedInsightsPost } from '@/lib/insights/loadPost';
import { formatInsightsDate } from '@/lib/insights/formatDate';
import { insightsHref, withInsightsLang } from '@/lib/insights/site';

type InsightsPostListProps = {
  posts: LoadedInsightsPost[];
  onInsightsHost: boolean;
};

export default function InsightsPostList({ posts, onInsightsHost }: InsightsPostListProps) {
  if (posts.length === 0) return null;
  const lang = posts[0].lang;

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
        {pick(lang, insightsCopy.publishedHeading)}
      </h2>
      <p className="mt-2 text-sm text-zinc-500">{pick(lang, insightsCopy.publishedDek)}</p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={withInsightsLang(insightsHref(post.slug, onInsightsHost), post.lang)}
              className="insights-card insights-glass group flex h-full flex-col rounded-2xl border border-white/10 p-5"
            >
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <InsightsTagChip
                    key={tag}
                    tag={tag}
                    lang={post.lang}
                    onInsightsHost={onInsightsHost}
                    interactive={false}
                  />
                ))}
              </div>
              <h3 className="mt-3 text-lg font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-amber-100">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-zinc-400">
                {post.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
                <time dateTime={post.date}>{formatInsightsDate(post.date, post.lang)}</time>
                <span aria-hidden>·</span>
                <span>{formatReadMinutes(post.readingMinutes, post.lang)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
