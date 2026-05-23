import type { Lang } from './i18n';

export type PortalStat = {
  id: string;
  value: number | null;
  label: Record<Lang, string>;
};

export const portalStats: PortalStat[] = [
  {
    id: 'chains',
    value: 6,
    label: { es: 'Cadenas monitoreadas', en: 'Chains monitored' },
  },
  {
    id: 'agents',
    value: 150000,
    label: { es: 'Agentes evaluados', en: 'Agents evaluated' },
  },
  {
    id: 'wallets',
    value: 170000,
    label: { es: 'Wallets evaluadas', en: 'Wallets evaluated' },
  },
  {
    id: 'active',
    value: null,
    label: { es: 'Agentes activos', en: 'Active agents' },
  },
];
