'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { formatReadMinutes, insightsCopy } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import InsightsMarkdown from '@/components/insights/InsightsMarkdown';
import InsightsReadingProgress from '@/components/insights/InsightsReadingProgress';
import InsightsTableOfContents from '@/components/insights/InsightsTableOfContents';
import InsightsTagChip from '@/components/insights/InsightsTagChip';
import InsightsCoverImage from '@/components/insights/InsightsCoverImage';
import type { LoadedInsightsPost } from '@/lib/insights/loadPost';
import { formatInsightsDate } from '@/lib/insights/formatDate';

type InsightsArticleClientProps = {
  postsByLang: Record<'es' | 'en', LoadedInsightsPost>;
  onInsightsHost: boolean;
};

export default function InsightsArticleClient({
  postsByLang,
  onInsightsHost,
}: InsightsArticleClientProps) {
  const { language } = useLanguage();
  const post = postsByLang[language];

  return (
    <div className="relative">
      <InsightsReadingProgress />

      <div className="lg:grid lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
        <aside className="mb-8 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <InsightsTableOfContents headings={post.headings} lang={language} />
        </aside>

        <article className="insights-glass min-w-0 max-w-[42rem] rounded-2xl border border-white/10 p-6 md:p-10 lg:max-w-none">
          {post.status === 'stub' ? (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-amber-200/80">
              {pick(language, insightsCopy.stubLabel)}
            </p>
          ) : null}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <InsightsTagChip
                key={tag}
                tag={tag}
                lang={language}
                onInsightsHost={onInsightsHost}
              />
            ))}
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-[2.75rem]">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 text-sm text-zinc-500">
            <time dateTime={post.date} className="text-amber-200/80">
              {formatInsightsDate(post.date, language)}
            </time>
            <span aria-hidden className="text-zinc-700">
              |
            </span>
            <span>{formatReadMinutes(post.readingMinutes, language)}</span>
          </div>
          {post.coverImage ? (
            <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
              <InsightsCoverImage
                src={post.coverImage}
                alt={post.coverImageAlt ?? post.title}
                priority
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          ) : null}
          <p className="mt-6 text-xl leading-8 text-zinc-300">{post.description}</p>
          <hr className="my-10 border-amber-200/15" />
          <InsightsMarkdown markdown={post.markdown} onInsightsHost={onInsightsHost} />
        </article>
      </div>
    </div>
  );
}
