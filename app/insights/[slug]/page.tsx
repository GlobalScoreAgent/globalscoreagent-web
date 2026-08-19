import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import JsonLdScript from '@/components/marketing/seo/JsonLdScript';
import InsightsArticleClient from '@/components/insights/InsightsArticleClient';
import { getAllInsightsSlugs, getInsightsEntry } from '@/content/insights/manifest';
import { parseSeoLang } from '@/content/marketing/metadata';
import { buildInsightsArticleJsonLd } from '@/lib/insights/json-ld';
import { loadInsightsPostBothLanguages } from '@/lib/insights/loadPost';
import { buildInsightsPostMetadata } from '@/lib/insights/metadata';
import { isInsightsHostname } from '@/lib/insights/site';

type PageProps = {
  params: { slug: string };
  searchParams: { lang?: string | string[] };
};

export function generateStaticParams() {
  return getAllInsightsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  return buildInsightsPostMetadata(params.slug, parseSeoLang(searchParams.lang));
}

export default function InsightsArticlePage({ params, searchParams }: PageProps) {
  const entry = getInsightsEntry(params.slug);
  if (!entry) {
    notFound();
  }

  const lang = parseSeoLang(searchParams.lang);
  const onInsightsHost = isInsightsHostname(headers().get('host'));

  return (
    <>
      <JsonLdScript data={buildInsightsArticleJsonLd(entry, params.slug, lang, headers().get('host'))} />
      <InsightsArticleClient
        onInsightsHost={onInsightsHost}
        postsByLang={loadInsightsPostBothLanguages(params.slug)}
      />
    </>
  );
}
