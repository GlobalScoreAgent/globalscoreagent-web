import type { Metadata } from 'next';
import type { SeoLang } from '@/content/marketing/metadata';
import { SITE_URL } from '@/lib/seo/site';
import type { AgentRouteLookupBy } from '@/lib/dashboardAgentLookup';

export type PublicAgentSeoView = 'overview' | 'humi' | 'wami';

const AGENT_SEO = {
  overview: {
    titleSuffix: {
      es: 'Agente ERC-8004',
      en: 'ERC-8004 Agent',
    },
    descriptionFallback: {
      es: 'Perfil público de reputación on-chain: índices HUMI y WAMI, metadata y actividad verificable.',
      en: 'Public on-chain reputation profile: HUMI and WAMI indices, metadata, and verifiable activity.',
    },
  },
  humi: {
    titleSuffix: {
      es: 'Índice HUMI',
      en: 'HUMI Index',
    },
    descriptionFallback: {
      es: 'Desglose público del índice HUMI: puntuación, pilares y tendencia del agente ERC-8004.',
      en: 'Public HUMI index breakdown: score, pillars, and trend for this ERC-8004 agent.',
    },
  },
  wami: {
    titleSuffix: {
      es: 'Índice WAMI',
      en: 'WAMI Index',
    },
    descriptionFallback: {
      es: 'Desglose público del índice WAMI: puntuación por wallet, pilares y tendencia on-chain.',
      en: 'Public WAMI index breakdown: per-wallet score, pillars, and on-chain trend.',
    },
  },
} as const;

function truncate(text: string, max = 155): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function buildAgentCanonical(
  routeId: string,
  lookupBy: AgentRouteLookupBy,
  view: PublicAgentSeoView,
): string {
  const base = `${SITE_URL}/agents/${encodeURIComponent(routeId)}`;
  const path = view === 'overview' ? base : `${base}/${view}`;
  return lookupBy === 'agent_id' ? `${path}?by=agent_id` : path;
}

function buildLanguageAlternates(canonical: string): NonNullable<Metadata['alternates']> {
  const base = canonical.split('?')[0];
  const query = canonical.includes('?') ? canonical.slice(canonical.indexOf('?')) : '';
  return {
    canonical,
    languages: {
      'es-ES': canonical,
      'en-US': `${base}${query ? `${query}&` : '?'}lang=en`,
      'x-default': canonical,
    },
  };
}

export function buildPublicAgentMetadata(opts: {
  name: string;
  description: string | null;
  imageUrl: string | null;
  routeId: string;
  lookupBy: AgentRouteLookupBy;
  view: PublicAgentSeoView;
  lang: SeoLang;
}): Metadata {
  const { name, description, imageUrl, routeId, lookupBy, view, lang } = opts;
  const copy = AGENT_SEO[view];
  const titleText = `${name} — ${copy.titleSuffix[lang]} | Global Score Agent`;
  const descriptionText = truncate(description?.trim() || copy.descriptionFallback[lang]);
  const canonical = buildAgentCanonical(routeId, lookupBy, view);
  const ogLocale = lang === 'en' ? 'en_US' : 'es_ES';
  const ogAlternate = lang === 'en' ? ['es_ES'] : ['en_US'];
  const ogUrl = lang === 'en' ? `${canonical}${canonical.includes('?') ? '&' : '?'}lang=en` : canonical;

  const images = imageUrl
    ? [{ url: imageUrl, alt: name }]
    : [{ url: '/opengraph-image', width: 1200, height: 630, alt: titleText }];

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
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descriptionText,
      images: [imageUrl ?? '/opengraph-image'],
    },
    alternates: buildLanguageAlternates(canonical),
    robots: { index: true, follow: true },
  };
}
