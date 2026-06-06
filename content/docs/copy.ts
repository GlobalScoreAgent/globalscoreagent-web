import type { Bilingual } from '@/content/marketing/i18n';
import type { DocCategory } from './manifest';

export const docsCopy = {
  hero: {
    title: {
      es: 'Documentación',
      en: 'Documentation',
    } satisfies Bilingual,
    subtitle: {
      es: 'Guías oficiales sobre la plataforma, índices HUMI y WAMI, evaluaciones y precios.',
      en: 'Official guides on the platform, HUMI and WAMI indices, evaluations, and pricing.',
    } satisfies Bilingual,
  },
  navTitle: {
    es: 'Índice',
    en: 'Index',
  } satisfies Bilingual,
  tocTitle: {
    es: 'Contenido',
    en: 'Contents',
  } satisfies Bilingual,
  viewSource: {
    es: 'Ver fuente en GitHub',
    en: 'View source on GitHub',
  } satisfies Bilingual,
  categories: {
    platform: { es: 'Plataforma', en: 'Platform' } satisfies Bilingual,
    pricing: { es: 'Precios', en: 'Pricing' } satisfies Bilingual,
    humi: { es: 'Índice HUMI', en: 'HUMI Index' } satisfies Bilingual,
    wami: { es: 'Índice WAMI', en: 'WAMI Index' } satisfies Bilingual,
    agents: { es: 'Agentes', en: 'Agents' } satisfies Bilingual,
    wallets: { es: 'Wallets', en: 'Wallets' } satisfies Bilingual,
  } satisfies Record<DocCategory, Bilingual>,
};
