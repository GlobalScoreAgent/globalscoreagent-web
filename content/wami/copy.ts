import type { Bilingual } from '@/content/marketing/i18n';

export type WamiCriterion = {
  label: Bilingual;
  points: number;
};

export type WamiPillar = {
  id: 'origins' | 'portfolio' | 'activity' | 'multichain';
  title: Bilingual;
  summary: Bilingual;
  criteria: WamiCriterion[];
};

export type ComparisonRow = {
  name: Bilingual;
  provider: Bilingual;
  focus: Bilingual;
  scoreRange: Bilingual;
  dataUsed: Bilingual;
  advantage: Bilingual;
};

export const wamiCopy = {
  seo: {
    title: { es: 'Índice WAMI', en: 'WAMI Index' } satisfies Bilingual,
    description: {
      es: 'Índice WAMI: reputación 0–100 para wallets on-chain. Cuatro pilares independientes, integración con HUMI y acceso al Top 10 público de agentes.',
      en: 'WAMI Index: 0–100 reputation for on-chain wallets. Four independent pillars, HUMI integration, and access to the public Top 10 agent ranking.',
    } satisfies Bilingual,
  },
  hero: {
    title: { es: 'Índice WAMI', en: 'WAMI Index' } satisfies Bilingual,
    subtitle: {
      es: 'Capa de confianza para wallets ERC-8004 — metodología, pilares y estrategia de actualización.',
      en: 'Trust layer for ERC-8004 wallets — methodology, pillars, and refresh strategy in depth.',
    } satisfies Bilingual,
    backToPortal: { es: 'Volver al portal', en: 'Back to portal' } satisfies Bilingual,
    explorePillars: { es: 'Ver pilares', en: 'View pillars' } satisfies Bilingual,
    kpiContext: {
      es: 'Panel lateral: estadísticas del índice WAMI. Los datos del ecosistema ERC-8004 están en la página de inicio del portal.',
      en: 'Side panel: WAMI index statistics. ERC-8004 ecosystem data is on the portal home page.',
    } satisfies Bilingual,
  },
  ecosystem: {
    title: {
      es: 'WAMI en el ecosistema ERC-8004',
      en: 'WAMI in the ERC-8004 ecosystem',
    } satisfies Bilingual,
    intro: {
      es: 'Cada agente es controlado o registrado por una wallet. La calidad de esa wallet impacta directamente la credibilidad del agente.',
      en: 'Every agent is controlled or registered by a wallet. The quality of that wallet directly impacts the agent’s credibility.',
    } satisfies Bilingual,
    role: {
      es: 'WAMI actúa como capa de confianza para wallets, complementando a HUMI como capa de confianza del agente.',
      en: 'WAMI acts as a trust layer for wallets, complementing HUMI as the agent trust layer.',
    } satisfies Bilingual,
    enables: [
      {
        es: 'Evaluación automática de owners antes de interactuar con protocolos, governance o marketplaces.',
        en: 'Automatic evaluation of owners before they interact with protocols, governance, or marketplaces.',
      },
      {
        es: 'Evaluación de riesgo en tiempo real para wallets que interactúan con agentes.',
        en: 'Real-time risk assessment for wallets interacting with agents.',
      },
      {
        es: 'Integración con HUMI para reputación completa agente + wallet.',
        en: 'Integration with HUMI for full agent + wallet reputation.',
      },
    ] as Bilingual[],
  },
  benefits: {
    title: {
      es: 'Beneficios del Índice WAMI',
      en: 'Benefits of the WAMI Index',
    } satisfies Bilingual,
    items: [
      {
        es: 'Decisión de confianza instantánea con un solo número (0–100).',
        en: 'Instant trust decisions with a single number (0–100).',
      },
      {
        es: 'Reducción de riesgo: orígenes sospechosos, wash-trading o actividad artificial.',
        en: 'Risk reduction: suspicious funding origins, wash-trading, or unnatural activity.',
      },
      {
        es: 'Mejor reputación del agente: wallets WAMI altas refuerzan el HUMI del agente.',
        en: 'Better agent reputation: high-WAMI owner wallets strengthen agent HUMI scores.',
      },
      {
        es: 'Transparente y auditable: cada punto respaldado por datos on-chain explicables.',
        en: 'Transparent and auditable: every point backed by explainable on-chain data.',
      },
      {
        es: 'Escalable: se actualiza con nueva actividad de wallet procesada.',
        en: 'Scalable: updates automatically as new wallet activity is processed.',
      },
      {
        es: 'Oportunidades de negocio: APIs de scoring, alertas de riesgo y filtros avanzados.',
        en: 'Business opportunities: scoring APIs, risk alerts, and advanced search filters.',
      },
      {
        es: 'Estandarización del ecosistema: lenguaje común de confianza para dApps y protocolos.',
        en: 'Ecosystem standardization: common trust language for dApps and protocols.',
      },
    ] as Bilingual[],
  },
  humiSynergy: {
    title: {
      es: 'WAMI + HUMI: reputación completa',
      en: 'WAMI + HUMI: complete reputation',
    } satisfies Bilingual,
    body: {
      es: 'WAMI evalúa la wallet; HUMI evalúa el agente. Juntos responden: ¿el agente está bien construido y es controlado por una wallet confiable?',
      en: 'WAMI evaluates the wallet; HUMI evaluates the agent. Together they answer: is the agent well-built and controlled by a trustworthy wallet?',
    } satisfies Bilingual,
    cta: { es: 'Explorar Índice HUMI', en: 'Explore HUMI Index' } satisfies Bilingual,
  },
  comparison: {
    title: {
      es: 'Comparativa con índices externos',
      en: 'Comparison with external indices',
    } satisfies Bilingual,
    tableHeaders: {
      index: { es: 'Índice / Oráculo', en: 'Index / Oracle' } satisfies Bilingual,
      provider: { es: 'Proveedor', en: 'Provider' } satisfies Bilingual,
      focus: { es: 'Enfoque', en: 'Focus' } satisfies Bilingual,
      scoreRange: { es: 'Rango', en: 'Score range' } satisfies Bilingual,
      dataUsed: { es: 'Datos', en: 'Data used' } satisfies Bilingual,
      advantage: { es: 'Ventaja de WAMI', en: 'Key advantage of WAMI' } satisfies Bilingual,
    },
    rows: [
      {
        name: { es: 'Nansen Wallet Score', en: 'Nansen Wallet Score' } satisfies Bilingual,
        provider: { es: 'Nansen', en: 'Nansen' } satisfies Bilingual,
        focus: { es: 'Comportamiento y etiquetas de wallet', en: 'Wallet behavior & labels' } satisfies Bilingual,
        scoreRange: { es: '0–100', en: '0–100' } satisfies Bilingual,
        dataUsed: { es: 'Analytics off-chain + on-chain', en: 'Off-chain + on-chain analytics' } satisfies Bilingual,
        advantage: {
          es: 'WAMI es 100% on-chain y nativo de agentes ERC-8004',
          en: 'WAMI is fully on-chain and native to ERC-8004 Agents',
        } satisfies Bilingual,
      },
      {
        name: { es: 'Arkham Intelligence', en: 'Arkham Intelligence' } satisfies Bilingual,
        provider: { es: 'Arkham', en: 'Arkham' } satisfies Bilingual,
        focus: { es: 'Etiquetado de entidades y flujos', en: 'Entity labeling & fund flows' } satisfies Bilingual,
        scoreRange: { es: 'Basado en riesgo', en: 'Risk-based' } satisfies Bilingual,
        dataUsed: { es: 'On-chain + base de entidades', en: 'On-chain + entity database' } satisfies Bilingual,
        advantage: {
          es: 'WAMI ofrece un score 0–100 simple con pilares claros',
          en: 'WAMI provides a single, simple 0–100 score with pillars',
        } satisfies Bilingual,
      },
      {
        name: { es: 'Chainalysis / TRM Labs', en: 'Chainalysis / TRM Labs' } satisfies Bilingual,
        provider: { es: 'Chainalysis / TRM', en: 'Chainalysis / TRM' } satisfies Bilingual,
        focus: { es: 'Riesgo y cumplimiento', en: 'Risk & compliance scoring' } satisfies Bilingual,
        scoreRange: { es: 'Niveles de riesgo', en: 'Risk tiers' } satisfies Bilingual,
        dataUsed: { es: 'Intel on-chain + off-chain', en: 'On-chain + off-chain intel' } satisfies Bilingual,
        advantage: {
          es: 'WAMI es público, transparente y específico del agente',
          en: 'WAMI is public, transparent, and Agent-specific',
        } satisfies Bilingual,
      },
      {
        name: { es: 'Dune / Dashboards comunitarios', en: 'Dune / Community Dashboards' } satisfies Bilingual,
        provider: { es: 'Open-source', en: 'Open-source' } satisfies Bilingual,
        focus: { es: 'Métricas de wallet personalizadas', en: 'Custom wallet metrics' } satisfies Bilingual,
        scoreRange: { es: 'Variable', en: 'Varies' } satisfies Bilingual,
        dataUsed: { es: 'Consultas on-chain', en: 'On-chain queries' } satisfies Bilingual,
        advantage: {
          es: 'WAMI estandarizado, en tiempo real e integrado con GSA',
          en: 'WAMI is standardized, real-time, and integrated with GSA',
        } satisfies Bilingual,
      },
      {
        name: { es: 'EigenLayer / Otra reputación DeFi', en: 'EigenLayer / Other DeFi Rep.' } satisfies Bilingual,
        provider: { es: 'Varios DeFi', en: 'Various DeFi' } satisfies Bilingual,
        focus: { es: 'Staking y restaking', en: 'Staking & restaking reputation' } satisfies Bilingual,
        scoreRange: { es: 'Variable', en: 'Varies' } satisfies Bilingual,
        dataUsed: { es: 'Actividad por protocolo', en: 'Protocol-specific activity' } satisfies Bilingual,
        advantage: {
          es: 'WAMI funciona en todas las chains y está enfocado en owners de agentes',
          en: 'WAMI works across all chains and is Agent-owner focused',
        } satisfies Bilingual,
      },
    ] as ComparisonRow[],
    standOutTitle: {
      es: 'Por qué destaca WAMI',
      en: 'Why WAMI stands out',
    } satisfies Bilingual,
    standOut: [
      {
        es: 'Diseñado para el ecosistema ERC-8004 (la mayoría de herramientas son genéricas).',
        en: 'Purpose-built for the ERC-8004 Agent ecosystem (most external tools are general-purpose).',
      },
      {
        es: 'Totalmente on-chain y transparente, sin modelos caja negra propietarios.',
        en: 'Fully on-chain and transparent (no proprietary black-box models).',
      },
      {
        es: 'Integrado con HUMI para reputación completa agente + owner.',
        en: 'Integrated with HUMI for complete Agent + Owner reputation.',
      },
      {
        es: 'Datos directamente de blockchain (actividad de wallets vía Alchemy, Moralis y Zerion).',
        en: 'Data sourced directly from the blockchain (wallet activity via Alchemy, Moralis, and Zerion).',
      },
    ] as Bilingual[],
  },
  freshness: {
    title: {
      es: 'Frescura de datos y evaluación selectiva',
      en: 'Data freshness and selective evaluation',
    } satisfies Bilingual,
    intro: {
      es: 'WAMI prioriza precisión y eficiencia: selecciona qué wallets evaluar y cuándo refrescar cada módulo, en lugar de recalcular todo constantemente.',
      en: 'WAMI prioritizes accuracy and efficiency: it selects which wallets to score and when to refresh each module, rather than recalculating everything constantly.',
    } satisfies Bilingual,
    evaluatedTitle: {
      es: 'Qué wallets se evalúan',
      en: 'Which wallets are evaluated',
    } satisfies Bilingual,
    evaluated: [
      {
        es: 'Estado «valid» o «monitoring» con fecha de inicio de monitoreo.',
        en: 'Status “valid” or “monitoring” with an established start monitoring date.',
      },
      {
        es: 'Categorización por actividad real (crecimiento, hiperactivas, dormantes, etc.).',
        en: 'Categorization by real activity level (growth, hyperactive, dormant, etc.).',
      },
      {
        es: 'Solo wallets con historial on-chain relevante — sin ruido de direcciones irrelevantes.',
        en: 'Only wallets with meaningful on-chain history — no noise from irrelevant addresses.',
      },
    ] as Bilingual[],
    refreshedTitle: {
      es: 'Frecuencia de actualización por módulo',
      en: 'How often each module is refreshed',
    } satisfies Bilingual,
    refreshed: [
      {
        es: 'Orígenes y legitimidad: análisis foundational una vez al calificar la wallet.',
        en: 'Origins & legitimacy: foundational analysis once when the wallet first qualifies.',
      },
      {
        es: 'Flujos recientes, portfolio y multi-chain: cada 15 días (o antes si nunca calculado).',
        en: 'Recent flows, portfolio, and multi-chain: every 15 days (or immediately if never calculated).',
      },
      {
        es: 'Lógica «does need»: actualización solo cuando los datos están obsoletos.',
        en: '“Does need” logic: updates only when data is stale.',
      },
    ] as Bilingual[],
    approachTitle: {
      es: 'Por qué este enfoque',
      en: 'Why this approach',
    } satisfies Bilingual,
    approach: [
      {
        es: 'Máxima eficiencia: recursos en wallets que importan.',
        en: 'Maximum efficiency: resources focused on wallets that matter.',
      },
      {
        es: 'Frescura garantizada: datos dinámicos con menos de 15 días.',
        en: 'Guaranteed freshness: dynamic data no older than 15 days.',
      },
      {
        es: 'Escala sostenible: miles de wallets sin recálculos completos constantes.',
        en: 'Sustainable scale: thousands of wallets without constant full recalculations.',
      },
    ] as Bilingual[],
  },
  pillars: {
    title: { es: 'Los 4 pilares del WAMI', en: 'The 4 pillars of WAMI' } satisfies Bilingual,
    intro: {
      es: 'Cada pilar suma hasta 25 puntos. Haz clic en una tarjeta para ver los criterios evaluados.',
      en: 'Each pillar contributes up to 25 points. Click a card to see the evaluation criteria.',
    } satisfies Bilingual,
    flipHint: {
      es: 'Clic para ver criterios',
      en: 'Click to see criteria',
    } satisfies Bilingual,
    flipBack: {
      es: 'Clic para volver',
      en: 'Click to go back',
    } satisfies Bilingual,
    pointsLabel: { es: 'pts', en: 'pts' } satisfies Bilingual,
    list: [
      {
        id: 'origins',
        title: { es: 'Orígenes y legitimidad', en: 'Origins & legitimacy' } satisfies Bilingual,
        summary: {
          es: 'Qué tan limpia y natural es la historia de fondos de la wallet.',
          en: 'How clean and natural the wallet’s funding history is.',
        } satisfies Bilingual,
        criteria: [
          {
            label: {
              es: 'Calidad y legitimidad de los primeros fondos recibidos',
              en: 'Quality and legitimacy of the very first funds received',
            },
            points: 8,
          },
          {
            label: {
              es: 'Bajo riesgo de mixing o fuentes sospechosas',
              en: 'Low risk of mixing services or suspicious fund sources',
            },
            points: 7,
          },
          {
            label: {
              es: 'Poca dependencia de entradas desde CEX',
              en: 'Low reliance on centralized exchange (CEX) inflows',
            },
            points: 5,
          },
          {
            label: {
              es: 'Diversidad saludable de fuentes y remitentes',
              en: 'Healthy diversity of funding sources and senders',
            },
            points: 5,
          },
        ],
      },
      {
        id: 'portfolio',
        title: { es: 'Calidad de portfolio', en: 'Portfolio quality' } satisfies Bilingual,
        summary: {
          es: 'Salud, liquidez y sofisticación de los activos en la wallet.',
          en: 'Health, liquidity, and sophistication of assets held by the wallet.',
        } satisfies Bilingual,
        criteria: [
          {
            label: {
              es: 'Valor total del portfolio y salud general de activos',
              en: 'Total portfolio value and overall asset health',
            },
            points: 7,
          },
          {
            label: {
              es: 'Alta proporción de activos líquidos',
              en: 'High proportion of liquid (easily tradable) assets',
            },
            points: 6,
          },
          {
            label: {
              es: 'Diversificación entre tipos y categorías de tokens',
              en: 'Diversification across token types and categories',
            },
            points: 6,
          },
          {
            label: {
              es: 'Exposición equilibrada a stables y activos verificados',
              en: 'Balanced exposure to stables and verified assets',
            },
            points: 6,
          },
        ],
      },
      {
        id: 'activity',
        title: { es: 'Actividad y comportamiento', en: 'Activity & behavior' } satisfies Bilingual,
        summary: {
          es: 'Si la actividad reciente parece natural y sostenible.',
          en: 'Whether recent activity looks natural and sustainable.',
        } satisfies Bilingual,
        criteria: [
          {
            label: {
              es: 'Volumen y balance natural de entradas vs salidas',
              en: 'Natural volume and balance of inflows vs outflows',
            },
            points: 7,
          },
          {
            label: {
              es: 'Bajas señales de wash-trading o ciclos artificiales',
              en: 'Low signs of wash-trading or artificial transaction cycles',
            },
            points: 6,
          },
          {
            label: {
              es: 'Alto número de contrapartes únicas y genuinas',
              en: 'High number of unique, genuine counterparties',
            },
            points: 6,
          },
          {
            label: {
              es: 'Patrones sospechosos limitados (timing, CEX excesivo)',
              en: 'Limited suspicious patterns (shared wallets, concentrated timing)',
            },
            points: 6,
          },
        ],
      },
      {
        id: 'multichain',
        title: {
          es: 'Multi-chain y madurez',
          en: 'Multi-chain & maturity',
        } satisfies Bilingual,
        summary: {
          es: 'Antigüedad, presencia multi-red y consistencia de la wallet.',
          en: 'Wallet longevity, multi-network presence, and consistency.',
        } satisfies Bilingual,
        criteria: [
          {
            label: {
              es: 'Historial largo de actividad consistente',
              en: 'Long history of consistent activity',
            },
            points: 8,
          },
          {
            label: {
              es: 'Presencia activa en múltiples redes blockchain',
              en: 'Active presence across multiple blockchain networks',
            },
            points: 7,
          },
          {
            label: {
              es: 'Patrones de actividad coherentes entre chains',
              en: 'Balanced and coherent activity patterns across chains',
            },
            points: 5,
          },
          {
            label: {
              es: 'Madurez demostrada por engagement sostenido',
              en: 'Maturity demonstrated by sustained engagement',
            },
            points: 5,
          },
        ],
      },
    ] as WamiPillar[],
  },
  comingSoon: {
    title: {
      es: 'Dashboard + API completa',
      en: 'Full Dashboard + API',
    } satisfies Bilingual,
    description: {
      es: 'Consulta el WAMI Score de cualquier wallet, desglose por pilar y acceso vía API.',
      en: 'Query any wallet’s WAMI Score, per-pillar breakdown, and API access.',
    } satisfies Bilingual,
    features: [
      { es: 'Búsqueda avanzada de wallets', en: 'Advanced wallet search' },
      { es: 'Análisis detallado por pilar', en: 'Detailed per-pillar analysis' },
      { es: 'API con tu propia clave', en: 'API with your own key' },
      { es: 'Alertas de riesgo y filtros', en: 'Risk alerts and filters' },
    ] as Bilingual[],
  },
  cta: {
    title: {
      es: '¿Listo para evaluar wallets con WAMI?',
      en: 'Ready to evaluate wallets with WAMI?',
    } satisfies Bilingual,
    description: {
      es: 'Accede al dashboard para explorar scores WAMI y analizar wallets. La API pública estará disponible próximamente.',
      en: 'Access the dashboard to explore WAMI scores and analyze wallets. The public API is coming soon.',
    } satisfies Bilingual,
    button: { es: 'Acceder al Dashboard', en: 'Access Dashboard' } satisfies Bilingual,
  },
} as const;
