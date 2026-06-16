import type { Bilingual } from '@/content/marketing/i18n';

export const pricingCopy = {
  comingSoonBadge: { es: 'Próximamente', en: 'Coming soon' } satisfies Bilingual,
  seo: {
    title: {
      es: 'Precios — Global Score Agent',
      en: 'Pricing — Global Score Agent',
    } satisfies Bilingual,
    description: {
      es: 'Planes de Dashboard, API pay-per-use y paquetes de créditos. Prueba gratuita de 5 días y precios transparentes para agentes y humanos.',
      en: 'Dashboard plans, pay-per-use API, and credit packages. 5-day free trial and transparent pricing for agents and humans.',
    } satisfies Bilingual,
  },
  hero: {
    title: {
      es: 'Precios flexibles y transparentes',
      en: 'Flexible and transparent pricing',
    } satisfies Bilingual,
    subtitle: {
      es: 'Inteligencia confiable para agentes y humanos: análisis visual en el Dashboard y acceso programático de alto volumen vía API.',
      en: 'Trustworthy intelligence for agents and humans: rich visual analysis on the Dashboard and high-volume programmatic access via API.',
    } satisfies Bilingual,
  },
  dashboardBanner: {
    message: {
      es: 'Todos los detalles completos y calculadora de uso están disponibles dentro del Dashboard después de registrarte gratis.',
      en: 'Full details and the usage calculator are available in the Dashboard after you register for free.',
    } satisfies Bilingual,
    cta: {
      es: 'Registrarse gratis',
      en: 'Register for free',
    } satisfies Bilingual,
  },
  sections: {
    dashboardPlans: {
      title: { es: 'Planes Dashboard', en: 'Dashboard Plans' } satisfies Bilingual,
      columns: {
        plan: { es: 'Plan', en: 'Plan' } satisfies Bilingual,
        monthly: { es: 'Precio mensual', en: 'Monthly price' } satisfies Bilingual,
        annual: { es: 'Precio anual', en: 'Annual price' } satisfies Bilingual,
        savings: { es: 'Ahorro', en: 'Savings' } satisfies Bilingual,
        includes: { es: 'Qué incluye', en: "What's included" } satisfies Bilingual,
      },
      rows: [
        {
          plan: { es: 'Prueba gratuita', en: 'Free Trial' } satisfies Bilingual,
          monthly: '$0',
          annual: '$0',
          savings: '—',
          includes: {
            es: '5 días de acceso completo al Dashboard + 20 créditos API (válidos solo durante esos 5 días)',
            en: '5-day full Dashboard access + 20 API credits (valid only during the 5 days)',
          } satisfies Bilingual,
        },
        {
          plan: { es: 'Dashboard Solo', en: 'Dashboard Solo' } satisfies Bilingual,
          monthly: '$9',
          annual: '$99',
          savings: '8%',
          includes: {
            es: 'Acceso ilimitado al Dashboard completo',
            en: 'Unlimited access to the full Dashboard',
          } satisfies Bilingual,
        },
        {
          plan: { es: 'Dashboard + Créditos', en: 'Dashboard + Credits' } satisfies Bilingual,
          monthly: '$15',
          annual: '$159',
          savings: '12%',
          includes: {
            es: 'Dashboard ilimitado + 130 créditos API al mes',
            en: 'Unlimited Dashboard + 130 API credits per month',
          } satisfies Bilingual,
          highlight: true,
          comingSoon: true,
        },
      ],
    },
    apiAccess: {
      title: { es: 'Opciones de acceso API', en: 'API access options' } satisfies Bilingual,
      comingSoonNotice: {
        es: 'Próximamente — disponible cuando la API sea desplegada.',
        en: 'Coming soon — available when the API is deployed.',
      } satisfies Bilingual,
    },
    payPerUse: {
      title: { es: 'Pay per use', en: 'Pay per use' } satisfies Bilingual,
      intro: {
        es: 'Ideal para uso ocasional o exploratorio.',
        en: 'Best for occasional or exploratory usage.',
      } satisfies Bilingual,
      columns: {
        reportType: { es: 'Tipo de informe', en: 'Report type' } satisfies Bilingual,
        price: { es: 'Precio por agente', en: 'Price per agent' } satisfies Bilingual,
      },
      rows: [
        {
          reportType: {
            es: 'Basic (puntuación HUMI / WAMI / advertencias)',
            en: 'Basic (HUMI score / WAMI score / warnings)',
          } satisfies Bilingual,
          price: '$0.20',
        },
        {
          reportType: {
            es: 'With Analysis (HUMI o WAMI completo con pilares y razones)',
            en: 'With Analysis (full HUMI or WAMI with pillars & reasons)',
          } satisfies Bilingual,
          price: '$0.45',
        },
        {
          reportType: {
            es: 'GSA Index Complete (HUMI + WAMI + Richness + advertencias)',
            en: 'GSA Index Complete (HUMI + WAMI + Richness + warnings)',
          } satisfies Bilingual,
          price: '$0.85',
        },
      ],
    },
    creditPackages: {
      title: { es: 'Paquetes de créditos (recomendado)', en: 'Credit packages (recommended)' } satisfies Bilingual,
      intro: {
        es: 'Compra créditos por adelantado y úsalos cuando quieras. Ideal para agentes IA y uso recurrente.',
        en: 'Buy credits in advance and use them anytime. Ideal for AI agents and recurring usage.',
      } satisfies Bilingual,
      columns: {
        package: { es: 'Paquete', en: 'Package' } satisfies Bilingual,
        price: { es: 'Precio', en: 'Price' } satisfies Bilingual,
        credits: { es: 'Créditos incluidos', en: 'Credits included' } satisfies Bilingual,
        effective: { es: 'Precio efectivo por crédito', en: 'Effective price per credit' } satisfies Bilingual,
      },
      rows: [
        { package: 'Starter', price: '$10', credits: '120', effective: '$0.083' },
        { package: 'Growth', price: '$25', credits: '320', effective: '$0.078' },
        { package: 'Pro', price: '$50', credits: '700', effective: '$0.071' },
        { package: 'Enterprise', price: '$100', credits: '1,500', effective: '$0.067' },
      ],
    },
    whyModel: {
      title: { es: 'Por qué este modelo', en: 'Why this model' } satisfies Bilingual,
      items: [
        {
          es: 'Dashboard: pensado para investigadores, traders y usuarios humanos que quieren insights visuales profundos.',
          en: 'Dashboard: built for researchers, traders, and human users who want rich visual insights.',
        } satisfies Bilingual,
        {
          es: 'API + créditos: optimizado para agentes autónomos y desarrolladores que necesitan acceso programático.',
          en: 'API + credits: optimized for autonomous AI agents and developers needing programmatic access.',
        } satisfies Bilingual,
        {
          es: 'Claro y transparente: tras la prueba de 5 días, todo queda bloqueado hasta suscribirte — sin sorpresas.',
          en: 'Clear & transparent: after the 5-day trial, everything is blocked until you subscribe — no surprises.',
        } satisfies Bilingual,
      ],
    },
  },
  moreDetails: { es: 'Más detalles', en: 'More details' } satisfies Bilingual,
  cta: {
    title: { es: '¿Listo para empezar?', en: 'Ready to get started?' } satisfies Bilingual,
    trial: { es: 'Iniciar prueba gratuita de 5 días', en: 'Start 5-day free trial' } satisfies Bilingual,
    contact: { es: 'Contactar ventas', en: 'Contact sales' } satisfies Bilingual,
    contactHref: 'mailto:sales@globalscoreagent.com',
  },
  footerNote: {
    es: 'Precios actualizados mayo 2026. Global Score Agent se reserva el derecho de modificar los precios con aviso previo.',
    en: 'Prices updated May 2026. Global Score Agent reserves the right to modify pricing with prior notice.',
  } satisfies Bilingual,
  homeTeaser: {
    title: { es: 'Suscripciones y API', en: 'Subscriptions and API' } satisfies Bilingual,
    body: {
      es: 'Planes Dashboard desde $9/mes, API pay-per-use y paquetes de créditos. Consulta el detalle completo de precios.',
      en: 'Dashboard plans from $9/month, pay-per-use API, and credit packages. See full pricing details.',
    } satisfies Bilingual,
    cta: { es: 'Ver precios', en: 'View pricing' } satisfies Bilingual,
    ctaHref: '/pricing',
  },
} as const;
