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
      notes: [
        {
          es: 'El plan Prueba Gratuita tiene una duración de 5 días.',
          en: 'The Free Trial plan lasts for 5 days.',
        } satisfies Bilingual,
        {
          es: 'Los planes anuales ofrecen un descuento respecto a la facturación mensual.',
          en: 'Annual plans offer a discount compared to monthly billing.',
        } satisfies Bilingual,
        {
          es: 'Los créditos API incluidos en los planes Pro se renuevan mensualmente.',
          en: 'API credits included in Pro plans renew monthly.',
        } satisfies Bilingual,
      ],
    },
    apiAccess: {
      title: { es: 'Precios de la API (Créditos)', en: 'API Pricing (Credits)' } satisfies Bilingual,
      comingSoonNotice: {
        es: 'Próximamente — disponible cuando la API sea desplegada.',
        en: 'Coming soon — available when the API is deployed.',
      } satisfies Bilingual,
    },
    creditPackages: {
      title: { es: 'Paquetes de créditos', en: 'Credit packages' } satisfies Bilingual,
      intro: {
        es: 'Puedes comprar créditos por adelantado. Cuanto mayor sea el paquete, menor será el precio por crédito.',
        en: 'You can purchase credits in advance. The larger the package, the lower the price per credit.',
      } satisfies Bilingual,
      columns: {
        package: { es: 'Paquete', en: 'Package' } satisfies Bilingual,
        price: { es: 'Precio', en: 'Price' } satisfies Bilingual,
        credits: { es: 'Créditos incluidos', en: 'Credits included' } satisfies Bilingual,
      },
      rows: [
        { package: 'Starter', price: '$10', credits: '120' },
        { package: 'Growth', price: '$25', credits: '320' },
        { package: 'Pro', price: '$50', credits: '700' },
        { package: 'Enterprise', price: '$100', credits: '1,500' },
      ],
    },
    reportTypeByPlan: {
      title: {
        es: 'Precio por tipo de reporte según plan',
        en: 'Price per report type by plan',
      } satisfies Bilingual,
      columns: {
        reportType: { es: 'Tipo de informe', en: 'Report type' } satisfies Bilingual,
        direct: { es: 'Precio directo (pago por uso)', en: 'Direct price (pay per use)' } satisfies Bilingual,
        starter: { es: 'Starter ($0.0833/crédito)', en: 'Starter ($0.0833/credit)' } satisfies Bilingual,
        growth: { es: 'Growth ($0.0781/crédito)', en: 'Growth ($0.0781/credit)' } satisfies Bilingual,
        pro: { es: 'Pro ($0.0714/crédito)', en: 'Pro ($0.0714/credit)' } satisfies Bilingual,
        enterprise: { es: 'Enterprise ($0.0667/crédito)', en: 'Enterprise ($0.0667/credit)' } satisfies Bilingual,
      },
      rows: [
        {
          reportType: {
            es: 'Básico (HUMI + WAMI + Advertencias)',
            en: 'Basic (HUMI + WAMI + Warnings)',
          } satisfies Bilingual,
          direct: '$0.20',
          starter: { es: '$0.17 (2 créditos)', en: '$0.17 (2 credits)' } satisfies Bilingual,
          growth: { es: '$0.16 (2 créditos)', en: '$0.16 (2 credits)' } satisfies Bilingual,
          pro: { es: '$0.14 (2 créditos)', en: '$0.14 (2 credits)' } satisfies Bilingual,
          enterprise: { es: '$0.13 (2 créditos)', en: '$0.13 (2 credits)' } satisfies Bilingual,
        },
        {
          reportType: {
            es: 'Con Análisis (HUMI o WAMI completo)',
            en: 'With Analysis (Full HUMI or WAMI)',
          } satisfies Bilingual,
          direct: '$0.45',
          starter: { es: '$0.42 (5 créditos)', en: '$0.42 (5 credits)' } satisfies Bilingual,
          growth: { es: '$0.39 (5 créditos)', en: '$0.39 (5 credits)' } satisfies Bilingual,
          pro: { es: '$0.36 (5 créditos)', en: '$0.36 (5 credits)' } satisfies Bilingual,
          enterprise: { es: '$0.33 (5 créditos)', en: '$0.33 (5 credits)' } satisfies Bilingual,
        },
        {
          reportType: {
            es: 'GSA Index Completo',
            en: 'GSA Index Complete',
          } satisfies Bilingual,
          direct: '$0.85',
          starter: { es: '$0.83 (10 créditos)', en: '$0.83 (10 credits)' } satisfies Bilingual,
          growth: { es: '$0.78 (10 créditos)', en: '$0.78 (10 credits)' } satisfies Bilingual,
          pro: { es: '$0.71 (10 créditos)', en: '$0.71 (10 credits)' } satisfies Bilingual,
          enterprise: { es: '$0.67 (10 créditos)', en: '$0.67 (10 credits)' } satisfies Bilingual,
        },
      ],
      notes: [
        {
          es: 'Los precios de los planes Starter, Growth, Pro y Enterprise aplican cuando compras créditos por adelantado.',
          en: 'The prices under Starter, Growth, Pro, and Enterprise apply when you purchase credits in advance.',
        } satisfies Bilingual,
        {
          es: 'Cuanto mayor sea el paquete de créditos que adquieres, menor será el costo por consulta.',
          en: 'The higher the credit package you buy, the lower the cost per query.',
        } satisfies Bilingual,
        {
          es: 'El plan Enterprise ofrece el mejor precio por crédito para usuarios de alto volumen o agentes de IA.',
          en: 'The Enterprise plan offers the best price per credit for high-volume users or AI agents.',
        } satisfies Bilingual,
        {
          es: 'Los créditos incluidos en la Prueba Gratuita se consumen según el tipo de reporte: 2 créditos para Básico, 5 para Con Análisis y 10 para GSA Index Completo.',
          en: 'Credits included in the Free Trial are consumed based on report type: 2 credits for Basic, 5 for With Analysis, and 10 for GSA Index Complete.',
        } satisfies Bilingual,
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
          es: 'Claro y transparente: tras la prueba de 5 días, las consultas del Dashboard quedan bloqueadas, pero conservas acceso para suscribirte o usar la API.',
          en: 'Clear & transparent: after the 5-day trial, Dashboard queries are locked, but you retain access to subscribe or use the API.',
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
    es: 'Precios actualizados junio 2026. Global Score Agent se reserva el derecho de modificar los precios con aviso previo.',
    en: 'Prices updated June 2026. Global Score Agent reserves the right to modify pricing with prior notice.',
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
