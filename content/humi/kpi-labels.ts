import type { Bilingual } from '@/content/marketing/i18n';

import type { HumiDistributionKey } from '@/lib/web-page/statistics';



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

    es: 'Información del rango de puntuación',

    en: 'Score range information',

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

    es: 'Categoría',

    en: 'Category',

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

    '0_10': {

      band: { es: 'Crítica', en: 'Critical' },

      scoreRange: {

        es: 'Rango de puntuación HUMI: 0–10',

        en: 'HUMI score range: 0–10',

      },

    },

    '10_30': {

      band: { es: 'Riesgo moderado', en: 'Moderate risk' },

      scoreRange: {

        es: 'Rango de puntuación HUMI: 10–30',

        en: 'HUMI score range: 10–30',

      },

    },

    '30_60': {

      band: { es: 'Estable', en: 'Stable' },

      scoreRange: {

        es: 'Rango de puntuación HUMI: 30–60',

        en: 'HUMI score range: 30–60',

      },

    },

    '60_80': {

      band: { es: 'Alto rendimiento', en: 'High performance' },

      scoreRange: {

        es: 'Rango de puntuación HUMI: 60–80',

        en: 'HUMI score range: 60–80',

      },

    },

    '80_100': {

      band: { es: 'Elite', en: 'Elite' },

      scoreRange: {

        es: 'Rango de puntuación HUMI: 80–100',

        en: 'HUMI score range: 80–100',

      },

    },

  } satisfies Record<HumiDistributionKey, { band: Bilingual; scoreRange: Bilingual }>,

} as const;

