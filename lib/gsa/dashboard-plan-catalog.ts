export type RegistrationSource =
  | 'registration_free'
  | 'registration_dashboard_only'
  | 'registration_dashboard_plus_credits';

/** Used by public marketing/pricing (`DashboardPlansPricingGrid`). Dashboard subscriptions use `gsa.subscription_dashboard_type` instead. */
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
