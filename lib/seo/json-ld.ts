import { humiCopy } from '@/content/humi/copy';
import { wamiCopy } from '@/content/wami/copy';
import { organizationSameAs, SITE_URL } from '@/lib/seo/site';

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Global Score Agent',
  url: SITE_URL,
  email: 'hello@globalscoreagent.com',
  sameAs: [...organizationSameAs],
};

export const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Global Score Agent',
  url: SITE_URL,
  description:
    'Plataforma de reputación y confianza para ERC-8004. Los índices HUMI y WAMI ofrecen confianza medible on-chain para agentes y wallets.',
  publisher: {
    '@type': 'Organization',
    name: 'Global Score Agent',
    url: SITE_URL,
  },
};

export const humiProductJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'HUMI Index',
  description: humiCopy.seo.description.es,
  brand: {
    '@type': 'Brand',
    name: 'Global Score Agent',
  },
  provider: organizationJsonLd,
};

export const wamiProductJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'WAMI Index',
  description: wamiCopy.seo.description.es,
  brand: {
    '@type': 'Brand',
    name: 'Global Score Agent',
  },
  provider: organizationJsonLd,
};
