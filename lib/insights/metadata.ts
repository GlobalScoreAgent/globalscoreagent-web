import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { insightsCopy } from '@/content/insights/copy';
import { getInsightsEntry } from '@/content/insights/manifest';
import { pick } from '@/content/marketing/i18n';
import type { SeoLang } from '@/content/marketing/metadata';
import { insightsIndexKeywords, insightsPostKeywords } from '@/lib/insights/seo-keywords';
import { insightsCanonicalUrl } from '@/lib/insights/site';
import { SITE_URL } from '@/lib/seo/site';

function languageAlternates(canonical: string): NonNullable<Metadata['alternates']> {
  return {
    canonical,
    languages: {
      'en-US': canonical,
      'es-ES': `${canonical}?lang=es`,
      'x-default': canonical,
    },
  };
}

function localizedPageUrl(canonical: string, lang: SeoLang): string {
  return lang === 'es' ? `${canonical}?lang=es` : canonical;
}

function requestHost(): string | null {
  return headers().get('host');
}

const gsaAuthor: Metadata['authors'] = [
  { name: 'Global Score Agent', url: SITE_URL },
];

export function buildInsightsIndexMetadata(lang: SeoLang = 'en'): Metadata {
  const titleText = pick(lang, insightsCopy.seo.title);
  const descriptionText = pick(lang, insightsCopy.seo.description);
  const canonical = insightsCanonicalUrl(requestHost());
  const ogLocale = lang === 'en' ? 'en_US' : 'es_ES';
  const ogAlternate = lang === 'en' ? ['es_ES'] : ['en_US'];

  return {
    title: { absolute: titleText },
    description: descriptionText,
    keywords: insightsIndexKeywords(lang),
    authors: gsaAuthor,
    robots: { index: true, follow: true },
    openGraph: {
      title: titleText,
      description: descriptionText,
      url: localizedPageUrl(canonical, lang),
      siteName: 'GSA Insights',
      type: 'website',
      locale: ogLocale,
      alternateLocale: ogAlternate,
    },
    twitter: {
      card: 'summary',
      title: titleText,
      description: descriptionText,
    },
    alternates: languageAlternates(canonical),
  };
}

export function buildInsightsPostMetadata(slug: string, lang: SeoLang = 'en'): Metadata {
  const entry = getInsightsEntry(slug);
  if (!entry) {
    return { title: 'GSA Insights' };
  }

  const titleText = `${pick(lang, entry.title)} | GSA Insights`;
  const descriptionText = pick(lang, entry.description);
  const canonical = insightsCanonicalUrl(requestHost(), slug);
  const ogLocale = lang === 'en' ? 'en_US' : 'es_ES';
  const ogAlternate = lang === 'en' ? ['es_ES'] : ['en_US'];
  const coverAlt = entry.coverImageAlt
    ? pick(lang, entry.coverImageAlt)
    : pick(lang, entry.title);
  const ogImage = entry.coverImage
    ? new URL(entry.coverImage, SITE_URL).toString()
    : undefined;

  return {
    title: { absolute: titleText },
    description: descriptionText,
    keywords: insightsPostKeywords(entry, lang),
    authors: gsaAuthor,
    robots: { index: true, follow: true },
    openGraph: {
      title: titleText,
      description: descriptionText,
      url: localizedPageUrl(canonical, lang),
      siteName: 'GSA Insights',
      type: 'article',
      locale: ogLocale,
      alternateLocale: ogAlternate,
      publishedTime: `${entry.date}T00:00:00.000Z`,
      ...(ogImage
        ? {
            images: [{ url: ogImage, alt: coverAlt, width: 1200, height: 675 }],
          }
        : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: titleText,
      description: descriptionText,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: languageAlternates(canonical),
  };
}
