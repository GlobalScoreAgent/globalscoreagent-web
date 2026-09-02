import type { SeoLang } from '@/content/marketing/metadata';
import { humiCopy } from '@/content/humi/copy';
import { wamiCopy } from '@/content/wami/copy';
import {
  WALCERT_AGENT_CARD_CONCORDIUM_URL,
  WALCERT_AGENT_CITY_URL,
  WALCERT_AGENT_FAMILY_LISTING_URL,
  WALCERT_AGENT_ID,
  WALCERT_AIGORA_PROFILE_URL,
  WALCERT_BASE_ERC8004_AGENT_ID,
  WALCERT_BASE_EXPLORER_URL,
  WALCERT_BNB_ERC8004_AGENT_ID,
  WALCERT_BNB_RECEIPT_CONTRACT_URL,
  WALCERT_CDP_BAZAAR_URL,
  WALCERT_CONCORDIUM_TOKEN_ID,
  WALCERT_ERC8257_TOOLS_BASE,
  WALCERT_ERC8257_TOOLS_ETH,
  WALCERT_ETH_ERC8004_AGENT_ID,
  WALCERT_EXPLORER_URL,
  WALCERT_LIVE_URL,
  WALCERT_REPO_URL,
  WALCERT_VIRTUALS_ACP_AGENT_URL,
  walcertCopy,
} from '@/content/walcert/copy';
import { walcertDevelopersCopy } from '@/content/walcert/developers-copy';
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

const walcertSameAs = [
  WALCERT_LIVE_URL,
  WALCERT_EXPLORER_URL,
  WALCERT_BASE_EXPLORER_URL,
  WALCERT_VIRTUALS_ACP_AGENT_URL,
  WALCERT_AGENT_FAMILY_LISTING_URL,
  WALCERT_AGENT_CITY_URL,
  WALCERT_CDP_BAZAAR_URL,
  WALCERT_AIGORA_PROFILE_URL,
  WALCERT_AGENT_CARD_CONCORDIUM_URL,
  WALCERT_REPO_URL,
  WALCERT_BNB_RECEIPT_CONTRACT_URL,
] as const;

/** Structured facts for crawlers / agents parsing /walcert. */
export const walcertProductJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/walcert#agent`,
      name: 'Walcert Agent',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: walcertCopy.seo.description.en,
      url: `${SITE_URL}/walcert`,
      image: `${SITE_URL}/walcert/opengraph-image`,
      brand: { '@type': 'Brand', name: 'Global Score Agent' },
      provider: { '@id': `${SITE_URL}/#organization` },
      softwareVersion: 'production',
      offers: {
        '@type': 'Offer',
        price: '0.05',
        priceCurrency: 'USD',
        description:
          'Full A–F wallet maturity certificate via x402 (USDC) on Celo, Base, or BNB. Free preview for origins/activity.',
        url: WALCERT_LIVE_URL,
        availability: 'https://schema.org/InStock',
      },
      sameAs: [...walcertSameAs],
      identifier: [
        {
          '@type': 'PropertyValue',
          name: 'ERC-8004 Celo agentId',
          value: WALCERT_AGENT_ID,
          description: 'Canonical issuance + giveFeedback anchor + x402 Celo + Aigora',
        },
        {
          '@type': 'PropertyValue',
          name: 'ERC-8004 Base agentId',
          value: WALCERT_BASE_ERC8004_AGENT_ID,
          description: 'Virtuals ACP identity + x402 Base',
        },
        {
          '@type': 'PropertyValue',
          name: 'ERC-8004 Ethereum agentId',
          value: WALCERT_ETH_ERC8004_AGENT_ID,
          description: `Agent City + ERC-8257 tools ${WALCERT_ERC8257_TOOLS_ETH}`,
        },
        {
          '@type': 'PropertyValue',
          name: 'ERC-8004 BNB agentId',
          value: WALCERT_BNB_ERC8004_AGENT_ID,
          description: 'Agent.family + x402 Permit2 + soulbound NFT receipt',
        },
        {
          '@type': 'PropertyValue',
          name: 'Concordium CIS-8004 External Agent',
          value: `#${WALCERT_CONCORDIUM_TOKEN_ID}`,
        },
      ],
      featureList: [
        'Origins certificate (Alchemy + DefiLlama + GSA labels)',
        'Activity certificate — 15-day window (Alchemy + DefiLlama + GSA labels)',
        'Multichain certificate — GoldRush multichain-v2.1 (footprint + intensity)',
        'Portfolio certificate (Zerion)',
        'Free preview: POST /v1/preview/{origins|activity}',
        'Paid certificate: POST /v1/certificates/{type} via x402 on Celo, Base, or BNB',
        'Public verify: POST /v1/verify by giveFeedback tx_hash (Celo)',
        'BNB payment: Permit2 + Dexter facilitator + soulbound NFT receipt claim',
        `ERC-8257 tools Base ${WALCERT_ERC8257_TOOLS_BASE} · Ethereum ${WALCERT_ERC8257_TOOLS_ETH}`,
      ],
      documentation: `${SITE_URL}/walcert/developers`,
      codeRepository: WALCERT_REPO_URL,
      keywords: walcertCopy.seo.keywords.join(', '),
    },
    {
      '@type': 'WebAPI',
      '@id': `${SITE_URL}/walcert#api`,
      name: 'Walcert Agent HTTP API',
      description:
        'Agent-to-agent HTTP JSON API for A–F wallet maturity certificates. Discovery via GET / (agent card).',
      url: WALCERT_LIVE_URL,
      documentation: `${SITE_URL}/walcert/developers`,
      provider: { '@id': `${SITE_URL}/#organization` },
      termsOfService: `${SITE_URL}/legal`,
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Global Score Agent',
      url: SITE_URL,
      email: 'hello@globalscoreagent.com',
      sameAs: [...organizationSameAs],
    },
  ],
};

/** Structured facts for crawlers / agents parsing /walcert/developers. */
export const walcertDevelopersJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: walcertDevelopersCopy.seo.title.en,
  description: walcertDevelopersCopy.seo.description.en,
  url: `${SITE_URL}/walcert/developers`,
  about: { '@id': `${SITE_URL}/walcert#agent` },
  keywords: walcertDevelopersCopy.seo.keywords.join(', '),
  author: organizationJsonLd,
  publisher: organizationJsonLd,
  mainEntity: {
    '@type': 'WebAPI',
    name: 'Walcert Agent HTTP API',
    url: WALCERT_LIVE_URL,
    documentation: `${SITE_URL}/walcert/developers`,
    potentialAction: [
      {
        '@type': 'ConsumeAction',
        name: 'GET agent card',
        target: `${WALCERT_LIVE_URL}/`,
      },
      {
        '@type': 'ConsumeAction',
        name: 'Free preview origins/activity',
        target: `${WALCERT_LIVE_URL}/v1/preview/{type}`,
      },
      {
        '@type': 'ConsumeAction',
        name: 'Paid certificate via x402 (Celo, Base, or BNB)',
        target: `${WALCERT_LIVE_URL}/v1/certificates/{type}`,
      },
      {
        '@type': 'ConsumeAction',
        name: 'Verify certificate by tx_hash',
        target: `${WALCERT_LIVE_URL}/v1/verify`,
      },
    ],
  },
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
