export type RegistrationSource =
  | 'registration_free'
  | 'registration_dashboard_only'
  | 'registration_dashboard_plus_credits';

export type BilingualText = { es: string; en: string };

export type DashboardPlanDefinition = {
  source: RegistrationSource;
  name: BilingualText;
  monthlyPrice: string;
  annualPrice: string;
  savings: string;
  includes: BilingualText;
  comingSoon?: boolean;
};

export type SubscriptionFaqItem = {
  question: BilingualText;
  answer: BilingualText;
};

const REGISTRATION_SOURCES: RegistrationSource[] = [
  'registration_free',
  'registration_dashboard_only',
  'registration_dashboard_plus_credits',
];

export const DASHBOARD_PLANS: DashboardPlanDefinition[] = [
  {
    source: 'registration_free',
    name: { es: 'Prueba gratuita', en: 'Free Trial' },
    monthlyPrice: '$0',
    annualPrice: '$0',
    savings: '—',
    includes: {
      es: '5 días de acceso completo al Dashboard + 20 créditos API (válidos solo durante esos 5 días)',
      en: '5-day full Dashboard access + 20 API credits (valid only during the 5 days)',
    },
  },
  {
    source: 'registration_dashboard_only',
    name: { es: 'Dashboard Solo', en: 'Dashboard Solo' },
    monthlyPrice: '$9',
    annualPrice: '$99',
    savings: '8%',
    includes: {
      es: 'Acceso ilimitado al Dashboard completo',
      en: 'Unlimited access to the full Dashboard',
    },
  },
  {
    source: 'registration_dashboard_plus_credits',
    name: { es: 'Dashboard + Créditos', en: 'Dashboard + Credits' },
    monthlyPrice: '$15',
    annualPrice: '$159',
    savings: '12%',
    includes: {
      es: 'Dashboard ilimitado + 130 créditos API al mes',
      en: 'Unlimited Dashboard + 130 API credits per month',
    },
    comingSoon: true,
  },
];

export const SUBSCRIPTION_FAQ_ITEMS: SubscriptionFaqItem[] = [
  {
    question: {
      es: '¿Qué ocurre después de la prueba gratuita de 5 días?',
      en: 'What happens after the 5-day free trial?',
    },
    answer: {
      es: 'Todo el acceso al Dashboard y a la API queda completamente bloqueado hasta que contrates un plan de pago.',
      en: 'All access to both the Dashboard and the API is completely blocked until you upgrade to a paid plan.',
    },
  },
  {
    question: {
      es: '¿Puedo cancelar mi suscripción en cualquier momento?',
      en: 'Can I cancel my subscription at any time?',
    },
    answer: {
      es: 'Sí. Puedes cancelar o pausar tu suscripción cuando quieras, sin penalizaciones.',
      en: 'Yes. You can cancel or pause your subscription whenever you want with no penalties.',
    },
  },
  {
    question: {
      es: '¿Los créditos se acumulan al mes siguiente?',
      en: 'Do credits roll over to the next month?',
    },
    answer: {
      es: 'No. Los créditos mensuales se renuevan al inicio de cada ciclo de facturación. Los no usados caducan al final del mes.',
      en: 'No. Monthly credits are refreshed at the beginning of each billing cycle. Unused credits expire at the end of the month.',
    },
  },
  {
    question: {
      es: '¿Hay política de reembolso?',
      en: 'Is there a refund policy?',
    },
    answer: {
      es: 'Ofrecemos garantía de devolución de 14 días en todos los planes de pago (excluyendo créditos ya consumidos).',
      en: 'We offer a 14-day money-back guarantee on all paid plans (excluding credit usage already consumed).',
    },
  },
  {
    question: {
      es: '¿Tenéis planes para equipos o empresas?',
      en: 'Do you have team / enterprise plans?',
    },
    answer: {
      es: 'Sí. Contáctanos para asientos multiusuario, soporte dedicado, SLA o necesidades a medida.',
      en: 'Yes. Contact us for multi-user seats, dedicated support, SLA, or custom needs.',
    },
  },
];

export function parseRegistrationSource(metadataPayment: unknown): RegistrationSource | null {
  if (!metadataPayment || typeof metadataPayment !== 'object') return null;
  const source = (metadataPayment as { source?: unknown }).source;
  if (typeof source !== 'string') return null;
  return REGISTRATION_SOURCES.includes(source as RegistrationSource)
    ? (source as RegistrationSource)
    : null;
}

export function pickBilingual(text: BilingualText, lang: 'es' | 'en'): string {
  return lang === 'en' ? text.en : text.es;
}
