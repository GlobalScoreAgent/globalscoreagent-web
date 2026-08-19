import type { Metadata } from 'next';
import { headers } from 'next/headers';
import JsonLdScript from '@/components/marketing/seo/JsonLdScript';
import InsightsIndexClient from '@/components/insights/InsightsIndexClient';
import { insightsUpcoming } from '@/content/insights/upcoming';
import { parseSeoLang } from '@/content/marketing/metadata';
import { buildInsightsBlogJsonLd } from '@/lib/insights/json-ld';
import { listInsightsPosts } from '@/lib/insights/loadPost';
import { buildInsightsIndexMetadata } from '@/lib/insights/metadata';
import { isInsightsHostname } from '@/lib/insights/site';
import { collectInsightsTagIds, isInsightsTagId, publishedTagIds } from '@/lib/insights/tags';

type PageProps = {
  searchParams: { lang?: string | string[]; tag?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildInsightsIndexMetadata(parseSeoLang(searchParams.lang));
}

export default function InsightsIndexPage({ searchParams }: PageProps) {
  const onInsightsHost = isInsightsHostname(headers().get('host'));
  const lang = parseSeoLang(searchParams.lang);
  const rawTag = Array.isArray(searchParams.tag) ? searchParams.tag[0] : searchParams.tag;
  const activeTag = isInsightsTagId(rawTag) ? rawTag : null;

  return (
    <>
      <JsonLdScript data={buildInsightsBlogJsonLd(lang, headers().get('host'))} />
      <InsightsIndexClient
      onInsightsHost={onInsightsHost}
      upcoming={insightsUpcoming}
      tagIds={collectInsightsTagIds()}
      publishedTagIds={[...publishedTagIds()]}
      activeTag={activeTag}
      postsByLang={{
        en: listInsightsPosts('en'),
        es: listInsightsPosts('es'),
      }}
    />
    </>
  );
}
