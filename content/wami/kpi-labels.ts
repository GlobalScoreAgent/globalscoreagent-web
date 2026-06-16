import type { Bilingual } from '@/content/marketing/i18n';
import type { WamiMaturityKey } from '@/lib/web-page/statistics';

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
    es: 'Madurez',
    en: 'Maturity',
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
    es: 'Información del nivel de madurez',
    en: 'Maturity level information',
  } satisfies Bilingual,
  walletCategoriesTitle: {
    es: 'Categorías de wallet',
    en: 'Wallet categories',
  } satisfies Bilingual,
  distribution: {
    Unstable: {
      band: { es: 'Unstable', en: 'Unstable' },
      scoreRange: { es: '0–49', en: '0–49' },
      userDescription: {
        es: 'Wallet de alto riesgo con orígenes sospechosos, baja actividad o baja calidad. Se requiere extrema precaución.',
        en: 'High-risk wallet with suspicious origins, low activity or poor quality. Extreme caution required.',
      },
    },
    Developing: {
      band: { es: 'Developing', en: 'Developing' },
      scoreRange: { es: '50–64', en: '50–64' },
      userDescription: {
        es: 'Wallet básica. Tiene presencia mínima pero aún es inmadura.',
        en: 'Basic wallet. Has minimal presence but still immature.',
      },
    },
    Stable: {
      band: { es: 'Stable', en: 'Stable' },
      scoreRange: { es: '65–79', en: '65–79' },
      userDescription: {
        es: 'Wallet confiable con calidad y madurez sólida. Recomendada para uso general.',
        en: 'Reliable wallet with solid quality and maturity. Recommended for general use.',
      },
    },
    'Very Stable': {
      band: { es: 'Very Stable', en: 'Very Stable' },
      scoreRange: { es: '80–89', en: '80–89' },
      userDescription: {
        es: 'Wallet madura, consistente y de alta calidad. Alta confiabilidad.',
        en: 'Mature, consistent, and high-quality wallet. High reliability.',
      },
    },
    Elite: {
      band: { es: 'Elite', en: 'Elite' },
      scoreRange: { es: '90–100', en: '90–100' },
      userDescription: {
        es: 'Wallet excepcional en el ecosistema. Máxima calidad y madurez.',
        en: 'Exceptional wallet in the ecosystem. Maximum quality and maturity.',
      },
    },
  } satisfies Record<WamiMaturityKey, { band: Bilingual; scoreRange: Bilingual; userDescription: Bilingual }>,
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
