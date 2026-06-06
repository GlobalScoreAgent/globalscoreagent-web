import type { Bilingual } from '@/content/marketing/i18n';

export type DocCategory = 'platform' | 'pricing' | 'humi' | 'wami' | 'agents' | 'wallets';

export type DocManifestEntry = {
  slug: string;
  category: DocCategory;
  order: number;
  title: Bilingual;
  description: Bilingual;
};

export const docsHubSeo = {
  title: {
    es: 'Documentación | Global Score Agent',
    en: 'Documentation | Global Score Agent',
  } satisfies Bilingual,
  description: {
    es: 'Guías oficiales sobre la plataforma GSA, índices HUMI y WAMI, evaluaciones de agentes, wallets y precios.',
    en: 'Official guides on the GSA platform, HUMI and WAMI indices, agent evaluations, wallets, and pricing.',
  } satisfies Bilingual,
};

export const docManifest: DocManifestEntry[] = [
  {
    slug: 'global-score-agent',
    category: 'platform',
    order: 1,
    title: {
      es: 'Global Score Agent – Plataforma de Reputación',
      en: 'Global Score Agent – Reputation Platform',
    },
    description: {
      es: 'Visión, misión, productos y propuesta de valor de la plataforma ERC-8004.',
      en: 'Vision, mission, products, and value proposition of the ERC-8004 platform.',
    },
  },
  {
    slug: 'gsa-pricing',
    category: 'pricing',
    order: 2,
    title: {
      es: 'Precios de Global Score Agent',
      en: 'Global Score Agent Pricing',
    },
    description: {
      es: 'Planes del dashboard, API pay-per-use y paquetes de créditos.',
      en: 'Dashboard plans, pay-per-use API, and credit packages.',
    },
  },
  {
    slug: 'index-humi',
    category: 'humi',
    order: 3,
    title: {
      es: 'Índice HUMI – Visión general',
      en: 'Index HUMI – Overview',
    },
    description: {
      es: 'Puntaje de reputación 0–100 para agentes ERC-8004 y sus cuatro pilares.',
      en: '0–100 reputation score for ERC-8004 agents and its four pillars.',
    },
  },
  {
    slug: 'index-humi-technical-spec',
    category: 'humi',
    order: 4,
    title: {
      es: 'Índice HUMI – Especificación técnica',
      en: 'Index HUMI – Technical Specification',
    },
    description: {
      es: 'Reglas de puntuación por pilar, sección e ítem del índice HUMI.',
      en: 'Scoring rules by pillar, section, and item for the HUMI index.',
    },
  },
  {
    slug: 'index-wami',
    category: 'wami',
    order: 5,
    title: {
      es: 'Índice WAMI – Visión general',
      en: 'Index WAMI – Overview',
    },
    description: {
      es: 'Puntaje de reputación 0–100 para wallets vinculadas a agentes.',
      en: '0–100 reputation score for wallets linked to agents.',
    },
  },
  {
    slug: 'index-wami-technical-spec',
    category: 'wami',
    order: 6,
    title: {
      es: 'Índice WAMI – Especificación técnica',
      en: 'Index WAMI – Technical Specification',
    },
    description: {
      es: 'Reglas de puntuación por pilar y sección del índice WAMI.',
      en: 'Scoring rules by pillar and section for the WAMI index.',
    },
  },
  {
    slug: 'agent-realness-analysis',
    category: 'agents',
    order: 7,
    title: {
      es: 'Análisis de Realness del Agente',
      en: 'Agent Realness Analysis',
    },
    description: {
      es: 'Cómo evaluamos la legitimidad y calidad básica de cada agente.',
      en: 'How we evaluate the basic legitimacy and quality of each agent.',
    },
  },
  {
    slug: 'agent-metadata-richness-analysis',
    category: 'agents',
    order: 8,
    title: {
      es: 'Puntaje de Riqueza de Metadatos',
      en: 'Metadata Richness Score',
    },
    description: {
      es: 'Medición de completitud y profesionalismo del perfil de un agente.',
      en: 'Measuring completeness and professionalism of an agent profile.',
    },
  },
  {
    slug: 'agent-warning-system',
    category: 'agents',
    order: 9,
    title: {
      es: 'Sistema de Advertencias de Agentes',
      en: 'Agent Warning System',
    },
    description: {
      es: 'Tipos de advertencias, severidad e impacto en la reputación HUMI.',
      en: 'Warning types, severity, and impact on HUMI reputation.',
    },
  },
  {
    slug: 'agent-feedback-types',
    category: 'agents',
    order: 10,
    title: {
      es: 'Tipos de Feedback de Agentes',
      en: 'Agent Feedback Types',
    },
    description: {
      es: 'Categorías de feedback ERC-8004 y su rol en la evaluación.',
      en: 'ERC-8004 feedback categories and their role in evaluation.',
    },
  },
  {
    slug: 'wallet-transactional-categories',
    category: 'wallets',
    order: 11,
    title: {
      es: 'Categorías Transaccionales de Wallets',
      en: 'Wallet Transactional Categories',
    },
    description: {
      es: 'Clasificación de comportamiento on-chain (Explosive, Stable, etc.).',
      en: 'On-chain behavior classification (Explosive, Stable, etc.).',
    },
  },
];

export function getAllDocSlugs(): string[] {
  return docManifest.map((entry) => entry.slug);
}

export function getDocManifestEntry(slug: string): DocManifestEntry | undefined {
  return docManifest.find((entry) => entry.slug === slug);
}

export function getDocsByCategory(): Record<DocCategory, DocManifestEntry[]> {
  const grouped = {} as Record<DocCategory, DocManifestEntry[]>;
  for (const entry of docManifest) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }
  for (const key of Object.keys(grouped) as DocCategory[]) {
    grouped[key].sort((a, b) => a.order - b.order);
  }
  return grouped;
}
