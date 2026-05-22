import type { Bilingual } from '@/content/marketing/i18n';

export type HumiCriterion = {
  label: Bilingual;
  points: number;
};

export type HumiPillar = {
  id: 'history' | 'information' | 'measure' | 'usage';
  title: Bilingual;
  summary: Bilingual;
  criteria: HumiCriterion[];
};

export type ComparisonRow = {
  name: Bilingual;
  provider: Bilingual;
  focus: Bilingual;
  scoreRange: Bilingual;
  dataUsed: Bilingual;
  advantage: Bilingual;
};

export const humiCopy = {
  seo: {
    title: { es: 'Índice HUMI', en: 'HUMI Index' } satisfies Bilingual,
    description: {
      es: 'Índice HUMI: reputación 0–100 para agentes ERC-8004. Cuatro pilares independientes, datos on-chain verificables y actualización diaria.',
      en: 'HUMI Index: 0–100 reputation for ERC-8004 agents. Four independent pillars, verifiable on-chain data, and daily updates.',
    } satisfies Bilingual,
  },
  hero: {
    title: { es: 'Índice HUMI', en: 'HUMI Index' } satisfies Bilingual,
    subtitle: {
      es: 'Capa de confianza para agentes ERC-8004: metodología, pilares y actualización diaria.',
      en: 'Trust layer for ERC-8004 agents — methodology, pillars, and daily updates.',
    } satisfies Bilingual,
    backToPortal: { es: 'Volver al portal', en: 'Back to portal' } satisfies Bilingual,
    explorePillars: { es: 'Ver pilares', en: 'View pillars' } satisfies Bilingual,
    kpiContext: {
      es: 'Panel lateral: estadísticas del índice HUMI. Los datos del ecosistema ERC-8004 están en la página de inicio del portal.',
      en: 'Side panel: HUMI index statistics. ERC-8004 ecosystem data is on the portal home page.',
    } satisfies Bilingual,
  },
  ecosystem: {
    title: {
      es: 'HUMI en el ecosistema ERC-8004',
      en: 'HUMI in the ERC-8004 ecosystem',
    } satisfies Bilingual,
    intro: {
      es: 'Los agentes son entidades autónomas cuya credibilidad impacta adopción, governance, staking y marketplaces. HUMI actúa como la capa principal de confianza del agente.',
      en: 'Agents are autonomous entities whose credibility impacts adoption, governance, staking, and marketplaces. HUMI acts as the primary trust layer for the agent itself.',
    } satisfies Bilingual,
    daily: {
      es: 'Se recalcula diariamente consultando el Graph oficial de Ormi Labs en: BSC, Base, Polygon, BNB Chain, Arbitrum y Solana.',
      en: 'Recalculated daily using the official Ormi Labs Graph across BSC, Base, Polygon, BNB Chain, Arbitrum, and Solana.',
    } satisfies Bilingual,
    universal: {
      es: 'Aplica a todos los agentes — nuevos o antiguos, alta o baja actividad — con score justo y actualizado.',
      en: 'Applies to all agents — new or established, high or low activity — with a fair, up-to-date score.',
    } satisfies Bilingual,
    enables: [
      {
        es: 'Ranking y filtrado automático en dashboards y marketplaces.',
        en: 'Automatic ranking and filtering in dashboards and marketplaces.',
      },
      {
        es: 'Evaluación de riesgo antes de interacciones (ejecuciones, attestations, pagos).',
        en: 'Risk assessment before interactions (executions, attestations, payments).',
      },
      {
        es: 'Integración con WAMI para reputación completa agente + wallet.',
        en: 'Integration with WAMI for full agent + wallet reputation.',
      },
    ] as Bilingual[],
  },
  benefits: {
    title: {
      es: 'Beneficios del Índice HUMI',
      en: 'Benefits of the HUMI Index',
    } satisfies Bilingual,
    items: [
      {
        es: 'Decisión de confianza instantánea con un solo número (0–100).',
        en: 'Instant trust decisions with a single number (0–100).',
      },
      {
        es: 'Reducción de riesgo: detecta historial débil, metadata pobre o actividad sospechosa.',
        en: 'Risk reduction: flags weak ownership history, poor metadata, or suspicious activity.',
      },
      {
        es: 'Sinergia con WAMI: agente fuerte + wallet fuerte = máxima señal de confianza.',
        en: 'WAMI synergy: strong agent + strong wallet = maximum trust signal.',
      },
      {
        es: 'Transparente y auditable: cada punto respaldado por datos on-chain explicables.',
        en: 'Transparent and auditable: every point backed by explainable on-chain data.',
      },
      {
        es: 'Escalable: se actualiza con nueva actividad y análisis procesados.',
        en: 'Scalable: updates as new activity and analysis records are processed.',
      },
      {
        es: 'Estandarización del ecosistema: lenguaje común de confianza para dApps y protocolos.',
        en: 'Ecosystem standardization: common trust language for dApps and protocols.',
      },
    ] as Bilingual[],
  },
  wamiSynergy: {
    title: {
      es: 'HUMI + WAMI: reputación completa',
      en: 'HUMI + WAMI: complete reputation',
    } satisfies Bilingual,
    body: {
      es: 'HUMI evalúa el agente; WAMI evalúa la wallet que lo controla. Juntos responden: ¿el agente está bien construido y es controlado por una wallet confiable?',
      en: 'HUMI evaluates the agent; WAMI evaluates the wallet behind it. Together they answer: is the agent well-built and controlled by a trustworthy wallet?',
    } satisfies Bilingual,
    cta: { es: 'Explorar Índice WAMI', en: 'Explore WAMI Index' } satisfies Bilingual,
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
      advantage: { es: 'Ventaja de HUMI', en: 'Key advantage of HUMI' } satisfies Bilingual,
    },
    rows: [
      {
        name: { es: 'Nansen / Arkham Agent Scores', en: 'Nansen / Arkham Agent Scores' } satisfies Bilingual,
        provider: { es: 'Nansen / Arkham', en: 'Nansen / Arkham' } satisfies Bilingual,
        focus: { es: 'Etiquetado de wallets y entidades', en: 'Wallet & entity labeling' } satisfies Bilingual,
        scoreRange: { es: '0–100', en: '0–100' } satisfies Bilingual,
        dataUsed: { es: 'Analytics off-chain + on-chain', en: 'Off-chain + on-chain analytics' } satisfies Bilingual,
        advantage: {
          es: 'HUMI está diseñado para agentes ERC-8004',
          en: 'HUMI is purpose-built for ERC-8004 Agents',
        } satisfies Bilingual,
      },
      {
        name: { es: 'Chainalysis / TRM Labs', en: 'Chainalysis / TRM Labs' } satisfies Bilingual,
        provider: { es: 'Chainalysis / TRM', en: 'Chainalysis / TRM' } satisfies Bilingual,
        focus: { es: 'Riesgo y cumplimiento', en: 'Risk & compliance scoring' } satisfies Bilingual,
        scoreRange: { es: 'Niveles de riesgo', en: 'Risk tiers' } satisfies Bilingual,
        dataUsed: { es: 'Intel on-chain + off-chain', en: 'On-chain + off-chain intel' } satisfies Bilingual,
        advantage: {
          es: 'HUMI es público, transparente y específico del agente',
          en: 'HUMI is public, transparent, and Agent-specific',
        } satisfies Bilingual,
      },
      {
        name: { es: 'Dune / Dashboards comunitarios', en: 'Dune / Community Dashboards' } satisfies Bilingual,
        provider: { es: 'Open-source', en: 'Open-source' } satisfies Bilingual,
        focus: { es: 'Métricas on-chain personalizadas', en: 'Custom on-chain metrics' } satisfies Bilingual,
        scoreRange: { es: 'Variable', en: 'Varies' } satisfies Bilingual,
        dataUsed: { es: 'Consultas on-chain', en: 'On-chain queries' } satisfies Bilingual,
        advantage: {
          es: 'HUMI estandarizado, en tiempo real e integrado con GSA',
          en: 'HUMI is standardized, real-time, and integrated with GSA',
        } satisfies Bilingual,
      },
      {
        name: { es: 'EigenLayer / Reputación DeFi', en: 'EigenLayer / DeFi Reputation' } satisfies Bilingual,
        provider: { es: 'Varios DeFi', en: 'Various DeFi' } satisfies Bilingual,
        focus: { es: 'Staking y reputación de protocolo', en: 'Staking & protocol reputation' } satisfies Bilingual,
        scoreRange: { es: 'Variable', en: 'Varies' } satisfies Bilingual,
        dataUsed: { es: 'Actividad por protocolo', en: 'Protocol-specific activity' } satisfies Bilingual,
        advantage: {
          es: 'HUMI evalúa el ciclo de vida completo del agente en todas las chains',
          en: 'HUMI evaluates full Agent lifecycle across all chains',
        } satisfies Bilingual,
      },
      {
        name: { es: 'Scores genéricos de agentes IA', en: 'General AI Agent Scores' } satisfies Bilingual,
        provider: { es: 'Varios startups', en: 'Various startups' } satisfies Bilingual,
        focus: { es: 'Métricas off-chain de IA', en: 'Off-chain AI metrics' } satisfies Bilingual,
        scoreRange: { es: 'Variable', en: 'Varies' } satisfies Bilingual,
        dataUsed: { es: 'API + metadata', en: 'API + metadata' } satisfies Bilingual,
        advantage: {
          es: 'HUMI es 100% on-chain y ligado a registros ERC-8004',
          en: 'HUMI is fully on-chain and tied to ERC-8004 registrations',
        } satisfies Bilingual,
      },
    ] as ComparisonRow[],
    standOutTitle: {
      es: 'Por qué destaca HUMI',
      en: 'Why HUMI stands out',
    } satisfies Bilingual,
    standOut: [
      {
        es: 'Diseñado para el ecosistema ERC-8004 (la mayoría de herramientas son genéricas o solo wallet).',
        en: 'Purpose-built for the ERC-8004 Agent ecosystem (most external tools are general-purpose or wallet-only).',
      },
      {
        es: 'Totalmente on-chain y transparente, sin modelos caja negra propietarios.',
        en: 'Fully on-chain and transparent (no proprietary black-box models).',
      },
      {
        es: 'Integrado con WAMI para reputación completa agente + owner.',
        en: 'Integrated with WAMI for complete Agent + Owner reputation.',
      },
      {
        es: 'Datos directamente de blockchain (Graph Ormi Labs + actividad de wallets vía Alchemy, Moralis y Zerion).',
        en: 'Data sourced directly from the blockchain (Ormi Labs Graph + wallet activity via Alchemy, Moralis, and Zerion).',
      },
    ] as Bilingual[],
  },
  freshness: {
    title: {
      es: 'Frescura de datos y cobertura',
      en: 'Data freshness and coverage',
    } satisfies Bilingual,
    intro: {
      es: 'HUMI prioriza precisión y eficiencia. Recálculo diario con el Graph de Ormi Labs; scores con menos de 24 horas de antigüedad.',
      en: 'HUMI prioritizes accuracy and efficiency. Daily recalculation with the Ormi Labs Graph; scores never older than 24 hours.',
    } satisfies Bilingual,
    evaluatedTitle: {
      es: 'Qué agentes se evalúan',
      en: 'Which agents are evaluated',
    } satisfies Bilingual,
    evaluated: [
      { es: 'Agentes nuevos y antiguos', en: 'New and established agents' },
      { es: 'Alta y baja actividad', en: 'High and low activity' },
      { es: 'Todas las cadenas monitorizadas', en: 'All monitored chains' },
    ] as Bilingual[],
    refreshedTitle: {
      es: 'Qué se actualiza cada día',
      en: 'What is refreshed daily',
    } satisfies Bilingual,
    refreshed: [
      {
        es: 'Nonce y balance de wallets asociadas (owner y registro).',
        en: 'Nonce and balance of associated wallets (owner and registration).',
      },
      {
        es: 'Actividad on-chain y registros en las 6 cadenas monitorizadas.',
        en: 'On-chain activity and registration data across six monitored chains.',
      },
      {
        es: 'Punteros off-chain en registros ERC-8004: metadata URIs, DID y feedback de 21+ entidades externas.',
        en: 'Off-chain pointers in ERC-8004 records: metadata URIs, DID docs, and feedback from 21+ external entities.',
      },
    ] as Bilingual[],
    approachTitle: {
      es: 'Por qué este enfoque',
      en: 'Why this approach',
    } satisfies Bilingual,
    approach: [
      {
        es: 'Máxima frescura y cobertura universal de agentes.',
        en: 'Maximum freshness and universal agent coverage.',
      },
      {
        es: 'Profundidad: Graph on-chain + metadata off-chain importada.',
        en: 'Depth: on-chain Graph plus imported off-chain metadata.',
      },
      {
        es: 'Escala: filtrado inteligente evita recomputación innecesaria.',
        en: 'Scale: smart filtering avoids unnecessary recomputation.',
      },
    ] as Bilingual[],
  },
  pillars: {
    title: { es: 'Los 4 pilares del HUMI', en: 'The 4 pillars of HUMI' } satisfies Bilingual,
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
        id: 'history',
        title: { es: 'Historia (H)', en: 'History (H)' } satisfies Bilingual,
        summary: {
          es: 'Estabilidad de ownership y reputación histórica del agente.',
          en: 'Ownership stability and historical reputation of the agent.',
        } satisfies Bilingual,
        criteria: [
          {
            label: {
              es: 'Fuerza y actividad de la wallet owner',
              en: 'Strength and activity of the owner wallet',
            },
            points: 10,
          },
          {
            label: {
              es: 'Estabilidad de ownership (pocos o ningún cambio)',
              en: 'Ownership stability over time (few or no changes)',
            },
            points: 5,
          },
          {
            label: {
              es: 'Antigüedad de la wallet owner',
              en: 'Longevity of the owner wallet',
            },
            points: 5,
          },
          {
            label: {
              es: 'Calidad y actividad del portafolio de agentes del owner',
              en: "Quality and activity of the owner's agent portfolio",
            },
            points: 5,
          },
        ],
      },
      {
        id: 'information',
        title: { es: 'Información (I)', en: 'Information (I)' } satisfies Bilingual,
        summary: {
          es: 'Riqueza, profesionalismo y completitud de la identidad pública y metadata técnica.',
          en: 'Richness, professionalism, and completeness of public identity and technical metadata.',
        } satisfies Bilingual,
        criteria: [
          {
            label: {
              es: 'Calidad de nombre, descripción e imagen',
              en: 'Quality of name, description, and image',
            },
            points: 7.5,
          },
          {
            label: {
              es: 'Diversidad de fuentes (Chain + URI + externas)',
              en: 'Diversity of information sources (Chain + URI + external)',
            },
            points: 7.5,
          },
          {
            label: {
              es: 'Métodos de contacto y endpoints programáticos',
              en: 'Contact methods and programmatic endpoints',
            },
            points: 5,
          },
          {
            label: {
              es: 'Madurez técnica (trust, verificación, skills)',
              en: 'Technical maturity (trust, verification, skills)',
            },
            points: 5,
          },
        ],
      },
      {
        id: 'measure',
        title: { es: 'Medida (M)', en: 'Measure (M)' } satisfies Bilingual,
        summary: {
          es: 'Validación externa, riqueza de metadata y análisis especializado.',
          en: 'External validation, metadata richness, and specialized analysis.',
        } satisfies Bilingual,
        criteria: [
          {
            label: {
              es: 'Riqueza y completitud de metadata',
              en: 'Metadata richness and completeness',
            },
            points: 8,
          },
          {
            label: {
              es: 'Auditorías externas y actividad de protocolo',
              en: 'External audits and protocol activity',
            },
            points: 7,
          },
          {
            label: {
              es: 'Análisis de identidad y evaluaciones especializadas',
              en: 'Identity analysis and specialized evaluations',
            },
            points: 5,
          },
          {
            label: {
              es: 'Señales de calidad con ajustes por duplicidad y penalizaciones',
              en: 'Quality signals with duplication and penalty adjustments',
            },
            points: 5,
          },
        ],
      },
      {
        id: 'usage',
        title: { es: 'Uso (U)', en: 'Usage (U)' } satisfies Bilingual,
        summary: {
          es: 'Actividad on-chain real y nivel de engagement del agente.',
          en: "The agent's real on-chain activity and engagement level.",
        } satisfies Bilingual,
        criteria: [
          {
            label: {
              es: 'Actividad reciente natural y consistente (wallet + on-chain)',
              en: 'Natural, consistent recent activity (wallet + on-chain)',
            },
            points: 10,
          },
          {
            label: {
              es: 'Volumen y calidad de attestations, comentarios y ejecuciones',
              en: 'Volume and quality of attestations, comments, and executions',
            },
            points: 6,
          },
          {
            label: {
              es: 'Patrones avanzados: pagos y uso de protocolos',
              en: 'Advanced patterns: payments and protocol usage',
            },
            points: 5,
          },
          {
            label: {
              es: 'Ausencia de patrones sospechosos o penalizaciones',
              en: 'Absence of suspicious patterns or penalties',
            },
            points: 4,
          },
        ],
      },
    ] as HumiPillar[],
  },
  comingSoon: {
    badge: { es: 'Próximamente', en: 'Coming soon' } satisfies Bilingual,
    title: {
      es: 'Dashboard + API completa',
      en: 'Full Dashboard + API',
    } satisfies Bilingual,
    description: {
      es: 'Busca cualquier agente, consulta el desglose por pilar y accede al HUMI Score vía API.',
      en: 'Search any agent, view per-pillar breakdown, and access HUMI Score via API.',
    } satisfies Bilingual,
    features: [
      { es: 'Búsqueda avanzada de agentes', en: 'Advanced agent search' },
      { es: 'Análisis detallado por pilar', en: 'Detailed per-pillar analysis' },
      { es: 'API con tu propia clave', en: 'API with your own key' },
      { es: 'Dashboard personal', en: 'Personal dashboard' },
    ] as Bilingual[],
  },
  cta: {
    title: {
      es: '¿Listo para evaluar agentes con HUMI?',
      en: 'Ready to evaluate agents with HUMI?',
    } satisfies Bilingual,
    description: {
      es: 'Únete a la lista de espera para acceso anticipado al dashboard y la API.',
      en: 'Join the waitlist for early access to the dashboard and API.',
    } satisfies Bilingual,
    button: { es: 'Únete a la Lista de Espera', en: 'Join the Waitlist' } satisfies Bilingual,
  },
} as const;
