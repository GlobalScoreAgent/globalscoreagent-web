import type { Metadata } from 'next';
import type { Bilingual } from '@/content/marketing/i18n';
import { humiCopy } from '@/content/humi/copy';
import { wamiCopy } from '@/content/wami/copy';
import { legalCopy } from '@/content/legal/copy';
import { pricingCopy } from '@/content/pricing/copy';
import { publicApiCopy } from '@/content/public-api/copy';
import { docsHubSeo, getDocManifestEntry } from '@/content/docs/manifest';
import { SITE_URL } from '@/lib/seo/site';

export { SITE_URL };

export type SeoLang = 'es' | 'en';

export function parseSeoLang(param: string | string[] | undefined): SeoLang {
  const v = Array.isArray(param) ? param[0] : param;
  if (v === 'es') return 'es';
  if (v === 'en') return 'en';
  return 'en';
}

function pickBilingual(b: Bilingual, lang: SeoLang): string {
  return lang === 'en' ? b.en : b.es;
}

const homeSeo = {
  title: {
    es: 'Global Score Agent — Reputación y confianza para agentes ERC-8004',
    en: 'Global Score Agent — Reputation and trust for ERC-8004 agents',
  } satisfies Bilingual,
  description: {
    es: 'Plataforma de reputación y confianza para ERC-8004. Los índices HUMI (agentes) y WAMI (wallets) ofrecen confianza medible on-chain. Explora el ranking público Top 10.',
    en: 'Reputation and trust platform for ERC-8004. HUMI (agents) and WAMI (wallets) indices deliver measurable on-chain trust. Explore the public Top 10 ranking.',
  } satisfies Bilingual,
};

type RouteMetaEntry = {
  title: Bilingual;
  description: Bilingual;
  canonical: string;
  ogPath: string;
};

export const routeMetadata = {
  humi: {
    title: humiCopy.seo.title,
    description: humiCopy.seo.description,
    canonical: `${SITE_URL}/humi`,
    ogPath: '/humi/opengraph-image',
  },
  wami: {
    title: wamiCopy.seo.title,
    description: wamiCopy.seo.description,
    canonical: `${SITE_URL}/wami`,
    ogPath: '/wami/opengraph-image',
  },
  legal: {
    title: legalCopy.seo.title,
    description: legalCopy.seo.description,
    canonical: `${SITE_URL}/legal`,
    ogPath: '/opengraph-image',
  },
  pricing: {
    title: pricingCopy.seo.title,
    description: pricingCopy.seo.description,
    canonical: `${SITE_URL}/pricing`,
    ogPath: '/opengraph-image',
  },
  publicApi: {
    title: publicApiCopy.seo.title,
    description: publicApiCopy.seo.description,
    canonical: `${SITE_URL}/public-api`,
    ogPath: '/opengraph-image',
  },
  docs: {
    title: docsHubSeo.title,
    description: docsHubSeo.description,
    canonical: `${SITE_URL}/docs/global-score-agent`,
    ogPath: '/opengraph-image',
  },
  top10Agents: {
    title: {
      es: 'Top 10 agentes | Global Score Agent',
      en: 'Top 10 agents | Global Score Agent',
    } satisfies Bilingual,
    description: {
      es: 'Ranking público de los 10 mejores agentes ERC-8004 por índice HUMI. Actualizado diariamente con datos on-chain verificables.',
      en: 'Public ranking of the top 10 ERC-8004 agents by HUMI index. Updated daily with verifiable on-chain data.',
    } satisfies Bilingual,
    canonical: `${SITE_URL}/top-10-agents`,
    ogPath: '/top-10-agents/opengraph-image',
  },
} as const satisfies Record<string, RouteMetaEntry>;

export type RouteMetadataKey = keyof typeof routeMetadata;

function buildOgImages(ogPath: string, alt: string): NonNullable<Metadata['openGraph']>['images'] {
  return [
    {
      url: ogPath,
      width: 1200,
      height: 630,
      alt,
    },
  ];
}

function buildLanguageAlternates(canonical: string): NonNullable<Metadata['alternates']> {
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

export function buildRouteMetadata(route: RouteMetadataKey, lang: SeoLang = 'en'): Metadata {
  const { title, description, canonical, ogPath } = routeMetadata[route];
  const titleText = pickBilingual(title, lang);
  const descriptionText = pickBilingual(description, lang);
  const ogLocale = lang === 'en' ? 'en_US' : 'es_ES';
  const ogAlternate = lang === 'en' ? ['es_ES'] : ['en_US'];
  const ogUrl = localizedPageUrl(canonical, lang);

  return {
    title: titleText,
    description: descriptionText,
    openGraph: {
      title: titleText,
      description: descriptionText,
      url: ogUrl,
      siteName: 'Global Score Agent',
      type: 'website',
      locale: ogLocale,
      alternateLocale: ogAlternate,
      images: buildOgImages(ogPath, titleText),
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descriptionText,
      images: [ogPath],
    },
    alternates: buildLanguageAlternates(canonical),
  };
}

export function buildHomeMetadata(lang: SeoLang = 'en'): Metadata {
  const titleText = pickBilingual(homeSeo.title, lang);
  const descriptionText = pickBilingual(homeSeo.description, lang);
  const canonical = SITE_URL;
  const ogLocale = lang === 'en' ? 'en_US' : 'es_ES';
  const ogAlternate = lang === 'en' ? ['es_ES'] : ['en_US'];
  const ogUrl = localizedPageUrl(canonical, lang);

  return {
    title: titleText,
    description: descriptionText,
    openGraph: {
      title: titleText,
      description: descriptionText,
      url: ogUrl,
      siteName: 'Global Score Agent',
      type: 'website',
      locale: ogLocale,
      alternateLocale: ogAlternate,
      images: buildOgImages('/opengraph-image', titleText),
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descriptionText,
      images: ['/opengraph-image'],
    },
    alternates: buildLanguageAlternates(canonical),
  };
}

export function buildDocMetadata(slug: string, lang: SeoLang = 'en'): Metadata {
  const entry = getDocManifestEntry(slug);
  if (!entry) {
    throw new Error(`Unknown documentation slug: ${slug}`);
  }

  const canonical = `${SITE_URL}/docs/${slug}`;
  const titleText = `${pickBilingual(entry.title, lang)} | Global Score Agent`;
  const descriptionText = pickBilingual(entry.description, lang);
  const ogLocale = lang === 'en' ? 'en_US' : 'es_ES';
  const ogAlternate = lang === 'en' ? ['es_ES'] : ['en_US'];

  return {
    title: titleText,
    description: descriptionText,
    openGraph: {
      title: titleText,
      description: descriptionText,
      url: localizedPageUrl(canonical, lang),
      siteName: 'Global Score Agent',
      type: 'article',
      locale: ogLocale,
      alternateLocale: ogAlternate,
      images: buildOgImages('/opengraph-image', titleText),
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descriptionText,
      images: ['/opengraph-image'],
    },
    alternates: buildLanguageAlternates(canonical),
  };
}
