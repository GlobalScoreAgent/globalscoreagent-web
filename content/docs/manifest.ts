import type { Bilingual } from '@/content/marketing/i18n';

export type DocCategory =
  | 'platform'
  | 'api'
  | 'dashboard'
  | 'pricing'
  | 'humi'
  | 'wami'
  | 'agents'
  | 'wallets';

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
      es: 'Guías oficiales sobre la plataforma GSA, dashboard, índices HUMI y WAMI, evaluaciones de agentes, wallets y precios.',
      en: 'Official guides on the GSA platform, dashboard, HUMI and WAMI indices, agent evaluations, wallets, and pricing.',
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
    slug: 'erc-8004',
    category: 'platform',
    order: 2,
    title: {
      es: 'ERC-8004 – Agentes sin confianza previa',
      en: 'ERC-8004 – Trustless Agents',
    },
    description: {
      es: 'Estándar Ethereum para identidad, reputación y validación on-chain de agentes de IA.',
      en: 'Ethereum standard for on-chain identity, reputation, and validation of AI agents.',
    },
  },
  {
    slug: 'public-api-free-tier',
    category: 'api',
    order: 3,
    title: {
      es: 'API pública – Free Tier',
      en: 'Public API – Free Tier',
    },
    description: {
      es: 'Endpoints públicos gratuitos: búsqueda de agentes y nivel de madurez HUMI/WAMI.',
      en: 'Free public endpoints: agent search and HUMI/WAMI maturity level.',
    },
  },
  {
    slug: 'gsa-pricing',
    category: 'pricing',
    order: 4,
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
    order: 4,
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
    order: 5,
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
    order: 6,
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
    order: 7,
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
    order: 8,
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
    slug: 'agent-profile-processing',
    category: 'agents',
    order: 9,
    title: {
      es: 'Procesamiento de Perfiles de Agentes',
      en: 'Agent Profile Processing',
    },
    description: {
      es: 'Consolidación y priorización de metadata de agentes desde múltiples fuentes.',
      en: 'Consolidation and prioritization of agent metadata from multiple sources.',
    },
  },
  {
    slug: 'agent-metadata-richness-analysis',
    category: 'agents',
    order: 10,
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
    order: 11,
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
    order: 12,
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
    order: 13,
    title: {
      es: 'Categorías Transaccionales de Wallets',
      en: 'Wallet Transactional Categories',
    },
    description: {
      es: 'Clasificación de comportamiento on-chain (Explosive, Stable, etc.).',
      en: 'On-chain behavior classification (Explosive, Stable, etc.).',
    },
  },
  {
    slug: 'dashboard',
    category: 'dashboard',
    order: 20,
    title: {
      es: 'Dashboard – Visión general',
      en: 'Dashboard – Overview',
    },
    description: {
      es: 'Introducción al panel de control: navegación, búsqueda de agentes y gestión de cuenta.',
      en: 'Introduction to the control panel: navigation, agent search, and account management.',
    },
  },
  {
    slug: 'dashboard/home',
    category: 'dashboard',
    order: 21,
    title: {
      es: 'Dashboard – Inicio',
      en: 'Dashboard – Home',
    },
    description: {
      es: 'KPIs globales, Top 10, distribución y resumen por cadena en la página principal.',
      en: 'Global KPIs, Top 10, distribution charts, and per-chain summary on the home page.',
    },
  },
  {
    slug: 'dashboard/agents-directory',
    category: 'dashboard',
    order: 22,
    title: {
      es: 'Dashboard – Directorio de agentes',
      en: 'Dashboard – Agents Directory',
    },
    description: {
      es: 'Búsqueda, filtros avanzados y ordenación del listado de agentes ERC-8004.',
      en: 'Search, advanced filters, and sorting in the ERC-8004 agent directory.',
    },
  },
  {
    slug: 'dashboard/agent-general-overview',
    category: 'dashboard',
    order: 23,
    title: {
      es: 'Dashboard – Vista general del agente',
      en: 'Dashboard – Agent General Overview',
    },
    description: {
      es: 'Identidad, scores, warnings, metadata y wallets en la ficha de un agente.',
      en: 'Identity, scores, warnings, metadata, and wallets on an agent detail page.',
    },
  },
  {
    slug: 'dashboard/agent-humi-index',
    category: 'dashboard',
    order: 24,
    title: {
      es: 'Dashboard – Índice HUMI del agente',
      en: 'Dashboard – Agent HUMI Index',
    },
    description: {
      es: 'Puntaje HUMI, pilares, bloques y tendencia histórica de un agente.',
      en: 'HUMI score, pillars, blocks, and historical trend for an agent.',
    },
  },
  {
    slug: 'dashboard/agent-wami-index',
    category: 'dashboard',
    order: 25,
    title: {
      es: 'Dashboard – Índice WAMI del agente',
      en: 'Dashboard – Agent WAMI Index',
    },
    description: {
      es: 'Puntaje WAMI de la wallet del agente, pilares y análisis transaccional.',
      en: 'Agent wallet WAMI score, pillars, and transactional analysis.',
    },
  },
  {
    slug: 'dashboard/profile',
    category: 'dashboard',
    order: 26,
    title: {
      es: 'Dashboard – Perfil',
      en: 'Dashboard – Profile',
    },
    description: {
      es: 'Configuración de cuenta, idioma, tema y agentes favoritos.',
      en: 'Account settings, language, theme, and favorite agents.',
    },
  },
  {
    slug: 'dashboard/subscriptions',
    category: 'dashboard',
    order: 27,
    title: {
      es: 'Dashboard – Suscripciones',
      en: 'Dashboard – Subscriptions',
    },
    description: {
      es: 'Planes, contratación y gestión de la suscripción al dashboard.',
      en: 'Plans, checkout, and dashboard subscription management.',
    },
  },
  {
    slug: 'dashboard/feedbacks',
    category: 'dashboard',
    order: 28,
    title: {
      es: 'Dashboard – Comentarios',
      en: 'Dashboard – Feedbacks',
    },
    description: {
      es: 'Ver y enviar comentarios sobre agentes desde el dashboard.',
      en: 'View and submit agent feedback from the dashboard.',
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
