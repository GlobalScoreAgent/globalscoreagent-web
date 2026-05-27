import type { Bilingual } from './i18n';

export const marketingCopy = {
  nav: {
    home: { es: 'Inicio', en: 'Home' } satisfies Bilingual,
    problem: { es: 'Problema', en: 'Problem' } satisfies Bilingual,
    mission: { es: 'Misión', en: 'Mission' } satisfies Bilingual,
    products: { es: 'Productos', en: 'Products' } satisfies Bilingual,
    humi: { es: 'Índice HUMI', en: 'HUMI Index' } satisfies Bilingual,
    wami: { es: 'Índice WAMI', en: 'WAMI Index' } satisfies Bilingual,
    howWeWork: { es: 'Cómo operamos', en: 'How we work' } satisfies Bilingual,
    subscriptions: { es: 'Suscripciones', en: 'Subscriptions' } satisfies Bilingual,
    legal: { es: 'Legal', en: 'Legal' } satisfies Bilingual,
    expandSidebar: { es: 'Expandir menú', en: 'Expand menu' } satisfies Bilingual,
    collapseSidebar: { es: 'Contraer menú', en: 'Collapse menu' } satisfies Bilingual,
  },
  topBar: {
    accessDashboard: { es: 'Acceder al Dashboard', en: 'Access Dashboard' } satisfies Bilingual,
    accessDashboardShort: { es: 'Dashboard', en: 'Dashboard' } satisfies Bilingual,
  },
  hero: {
    eyebrow: {
      es: 'INFRAESTRUCTURA DE REPUTACIÓN · ERC-8004',
      en: 'REPUTATION INFRASTRUCTURE · ERC-8004',
    } satisfies Bilingual,
    h1: {
      es: 'La plataforma de reputación y confianza para ERC-8004',
      en: 'The reputation and trust platform for ERC-8004',
    } satisfies Bilingual,
    subtitle: {
      es: 'Convertimos la confianza en una métrica medible, transparente y accionable. Evaluamos con objetividad la calidad real de cualquier agente y de la wallet que lo controla.',
      en: 'We turn trust into a measurable, transparent, and actionable metric. We objectively evaluate the real quality of any agent and the wallet that controls it.',
    } satisfies Bilingual,
    microcopy: {
      es: 'Sé parte del futuro de los agentes en ERC-8004.',
      en: 'Be part of the future of agents in ERC-8004.',
    } satisfies Bilingual,
    kpiContext: {
      es: 'Panel lateral: estadísticas en vivo del ecosistema ERC-8004. Las métricas del índice HUMI están en la página HUMI.',
      en: 'Side panel: live ERC-8004 ecosystem statistics. HUMI index metrics are on the HUMI page.',
    } satisfies Bilingual,
  },
  problem: {
    title: { es: 'El problema que resolvemos', en: 'The problem we solve' } satisfies Bilingual,
    intro: {
      es: 'El ecosistema ERC-8004 enfrenta desafíos críticos de confianza:',
      en: 'The ERC-8004 ecosystem faces critical trust challenges:',
    } satisfies Bilingual,
    items: [
      {
        es: 'Dificultad para distinguir agentes legítimos de los creados con fines especulativos, sybil o maliciosos.',
        en: 'Difficulty distinguishing legitimate agents from those created for speculative, sybil, or malicious purposes.',
      },
      {
        es: 'Falta de visibilidad sobre la reputación real de la wallet que posee o registra cada agente.',
        en: 'Lack of visibility into the real reputation of the wallet that owns or registers each agent.',
      },
      {
        es: 'Ausencia de métricas de confianza estandarizadas, transparentes y on-chain.',
        en: 'Absence of standardized, transparent on-chain trust metrics.',
      },
      {
        es: 'Alto riesgo para usuarios y protocolos que interactúan sin conocer historial ni comportamiento real.',
        en: 'High risk for users and protocols interacting without knowing history or actual behavior.',
      },
    ] as Bilingual[],
    closing: {
      es: 'Sin una capa sólida de reputación, la adopción masiva de agentes queda limitada por la desconfianza.',
      en: 'Without a solid reputation layer, mass adoption of agents is limited by distrust.',
    } satisfies Bilingual,
  },
  mission: {
    title: {
      es: 'El estándar de confianza en ERC-8004',
      en: 'The trust standard for ERC-8004',
    } satisfies Bilingual,
    items: [
      {
        es: 'Crear métricas de reputación objetivas, auditables y on-chain.',
        en: 'Create objective, auditable, fully on-chain reputation metrics.',
      },
      {
        es: 'Ayudar a los usuarios a tomar decisiones informadas con rapidez.',
        en: 'Help users make informed decisions quickly.',
      },
      {
        es: 'Ofrecer a los protocolos herramientas para gestionar riesgo y premiar agentes de calidad.',
        en: 'Provide protocols with tools to manage risk and reward high-quality agents.',
      },
      {
        es: 'Fomentar un ecosistema más sano, transparente y profesional.',
        en: 'Foster a healthier, more transparent, and professional ecosystem.',
      },
      {
        es: 'Convertir la reputación en un activo medible para agentes y sus owners.',
        en: 'Turn reputation into a measurable asset for agents and their owners.',
      },
    ] as Bilingual[],
  },
  products: {
    title: {
      es: 'Dos índices, una visión completa de confianza',
      en: 'Two indices, one complete view of trust',
    } satisfies Bilingual,
    synergy: {
      es: 'HUMI + WAMI: la vista más completa de confianza — el agente y quien lo controla.',
      en: 'HUMI + WAMI deliver the most complete view of trust — both the agent and its owner.',
    } satisfies Bilingual,
    humi: {
      name: { es: 'Index HUMI', en: 'Index HUMI' } satisfies Bilingual,
      subtitle: {
        es: 'Human-like Metrics Index · Agente',
        en: 'Human-like Metrics Index · Agent',
      } satisfies Bilingual,
      description: {
        es: 'Índice 0–100 que evalúa calidad, madurez, legitimidad y comportamiento de cualquier agente ERC-8004. Cálculo diario para todos los agentes.',
        en: '0–100 index evaluating quality, maturity, legitimacy, and behavior of any ERC-8004 agent. Calculated daily for all agents.',
      } satisfies Bilingual,
      cta: { es: 'Ver índice HUMI', en: 'View HUMI index' } satisfies Bilingual,
    },
    wami: {
      name: { es: 'Index WAMI', en: 'Index WAMI' } satisfies Bilingual,
      subtitle: {
        es: 'Wallet Advanced Metrics Index · Wallet',
        en: 'Wallet Advanced Metrics Index · Wallet',
      } satisfies Bilingual,
      description: {
        es: 'Complemento perfecto: evalúa la wallet que controla o registra el agente — orígenes de fondos, portfolio, actividad y presencia multi-chain.',
        en: 'The perfect complement: evaluates the wallet that controls or registers the agent — funding origins, portfolio, activity, and multi-chain presence.',
      } satisfies Bilingual,
      cta: { es: 'Ver índice WAMI', en: 'View WAMI index' } satisfies Bilingual,
    },
  },
  tools: {
    title: { es: 'Cómo accedes a la reputación', en: 'How you access reputation' } satisfies Bilingual,
    dashboard: {
      title: { es: 'Web Dashboard', en: 'Web Dashboard' } satisfies Bilingual,
      description: {
        es: 'Explora agentes, consulta scores HUMI y WAMI, aplica filtros avanzados y analiza datos en tiempo real.',
        en: 'Explore agents, view HUMI and WAMI scores, apply advanced filters, and analyze data in real time.',
      } satisfies Bilingual,
      cta: { es: 'Abrir dashboard', en: 'Open dashboard' } satisfies Bilingual,
    },
    api: {
      title: { es: 'Public API', en: 'Public API' } satisfies Bilingual,
      description: {
        es: 'Acceso programático a índices, datos de agentes y métricas de wallets para protocolos, marketplaces y dashboards.',
        en: 'Programmatic access to indices, agent data, and wallet metrics for protocols, marketplaces, and dashboards.',
      } satisfies Bilingual,
      cta: { es: 'Lista de espera', en: 'Join waitlist' } satisfies Bilingual,
    },
  },
  subscriptions: {
    title: { es: 'Suscripciones', en: 'Subscriptions' } satisfies Bilingual,
    disclaimer: {
      es: 'Nota: Los límites de uso y costos de los planes están sujetos a cambios y se definirán antes del lanzamiento oficial.',
      en: 'Note: Usage limits and plan pricing are subject to change and will be finalized before official launch.',
    } satisfies Bilingual,
    labels: {
      callsPerMinute: { es: 'Llamadas por minuto', en: 'Calls per minute' } satisfies Bilingual,
      monthlyCalls: { es: 'Llamadas mensuales', en: 'Monthly calls' } satisfies Bilingual,
    },
    tiers: [
      {
        id: 'free',
        name: 'Free',
        tagline: { es: 'Para exploración inicial', en: 'For initial exploration' } satisfies Bilingual,
        callsPerMinute: 5,
        monthlyCalls: 1000,
        features: [
          { type: 'check' as const, text: { es: 'Dashboard Básico', en: 'Basic Dashboard' } satisfies Bilingual },
          {
            type: 'bullet' as const,
            text: {
              es: 'Búsqueda básica (Agente, Chain, HUMI, WAMI)',
              en: 'Basic search (Agent, Chain, HUMI, WAMI)',
            } satisfies Bilingual,
          },
          {
            type: 'bullet' as const,
            text: {
              es: 'Reporte básico de agente y wallet',
              en: 'Basic agent and wallet report',
            } satisfies Bilingual,
          },
          {
            type: 'check' as const,
            text: { es: 'Índices HUMI y WAMI', en: 'HUMI and WAMI Indices' } satisfies Bilingual,
          },
        ],
        cta: { es: 'Lista de Espera', en: 'Join Waitlist' } satisfies Bilingual,
        ctaHref: '/waitlist',
        ctaStyle: 'outline' as const,
      },
      {
        id: 'bronze',
        name: 'Bronze',
        tagline: { es: 'Para desarrolladores individuales', en: 'For individual developers' } satisfies Bilingual,
        callsPerMinute: 30,
        monthlyCalls: 5000,
        highlight: true,
        features: [
          { type: 'check' as const, text: { es: 'Dashboard Avanzado', en: 'Advanced Dashboard' } satisfies Bilingual },
          {
            type: 'bullet' as const,
            text: {
              es: 'Búsqueda avanzada (Metadata, tipos de agente, wallet)',
              en: 'Advanced search (Metadata, agent types, wallet)',
            } satisfies Bilingual,
          },
          {
            type: 'bullet' as const,
            text: {
              es: 'Reporte avanzado de agente y wallet',
              en: 'Advanced agent and wallet report',
            } satisfies Bilingual,
          },
          { type: 'bullet' as const, text: { es: 'Agentes favoritos', en: 'Favorite agents' } satisfies Bilingual },
          {
            type: 'check' as const,
            text: {
              es: 'Índices HUMI + WAMI + próximas certificaciones',
              en: 'HUMI + WAMI Indices + upcoming certifications',
            } satisfies Bilingual,
          },
        ],
        cta: { es: 'Lista de Espera', en: 'Join Waitlist' } satisfies Bilingual,
        ctaHref: '/waitlist',
        ctaStyle: 'solid' as const,
      },
      {
        id: 'silver',
        name: 'Silver',
        tagline: { es: 'Para equipos y proyectos medianos', en: 'For teams and medium projects' } satisfies Bilingual,
        callsPerMinute: 120,
        monthlyCalls: 10000,
        features: [
          { type: 'check' as const, text: { es: 'Dashboard Avanzado', en: 'Advanced Dashboard' } satisfies Bilingual },
          {
            type: 'bullet' as const,
            text: {
              es: 'Búsqueda avanzada completa (agente y wallet)',
              en: 'Full advanced search (agent and wallet)',
            } satisfies Bilingual,
          },
          {
            type: 'bullet' as const,
            text: {
              es: 'Reporte avanzado + feedback (HUMI y WAMI)',
              en: 'Advanced report + feedback (HUMI and WAMI)',
            } satisfies Bilingual,
          },
          { type: 'bullet' as const, text: { es: 'Agentes favoritos', en: 'Favorite agents' } satisfies Bilingual },
          {
            type: 'check' as const,
            text: {
              es: 'Índices HUMI + WAMI + próximas certificaciones',
              en: 'HUMI + WAMI Indices + upcoming certifications',
            } satisfies Bilingual,
          },
        ],
        cta: { es: 'Lista de Espera', en: 'Join Waitlist' } satisfies Bilingual,
        ctaHref: '/waitlist',
        ctaStyle: 'outline' as const,
      },
      {
        id: 'gold',
        name: 'Gold',
        tagline: { es: 'Para empresas y uso intensivo', en: 'For enterprises and heavy usage' } satisfies Bilingual,
        enterprise: true,
        salesMessage: {
          es: 'Contacta nuestro equipo de ventas para ofrecerte la solución personalizada que mejor se adapte a tus necesidades.',
          en: 'Contact our sales team for a custom solution tailored to your specific needs.',
        } satisfies Bilingual,
        cta: { es: 'Lista de Espera', en: 'Join Waitlist' } satisfies Bilingual,
        ctaHref: '/waitlist',
        ctaStyle: 'outline' as const,
      },
    ],
  },
  howWeWork: {
    title: { es: 'Cómo operamos', en: 'How we operate' } satisfies Bilingual,
    subtitle: {
      es: 'Nuestra plataforma está diseñada para entregar confianza real y verificable',
      en: 'Our platform is designed to deliver real and verifiable trust',
    } satisfies Bilingual,
    steps: [
      {
        title: { es: 'Escaneo en tiempo real', en: 'Real-time scanning' } satisfies Bilingual,
        description: {
          es: 'Monitorizamos diariamente las principales redes blockchain para capturar registro, actividad y ejecución de cada agente ERC-8004.',
          en: 'We monitor major blockchain networks daily to capture registration, activity, and execution of every ERC-8004 agent.',
        } satisfies Bilingual,
      },
      {
        title: { es: 'Análisis profundo', en: 'Deep analysis' } satisfies Bilingual,
        description: {
          es: 'Complementamos datos on-chain con fuentes externas para un perfil completo y actualizado de cada agente.',
          en: 'We complement on-chain data with external sources for a complete, up-to-date profile of each agent.',
        } satisfies Bilingual,
      },
      {
        title: { es: 'Evaluación multidimensional (HUMI)', en: 'Multi-dimensional evaluation (HUMI)' } satisfies Bilingual,
        description: {
          es: 'Evaluamos cada agente con un enfoque múltiple: metadata, uso, historial del owner y validaciones externas.',
          en: 'We evaluate each agent across metadata, usage, owner history, and external validations.',
        } satisfies Bilingual,
      },
      {
        title: { es: 'Reputación de wallet (WAMI)', en: 'Wallet reputation (WAMI)' } satisfies Bilingual,
        description: {
          es: 'Medimos la calidad y el riesgo de la wallet que controla el agente para una señal de confianza completa.',
          en: 'We measure the quality and risk of the wallet that controls the agent for a complete trust signal.',
        } satisfies Bilingual,
      },
    ],
  },
  humi: {
    title: { es: 'Índice HUMI', en: 'HUMI Index' } satisfies Bilingual,
    subtitle: {
      es: 'Score 0–100 de reputación del agente · 4 pilares independientes (25 pts c/u)',
      en: '0–100 agent reputation score · 4 independent pillars (25 pts each)',
    } satisfies Bilingual,
    question: {
      es: '¿Qué tan confiable, maduro y human-like es este agente?',
      en: 'How trustworthy, mature, and human-like is this agent?',
    } satisfies Bilingual,
    pillars: [
      { es: 'Historia (H)', en: 'History (H)' },
      { es: 'Información (I)', en: 'Information (I)' },
      { es: 'Medida (M)', en: 'Measure (M)' },
      { es: 'Uso (U)', en: 'Usage (U)' },
    ] as Bilingual[],
    fullPage: { es: 'Explorar índice completo', en: 'Explore full index' } satisfies Bilingual,
  },
  wami: {
    title: { es: 'Índice WAMI', en: 'WAMI Index' } satisfies Bilingual,
    subtitle: {
      es: 'Score 0–100 de reputación de la wallet · complemento de HUMI',
      en: '0–100 wallet reputation score · complement to HUMI',
    } satisfies Bilingual,
    question: {
      es: '¿Qué tan confiable y madura es la wallet que controla este agente?',
      en: 'How trustworthy and mature is the wallet that controls this agent?',
    } satisfies Bilingual,
    pillars: [
      { es: 'Orígenes y legitimidad', en: 'Origins & legitimacy' },
      { es: 'Calidad de portfolio', en: 'Portfolio quality' },
      { es: 'Actividad y comportamiento', en: 'Activity & behavior' },
      { es: 'Multi-chain y madurez', en: 'Multi-chain & maturity' },
    ] as Bilingual[],
    backToPortal: { es: 'Volver al portal', en: 'Back to portal' } satisfies Bilingual,
  },
  footer: {
    tagline: {
      es: 'Reputación on-chain transparente, fiable y accesible para todos.',
      en: 'Making on-chain reputation transparent, reliable, and accessible to everyone.',
    } satisfies Bilingual,
    contactTitle: { es: 'Contáctanos', en: 'Contact us' } satisfies Bilingual,
    rights: {
      es: 'Todos los derechos reservados.',
      en: 'All rights reserved.',
    } satisfies Bilingual,
    llmsForAi: {
      es: 'Información para sistemas de IA',
      en: 'Information for AI systems',
    } satisfies Bilingual,
    links: {
      x: { label: '@ibzjairvalenz', href: 'https://x.com/ibzjairvalenz' },
      email: { label: 'hello@globalscoreagent.com', href: 'mailto:hello@globalscoreagent.com' },
      farcaster: { label: 'Farcaster', href: 'https://farcaster.xyz/globalscoreagent' },
      telegram: { label: '@Global_Score_Agent', href: 'https://t.me/Global_Score_Agent' },
    },
  },
} as const;
