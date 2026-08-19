import type { Bilingual } from '@/content/marketing/i18n';

export const INSIGHTS_TAG_IDS = [
  'ecosystem',
  'metadata',
  'chains',
  'feedback',
  'endpoints',
] as const;

export type InsightsTagId = (typeof INSIGHTS_TAG_IDS)[number];

export const insightsTagLabels: Record<InsightsTagId, Bilingual> = {
  ecosystem: { es: 'Ecosistema', en: 'Ecosystem' },
  metadata: { es: 'Metadata', en: 'Metadata' },
  chains: { es: 'Chains', en: 'Chains' },
  feedback: { es: 'Feedback', en: 'Feedback' },
  endpoints: { es: 'Endpoints', en: 'Endpoints' },
};

export const insightsCopy = {
  brand: {
    es: 'GSA Insights',
    en: 'GSA Insights',
  } satisfies Bilingual,
  tagline: {
    es: 'Análisis del ecosistema ERC-8004',
    en: 'ERC-8004 ecosystem analysis',
  } satisfies Bilingual,
  indexKicker: {
    es: 'Publicación',
    en: 'Publication',
  } satisfies Bilingual,
  indexTitle: {
    es: 'Notas sobre el ecosistema ERC-8004',
    en: 'Notes on the ERC-8004 ecosystem',
  } satisfies Bilingual,
  indexDek: {
    es: 'Análisis periódico con datos que indexa Global Score Agent. El objeto es el ecosistema, no el producto.',
    en: 'Periodic analysis from data Global Score Agent indexes. The subject is the ecosystem, not the product.',
  } satisfies Bilingual,
  notesCount: {
    one: {
      es: '1 nota',
      en: '1 note',
    } satisfies Bilingual,
    other: {
      es: '{n} notas',
      en: '{n} notes',
    } satisfies Bilingual,
  },
  featured: {
    es: 'Destacada',
    en: 'Featured',
  } satisfies Bilingual,
  readNote: {
    es: 'Leer nota',
    en: 'Read note',
  } satisfies Bilingual,
  stubLabel: {
    es: 'Avance',
    en: 'Preview',
  } satisfies Bilingual,
  comingSoon: {
    es: 'Próximamente',
    en: 'Coming soon',
  } satisfies Bilingual,
  publishedHeading: {
    es: 'Notas publicadas',
    en: 'Published notes',
  } satisfies Bilingual,
  publishedDek: {
    es: 'Las más recientes primero, sin repetir la destacada.',
    en: 'Newest first, excluding the featured note.',
  } satisfies Bilingual,
  upcomingHeading: {
    es: 'Próximas notas',
    en: 'Upcoming notes',
  } satisfies Bilingual,
  upcomingDek: {
    es: 'Temas en preparación a partir de nuestros briefs de datos.',
    en: 'Topics in preparation from our data briefs.',
  } satisfies Bilingual,
  topicsHeading: {
    es: 'Temas',
    en: 'Topics',
  } satisfies Bilingual,
  topicsDek: {
    es: 'Filtrá por tema. Los chips tenues son notas aún no publicadas.',
    en: 'Filter by topic. Muted chips are notes not published yet.',
  } satisfies Bilingual,
  clearFilter: {
    es: 'Ver todas',
    en: 'Show all',
  } satisfies Bilingual,
  empty: {
    es: 'Todavía no hay notas publicadas.',
    en: 'No notes published yet.',
  } satisfies Bilingual,
  emptyFilter: {
    es: 'No hay notas publicadas con este tema.',
    en: 'No published notes with this topic.',
  } satisfies Bilingual,
  backToIndex: {
    es: 'Todas las notas',
    en: 'All notes',
  } satisfies Bilingual,
  tocTitle: {
    es: 'En esta nota',
    en: 'On this page',
  } satisfies Bilingual,
  readMinutes: {
    es: '{n} min de lectura',
    en: '{n} min read',
  } satisfies Bilingual,
  statsAgents: {
    es: 'Agentes indexados',
    en: 'Agents indexed',
  } satisfies Bilingual,
  statsChains: {
    es: 'Chains activas',
    en: 'Active chains',
  } satisfies Bilingual,
  statsFeedback: {
    es: 'Feedbacks',
    en: 'Feedbacks',
  } satisfies Bilingual,
  statsOwners: {
    es: 'Owners',
    en: 'Owners',
  } satisfies Bilingual,
  statsKicker: {
    es: 'El universo indexado',
    en: 'The indexed universe',
  } satisfies Bilingual,
  footerAttribution: {
    es: 'Datos indexados por Global Score Agent.',
    en: 'Data indexed by Global Score Agent.',
  } satisfies Bilingual,
  footerHome: {
    es: 'Sitio de Global Score Agent',
    en: 'Global Score Agent site',
  } satisfies Bilingual,
  languageAria: {
    es: 'Cambiar idioma',
    en: 'Change language',
  } satisfies Bilingual,
  headerHome: {
    es: 'Global Score Agent',
    en: 'Global Score Agent',
  } satisfies Bilingual,
  headerHomeAria: {
    es: 'Ir al sitio principal de Global Score Agent',
    en: 'Go to the Global Score Agent main site',
  } satisfies Bilingual,
  headerAllNotesAria: {
    es: 'Volver al índice de notas',
    en: 'Back to all notes',
  } satisfies Bilingual,
  seo: {
    title: {
      es: 'GSA Insights — investigación y datos sobre ERC-8004',
      en: 'GSA Insights — ERC-8004 research and on-chain data',
    } satisfies Bilingual,
    description: {
      es: 'Investigación original y datos indexados sobre el ecosistema de agentes ERC-8004: registros de identidad, reputation y validación, chains y tendencias de adopción en mainnet. Por Global Score Agent.',
      en: 'Original research and indexed data on the ERC-8004 agent ecosystem: identity, reputation and validation registries, chains, and mainnet adoption trends. By Global Score Agent.',
    } satisfies Bilingual,
  },
};

export function formatInsightsCount(n: number, lang: 'es' | 'en'): string {
  if (n === 1) return insightsCopy.notesCount.one[lang];
  return insightsCopy.notesCount.other[lang].replace('{n}', String(n));
}

export function formatReadMinutes(n: number, lang: 'es' | 'en'): string {
  return insightsCopy.readMinutes[lang].replace('{n}', String(n));
}
