import type { Bilingual } from '@/content/marketing/i18n';

import type { HumiMaturityKey } from '@/lib/web-page/statistics';

export const humiKpiLabels = {
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

  bestAgent: {
    es: 'Mejor agente',
    en: 'Best agent',
  } satisfies Bilingual,

  bestAgentNameTooltipLabel: {
    es: 'Nombre completo del agente',
    en: 'Full agent name',
  } satisfies Bilingual,

  scoreRangeInfoLabel: {
    es: 'Información del nivel de madurez',
    en: 'Maturity level information',
  } satisfies Bilingual,

  humiScoreSuffix: {
    es: 'Puntuación HUMI',
    en: 'HUMI score',
  } satisfies Bilingual,

  totalAgentsAnalysed: {
    es: 'Agentes analizados',
    en: 'Agents analyzed',
  } satisfies Bilingual,

  avgTop100: {
    es: 'Media de los 100 mejores agentes',
    en: 'Top 100 agents (avg.)',
  } satisfies Bilingual,

  distributionCategoryHeader: {
    es: 'Madurez',
    en: 'Maturity',
  } satisfies Bilingual,

  distributionAgentsSubtitle: {
    es: 'Agentes totales',
    en: 'Total agents',
  } satisfies Bilingual,

  distributionAvgSubtitle: {
    es: 'Puntuación media',
    en: 'Avg. score',
  } satisfies Bilingual,

  distribution: {
    Unstable: {
      band: { es: 'Unstable', en: 'Unstable' },
      scoreRange: { es: '0–49', en: '0–49' },
      userDescription: {
        es: 'Agente de alto riesgo o muy baja madurez. Se requiere extrema precaución.',
        en: 'High-risk or very low maturity Agent. Extreme caution required.',
      },
    },
    Developing: {
      band: { es: 'Developing', en: 'Developing' },
      scoreRange: { es: '50–64', en: '50–64' },
      userDescription: {
        es: 'Agente básico. Tiene presencia mínima pero aún es inmaduro.',
        en: 'Basic Agent. Has minimal presence but still immature.',
      },
    },
    Stable: {
      band: { es: 'Stable', en: 'Stable' },
      scoreRange: { es: '65–79', en: '65–79' },
      userDescription: {
        es: 'Agente confiable con madurez intermedia sólida. Recomendado para uso general.',
        en: 'Reliable Agent with solid intermediate maturity. Recommended for general use.',
      },
    },
    'Very Stable': {
      band: { es: 'Very Stable', en: 'Very Stable' },
      scoreRange: { es: '80–89', en: '80–89' },
      userDescription: {
        es: 'Agente maduro, consistente y de alta calidad. Alta confiabilidad.',
        en: 'Mature, consistent, and high-quality Agent. High reliability.',
      },
    },
    Elite: {
      band: { es: 'Elite', en: 'Elite' },
      scoreRange: { es: '90–100', en: '90–100' },
      userDescription: {
        es: 'Agente de referencia en el ecosistema. Máxima calidad y madurez.',
        en: 'Reference Agent in the ecosystem. Maximum quality and maturity.',
      },
    },
  } satisfies Record<HumiMaturityKey, { band: Bilingual; scoreRange: Bilingual; userDescription: Bilingual }>,
} as const;
