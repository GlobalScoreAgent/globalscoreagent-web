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
      trialNote: {
        es: 'Importante: tras la prueba de 5 días, todo el acceso (Dashboard y API) queda bloqueado hasta que contrates un plan de pago.',
        en: 'Important: after the 5-day trial, all access (Dashboard and API) is blocked until you upgrade to a paid plan.',
      } satisfies Bilingual,
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
  faq: {
    title: { es: 'Preguntas frecuentes', en: 'Frequently asked questions' } satisfies Bilingual,
    items: [
      {
        question: {
          es: '¿Qué ocurre después de la prueba gratuita de 5 días?',
          en: 'What happens after the 5-day free trial?',
        } satisfies Bilingual,
        answer: {
          es: 'Todo el acceso al Dashboard y a la API queda completamente bloqueado hasta que contrates un plan de pago.',
          en: 'All access to both the Dashboard and the API is completely blocked until you upgrade to a paid plan.',
        } satisfies Bilingual,
      },
      {
        question: {
          es: '¿Puedo cancelar mi suscripción en cualquier momento?',
          en: 'Can I cancel my subscription at any time?',
        } satisfies Bilingual,
        answer: {
          es: 'Sí. Puedes cancelar o pausar tu suscripción cuando quieras, sin penalizaciones.',
          en: 'Yes. You can cancel or pause your subscription whenever you want with no penalties.',
        } satisfies Bilingual,
      },
      {
        question: {
          es: '¿Los créditos se acumulan al mes siguiente?',
          en: 'Do credits roll over to the next month?',
        } satisfies Bilingual,
        answer: {
          es: 'No. Los créditos mensuales se renuevan al inicio de cada ciclo de facturación. Los no usados caducan al final del mes.',
          en: 'No. Monthly credits are refreshed at the beginning of each billing cycle. Unused credits expire at the end of the month.',
        } satisfies Bilingual,
      },
      {
        question: {
          es: '¿Puedo usar la API sin contratar el plan Dashboard?',
          en: 'Can I use the API without buying the Dashboard plan?',
        } satisfies Bilingual,
        answer: {
          es: 'Sí. Puedes comprar paquetes de créditos de forma independiente.',
          en: 'Yes. You can purchase credit packages independently.',
        } satisfies Bilingual,
      },
      {
        question: {
          es: '¿Hay política de reembolso?',
          en: 'Is there a refund policy?',
        } satisfies Bilingual,
        answer: {
          es: 'Ofrecemos garantía de devolución de 14 días en todos los planes de pago (excluyendo créditos ya consumidos).',
          en: 'We offer a 14-day money-back guarantee on all paid plans (excluding credit usage already consumed).',
        } satisfies Bilingual,
      },
      {
        question: {
          es: '¿Ofrecen descuentos por volumen?',
          en: 'Do you offer volume discounts for high usage?',
        } satisfies Bilingual,
        answer: {
          es: 'Sí. El paquete Enterprise ya ofrece la mejor tarifa. Para más de 2.000 créditos/mes, contáctanos para precios especiales.',
          en: 'Yes. The Enterprise credit package already offers the best rate. For usage above 2,000 credits/month, contact us for special pricing.',
        } satisfies Bilingual,
      },
      {
        question: {
          es: '¿Tenéis planes para equipos o empresas?',
          en: 'Do you have team / enterprise plans?',
        } satisfies Bilingual,
        answer: {
          es: 'Sí. Contáctanos para asientos multiusuario, soporte dedicado, SLA o necesidades a medida.',
          en: 'Yes. Contact us for multi-user seats, dedicated support, SLA, or custom needs.',
        } satisfies Bilingual,
      },
    ],
  },
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
