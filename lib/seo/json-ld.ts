import type { SeoLang } from '@/content/marketing/metadata';
import { humiCopy } from '@/content/humi/copy';
import { wamiCopy } from '@/content/wami/copy';
import { walcertCopy } from '@/content/walcert/copy';
import type { PublicTop10AgentRow } from '@/lib/web-page/top-agents';
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
    'Plataforma de reputación y confianza para ERC-8004. Índices HUMI y WAMI, ranking público Top 10 y perfiles de agentes on-chain.',
  publisher: {
    '@type': 'Organization',
    name: 'Global Score Agent',
    url: SITE_URL,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/top-10-agents`,
    name: 'Top 10 ERC-8004 agents by HUMI',
  },
};

export const humiProductJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'HUMI Index',
  description: `${humiCopy.seo.description.es} Explora el ranking Top 10 de agentes.`,
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
  description: `${wamiCopy.seo.description.es} Consulta el Top 10 público de agentes ERC-8004.`,
  brand: {
    '@type': 'Brand',
    name: 'Global Score Agent',
  },
  provider: organizationJsonLd,
};

export const walcertProductJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Walcert Agent',
  description: walcertCopy.seo.description.es,
  url: `${SITE_URL}/walcert`,
  brand: {
    '@type': 'Brand',
    name: 'Global Score Agent',
  },
  provider: organizationJsonLd,
};

export function top10ItemListJsonLd(agents: PublicTop10AgentRow[], lang: SeoLang = 'es') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name:
      lang === 'en'
        ? 'Top 10 ERC-8004 agents by HUMI index'
        : 'Top 10 agentes ERC-8004 por índice HUMI',
    description:
      lang === 'en'
        ? 'Daily public ranking of ERC-8004 agents by HUMI reputation score.'
        : 'Ranking público diario de agentes ERC-8004 por puntuación HUMI.',
    url: `${SITE_URL}/top-10-agents`,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: agents.length,
    itemListElement: agents.map((agent, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/agents/${agent.agent_id}?by=agent_id`,
      name: agent.name,
    })),
  };
}
