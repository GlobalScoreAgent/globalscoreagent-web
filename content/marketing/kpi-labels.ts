import type { Bilingual } from './i18n';



type KpiMetricLabels = {

  label: Bilingual;

  tooltip?: Bilingual;

};



export const mainKpiLabels = {

  chainsMonitored: {

    es: 'Cadenas monitoreadas',

    en: 'Chains monitored',

  } satisfies Bilingual,

  chainsMonitoredTooltip: {

    es: 'Cadenas con indexación ERC-8004 activa',

    en: 'Chains with active ERC-8004 indexing',

  } satisfies Bilingual,

  chainsEmpty: {

    es: 'Sin datos de cadenas',

    en: 'No chain data',

  } satisfies Bilingual,

  chainsInfoLabel: {

    es: 'Información de cadenas monitoreadas',

    en: 'Monitored chains information',

  } satisfies Bilingual,

  leadingChain: {

    es: 'Cadena líder',

    en: 'Leading chain',

  } satisfies Bilingual,

  metricInfoLabel: {

    es: 'Información de la métrica',

    en: 'Metric information',

  } satisfies Bilingual,

  lastUpdated: {

    es: 'Última actualización',

    en: 'Last updated',

  } satisfies Bilingual,

  loading: {

    es: 'Cargando estadísticas del ecosistema…',

    en: 'Loading ecosystem stats…',

  } satisfies Bilingual,

  unavailable: {

    es: 'Estadísticas no disponibles',

    en: 'Stats unavailable',

  } satisfies Bilingual,

  retry: {

    es: 'Reintentar',

    en: 'Retry',

  } satisfies Bilingual,

  localFallback: {

    es: ' · datos locales (API no disponible)',

    en: ' · local fallback (API unavailable)',

  } satisfies Bilingual,

  degradedBanner: {

    es: 'Mostrando cifras de respaldo. Comprueba la conexión con Supabase.',

    en: 'Showing fallback figures. Check Supabase connection.',

  } satisfies Bilingual,

  global: {

    agent_new: {

      label: { es: 'Agentes nuevos', en: 'New agents' },

      tooltip: {

        es: 'Registrados el día de ayer (día UTC)',

        en: 'Registered yesterday (UTC day)',

      },

    },

    agent_total: {

      label: { es: 'Agentes totales', en: 'Total agents' },

      tooltip: {

        es: 'Agentes indexados acumulados',

        en: 'Cumulative agents indexed',

      },

    },

    owner_total: {

      label: { es: 'Propietarios totales', en: 'Total owners' },

      tooltip: {

        es: 'Owners indexados acumulados',

        en: 'Cumulative owners indexed',

      },

    },

    agent_active: {

      label: { es: 'Agentes activos', en: 'Active agents' },

      tooltip: {

        es: 'Agentes con actividad reciente on-chain',

        en: 'Agents with recent on-chain activity',

      },

    },

    feedback_new: {

      label: { es: 'Feedbacks nuevos', en: 'New feedbacks' },

      tooltip: {

        es: 'Registrados el día de ayer (día UTC)',

        en: 'Recorded yesterday (UTC day)',

      },

    },

    feedback_total: {

      label: { es: 'Feedbacks totales', en: 'Total feedbacks' },

      tooltip: {

        es: 'Eventos de feedback acumulados',

        en: 'Cumulative feedback events',

      },

    },

    agent_with_feedback: {

      label: { es: 'Agentes con feedback', en: 'Agents with feedback' },

      tooltip: {

        es: 'Agentes con al menos un feedback',

        en: 'Agents that received at least one feedback',

      },

    },

  } satisfies Record<string, KpiMetricLabels>,

  top: {

    top_new_agents: {

      label: { es: 'Top agentes nuevos', en: 'Top new agents' },

      tooltip: {

        es: 'Mayor conteo el día de ayer (día UTC)',

        en: 'Highest count yesterday (UTC day)',

      },

    },

    top_total_agents: {

      label: { es: 'Top agentes (total)', en: 'Top agents (total)' },

      tooltip: {

        es: 'Cadena líder en esta métrica acumulada',

        en: 'Leading chain for this cumulative metric',

      },

    },

    top_total_owners: {

      label: { es: 'Top propietarios (total)', en: 'Top owners (total)' },

      tooltip: {

        es: 'Cadena líder en esta métrica acumulada',

        en: 'Leading chain for this cumulative metric',

      },

    },

    top_new_feedbacks: {

      label: { es: 'Top feedbacks nuevos', en: 'Top new feedbacks' },

      tooltip: {

        es: 'Mayor conteo el día de ayer (día UTC)',

        en: 'Highest count yesterday (UTC day)',

      },

    },

    top_total_feedbacks: {

      label: { es: 'Top feedbacks (total)', en: 'Top feedbacks (total)' },

      tooltip: {

        es: 'Cadena líder en esta métrica acumulada',

        en: 'Leading chain for this cumulative metric',

      },

    },

  } satisfies Record<string, KpiMetricLabels>,

} as const;



export type GlobalTotalKey = keyof typeof mainKpiLabels.global;

export type TopMetricKey = keyof typeof mainKpiLabels.top;

