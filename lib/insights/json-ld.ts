import { pick } from '@/content/marketing/i18n';
import type { SeoLang } from '@/content/marketing/metadata';
import { insightsCopy } from '@/content/insights/copy';
import type { InsightsManifestEntry } from '@/content/insights/manifest';
import { insightsPostKeywords, insightsIndexKeywords } from '@/lib/insights/seo-keywords';
import { insightsCanonicalUrl } from '@/lib/insights/site';
import { organizationJsonLd } from '@/lib/seo/json-ld';
import { SITE_URL } from '@/lib/seo/site';

const ERC_8004_ABOUT = {
  '@type': 'DefinedTerm',
  name: 'ERC-8004',
  description: 'Ethereum standard for trustless autonomous AI agents (identity, reputation, validation).',
};

function localizedInsightsUrl(canonical: string, lang: SeoLang): string {
  return lang === 'es' ? `${canonical}?lang=es` : canonical;
}

export function buildInsightsBlogJsonLd(lang: SeoLang, host: string | null): Record<string, unknown>[] {
  const canonical = insightsCanonicalUrl(host);
  const url = localizedInsightsUrl(canonical, lang);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: pick(lang, insightsCopy.brand),
      description: pick(lang, insightsCopy.seo.description),
      url,
      inLanguage: lang === 'en' ? 'en-US' : 'es-ES',
      about: ERC_8004_ABOUT,
      publisher: organizationJsonLd,
      keywords: insightsIndexKeywords(lang).join(', '),
    },
  ];
}

export function buildInsightsArticleJsonLd(
  entry: InsightsManifestEntry,
  slug: string,
  lang: SeoLang,
  host: string | null,
): Record<string, unknown>[] {
  const canonical = insightsCanonicalUrl(host, slug);
  const url = localizedInsightsUrl(canonical, lang);
  const title = pick(lang, entry.title);
  const description = pick(lang, entry.description);
  const keywords = insightsPostKeywords(entry, lang);
  const image = entry.coverImage ? new URL(entry.coverImage, SITE_URL).toString() : undefined;
  const insightsIndexUrl = localizedInsightsUrl(insightsCanonicalUrl(host), lang);

  const blogPosting: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    datePublished: `${entry.date}T00:00:00.000Z`,
    dateModified: `${entry.date}T00:00:00.000Z`,
    inLanguage: lang === 'en' ? 'en-US' : 'es-ES',
    author: organizationJsonLd,
    publisher: organizationJsonLd,
    about: ERC_8004_ABOUT,
    keywords: keywords.join(', '),
    isPartOf: {
      '@type': 'Blog',
      name: pick(lang, insightsCopy.brand),
      url: insightsIndexUrl,
    },
  };

  if (image) {
    blogPosting.image = image;
  }

  return [
    blogPosting,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Global Score Agent',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pick(lang, insightsCopy.brand),
          item: insightsIndexUrl,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title,
          item: url,
        },
      ],
    },
  ];
}
