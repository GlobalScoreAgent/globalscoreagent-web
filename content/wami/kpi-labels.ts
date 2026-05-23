import type { Bilingual } from '@/content/marketing/i18n';
import type { HumiDistributionKey } from '@/lib/web-page/statistics';

export type WamiWalletCategoryKey =
  | 'Explosive'
  | 'Hyper_Growth'
  | 'New_LowNonce'
  | 'New_HighNonce'
  | 'Steady_Active'
  | 'New_MediumNonce'
  | 'Sustained_Growth'
  | 'Dormant_HighNonce'
  | 'Old_Inactive_LowNonce'
  | 'Old_Inactive_HighNonce'
  | 'Old_Inactive_MediumNonce';

export const WAMI_WALLET_CATEGORY_KEYS: WamiWalletCategoryKey[] = [
  'Explosive',
  'Hyper_Growth',
  'New_LowNonce',
  'New_HighNonce',
  'Steady_Active',
  'New_MediumNonce',
  'Sustained_Growth',
  'Dormant_HighNonce',
  'Old_Inactive_LowNonce',
  'Old_Inactive_HighNonce',
  'Old_Inactive_MediumNonce',
];

export const wamiKpiLabels = {
  lastUpdated: {
    es: 'Última actualización',
    en: 'Last updated',
  } satisfies Bilingual,
  loading: {
    es: 'Cargando estadísticas del índice…',
    en: 'Loading index stats…',
  } satisfies Bilingual,
  unavailable: {
    es: 'Estadísticas del índice no disponibles',
    en: 'Index stats unavailable',
  } satisfies Bilingual,
  retry: {
    es: 'Reintentar',
    en: 'Retry',
  } satisfies Bilingual,
  walletsAnalysed: {
    es: 'Wallets analizadas',
    en: 'Wallets analyzed',
  } satisfies Bilingual,
  nonceTotal: {
    es: 'Nonces totales registrados',
    en: 'Total nonces to date',
  } satisfies Bilingual,
  nonceDeltaSubtitle: {
    es: 'Desde ayer (día UTC)',
    en: 'Since yesterday (UTC day)',
  } satisfies Bilingual,
  nonceDeltaTooltip: {
    es: 'Ejecutados entre ayer y hoy (día UTC)',
    en: 'Executed between yesterday and today (UTC day)',
  } satisfies Bilingual,
  nonceDeltaInfoLabel: {
    es: 'Información del delta de nonces',
    en: 'Nonce delta information',
  } satisfies Bilingual,
  walletLinkTitle: {
    es: 'Enlace wallet–agente',
    en: 'Wallet–agent link',
  } satisfies Bilingual,
  walletLinkValid: {
    es: 'A agente válido',
    en: 'To Agent Valid',
  } satisfies Bilingual,
  walletLinkNotValid: {
    es: 'A agente no válido',
    en: 'To Agent Invalid',
  } satisfies Bilingual,
  distributionCategoryHeader: {
    es: 'Categoría',
    en: 'Category',
  } satisfies Bilingual,
  distributionWalletsSubtitle: {
    es: 'Wallets totales',
    en: 'Total wallets',
  } satisfies Bilingual,
  distributionAvgSubtitle: {
    es: 'Puntuación media',
    en: 'Avg. score',
  } satisfies Bilingual,
  scoreRangeInfoLabel: {
    es: 'Información del rango de puntuación',
    en: 'Score range information',
  } satisfies Bilingual,
  walletCategoriesTitle: {
    es: 'Categorías de wallet',
    en: 'Wallet categories',
  } satisfies Bilingual,
  distribution: {
    '0_10': {
      band: { es: 'Crítica', en: 'Critical' },
      scoreRange: {
        es: 'Rango de puntuación WAMI: 0–10',
        en: 'WAMI score range: 0–10',
      },
    },
    '10_30': {
      band: { es: 'Riesgo moderado', en: 'Moderate risk' },
      scoreRange: {
        es: 'Rango de puntuación WAMI: 10–30',
        en: 'WAMI score range: 10–30',
      },
    },
    '30_60': {
      band: { es: 'Estable', en: 'Stable' },
      scoreRange: {
        es: 'Rango de puntuación WAMI: 30–60',
        en: 'WAMI score range: 30–60',
      },
    },
    '60_80': {
      band: { es: 'Alto rendimiento', en: 'High performance' },
      scoreRange: {
        es: 'Rango de puntuación WAMI: 60–80',
        en: 'WAMI score range: 60–80',
      },
    },
    '80_100': {
      band: { es: 'Elite', en: 'Elite' },
      scoreRange: {
        es: 'Rango de puntuación WAMI: 80–100',
        en: 'WAMI score range: 80–100',
      },
    },
  } satisfies Record<HumiDistributionKey, { band: Bilingual; scoreRange: Bilingual }>,
  walletCategoryLabels: {
    Explosive: { es: 'Explosivo', en: 'Explosive' },
    Hyper_Growth: { es: 'Hipercrecimiento', en: 'Hyper growth' },
    New_LowNonce: { es: 'Nueva · nonce bajo', en: 'New · low nonce' },
    New_HighNonce: { es: 'Nueva · nonce alto', en: 'New · high nonce' },
    Steady_Active: { es: 'Actividad estable', en: 'Steady active' },
    New_MediumNonce: { es: 'Nueva · nonce medio', en: 'New · medium nonce' },
    Sustained_Growth: { es: 'Crecimiento sostenido', en: 'Sustained growth' },
    Dormant_HighNonce: { es: 'Inactiva · nonce alto', en: 'Dormant · high nonce' },
    Old_Inactive_LowNonce: { es: 'Antigua inactiva · nonce bajo', en: 'Old inactive · low nonce' },
    Old_Inactive_HighNonce: { es: 'Antigua inactiva · nonce alto', en: 'Old inactive · high nonce' },
    Old_Inactive_MediumNonce: {
      es: 'Antigua inactiva · nonce medio',
      en: 'Old inactive · medium nonce',
    },
  } satisfies Record<WamiWalletCategoryKey, Bilingual>,
} as const;

export function formatWalletCategoryKey(key: string): string {
  return key.replace(/_/g, ' ');
}

export function getWalletCategoryLabel(
  key: string,
  language: 'es' | 'en'
): string {
  const known = wamiKpiLabels.walletCategoryLabels[key as WamiWalletCategoryKey];
  if (known) return known[language];
  return formatWalletCategoryKey(key);
}
