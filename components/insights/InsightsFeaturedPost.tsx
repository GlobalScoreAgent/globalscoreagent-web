'use client';

import Link from 'next/link';
import { formatReadMinutes, insightsCopy } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import InsightsTagChip from '@/components/insights/InsightsTagChip';
import InsightsCoverImage from '@/components/insights/InsightsCoverImage';
import type { LoadedInsightsPost } from '@/lib/insights/loadPost';
import { formatInsightsDate } from '@/lib/insights/formatDate';
import { insightsHref, withInsightsLang } from '@/lib/insights/site';

type InsightsFeaturedPostProps = {
  post: LoadedInsightsPost;
  onInsightsHost: boolean;
};

export default function InsightsFeaturedPost({
  post,
  onInsightsHost,
}: InsightsFeaturedPostProps) {
  const href = withInsightsLang(insightsHref(post.slug, onInsightsHost), post.lang);

  return (
    <article className="insights-card insights-glass group overflow-hidden rounded-2xl border border-white/10">
      <div className="grid md:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col p-6 md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-200/80">
            {pick(post.lang, insightsCopy.featured)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <InsightsTagChip
                key={tag}
                tag={tag}
                lang={post.lang}
                onInsightsHost={onInsightsHost}
                interactive={false}
              />
            ))}
            {post.status === 'stub' ? (
              <span className="text-xs uppercase tracking-wider text-zinc-500">
                {pick(post.lang, insightsCopy.stubLabel)}
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-4xl">
            <Link href={href} className="transition-colors group-hover:text-amber-100">
              {post.title}
            </Link>
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-400 md:text-lg md:leading-8">
            {post.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
            <time dateTime={post.date} className="text-amber-200/80">
              {formatInsightsDate(post.date, post.lang)}
            </time>
            <span aria-hidden className="text-zinc-700">
              ·
            </span>
            <span>{formatReadMinutes(post.readingMinutes, post.lang)}</span>
          </div>
          <Link
            href={href}
            className="mt-6 inline-flex w-fit items-center text-sm font-medium text-amber-200/90 transition-colors hover:text-amber-100"
          >
            {pick(post.lang, insightsCopy.readNote)} →
          </Link>
        </div>
        <div className="relative hidden min-h-[12rem] md:block">
          {post.coverImage ? (
            <InsightsCoverImage
              src={post.coverImage}
              alt={post.coverImageAlt ?? post.title}
              className="h-full min-h-[12rem] w-full object-cover"
            />
          ) : (
            <div
              className="h-full min-h-[12rem] bg-gradient-to-br from-white/5 via-amber-200/5 to-transparent"
              aria-hidden
            />
          )}
        </div>
      </div>
    </article>
  );
}
