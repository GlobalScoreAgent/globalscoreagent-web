import type { Bilingual } from '@/content/marketing/i18n';
import type { InsightsTagId } from '@/content/insights/copy';

export type InsightsPostStatus = 'stub' | 'published';

export type InsightsManifestEntry = {
  slug: string;
  date: string;
  status: InsightsPostStatus;
  title: Bilingual;
  description: Bilingual;
  tags: InsightsTagId[];
  readingMinutes?: number;
  coverImage?: string;
  coverImageAlt?: Bilingual;
  seoKeywords?: Partial<Record<'es' | 'en', string[]>>;
};

export const insightsManifest: InsightsManifestEntry[] = [
  {
    slug: 'erc-8004-eight-months-on-mainnet',
    date: '2026-08-19',
    status: 'published',
    tags: ['ecosystem'],
    readingMinutes: 11,
    title: {
      es: 'Ocho meses de ERC-8004 en mainnet',
      en: 'Eight months of ERC-8004 on mainnet',
    },
    description: {
      es: 'Si contás agentes, ves BNB. Si contás reputation, ves Base. A ocho meses, Identity escaló; los otros dos registros no lo siguieron.',
      en: 'Count agents and you are looking at BNB. Count reputation and you are looking at Base. Eight months in, Identity scaled; the other two registries did not follow.',
    },
    coverImage: '/blog/nota_1.png',
    coverImageAlt: {
      es: 'Ilustración editorial: una masa densa de nodos dorados sin conexión, frente a una red conectada, separadas por una grieta.',
      en: 'Editorial illustration: a dense mass of unconnected golden nodes facing a connected network, split by a crack.',
    },
    seoKeywords: {
      en: [
        'ERC-8004 mainnet',
        'ERC-8004 statistics',
        'identity registry adoption',
        'reputation registry',
        'validation registry',
        'BNB Chain agents',
        'Base chain agents',
        'Ethereum agent registry',
        'on-chain agent count',
        'trustless AI agents',
      ],
      es: [
        'ERC-8004 mainnet',
        'estadísticas ERC-8004',
        'adopción registro identidad',
        'registro reputation',
        'registro validación',
        'agentes BNB Chain',
        'agentes Base',
        'registro agentes Ethereum',
        'conteo agentes on-chain',
        'agentes IA sin confianza previa',
      ],
    },
  },
];

export function getInsightsEntry(slug: string): InsightsManifestEntry | undefined {
  return insightsManifest.find((entry) => entry.slug === slug);
}

export function getAllInsightsSlugs(): string[] {
  return insightsManifest.map((entry) => entry.slug);
}
