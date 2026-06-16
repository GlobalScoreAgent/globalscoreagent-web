export type WalletCategoryLang = 'es' | 'en';

type BilingualText = { es: string; en: string };

const EXPLANATIONS: Record<string, BilingualText> = {
  explosive: {
    en: 'The wallet is experiencing extremely rapid, explosive growth in activity. Growth exceeded 200% in the last 7 days with at least 30 new transactions. Strong adoption signal, but warrants review for coordinated activity or bots.',
    es: 'La wallet experimenta un crecimiento extremadamente rápido y explosivo. Más del 200% de crecimiento en los últimos 7 días y al menos 30 transacciones nuevas. Señal de adopción fuerte, pero conviene revisar actividad coordinada o bots.',
  },
  hyper_growth: {
    en: 'Very accelerated and sustained short-term growth: over 80% in the last 7 days with at least 15 new transactions. Strong evidence of rapid traction.',
    es: 'Crecimiento muy acelerado y sostenido a corto plazo: más del 80% en los últimos 7 días y al menos 15 transacciones nuevas. Evidencia fuerte de tracción rápida.',
  },
  sustained_growth: {
    en: 'Solid, consistent week-over-week growth: over 40% in the last 7 days with at least 8 new transactions. Healthy, predictable evolution.',
    es: 'Crecimiento sólido y consistente semana a semana: más del 40% en los últimos 7 días y al menos 8 transacciones nuevas. Evolución sana y predecible.',
  },
  steady_active: {
    en: 'Steady, predictable activity without dramatic spikes: over 20% growth in the last 7 days with at least 5 new transactions. Mature, actively used wallet profile.',
    es: 'Actividad estable y predecible sin picos dramáticos: más del 20% de crecimiento en los últimos 7 días y al menos 5 transacciones nuevas. Perfil de wallet madura y en uso activo.',
  },
  dormant_highnonce: {
    en: 'Very high historical activity but currently inactive (no growth in the last 7 days, 500+ total transactions). Veteran wallet that may be hibernating or paused.',
    es: 'Actividad histórica muy alta pero actualmente inactiva (sin crecimiento en 7 días, 500+ transacciones totales). Wallet veterana en hibernación o pausa.',
  },
  new_highnonce: {
    en: 'New wallet without long history but with high initial activity (300+ total transactions). Can signal intensive early use or require extra scrutiny.',
    es: 'Wallet nueva sin historial largo pero con alta actividad inicial (300+ transacciones totales). Puede indicar uso intensivo temprano o requerir mayor escrutinio.',
  },
  new_mediumnonce: {
    en: 'New wallet with moderate initial activity (100–299 total transactions).',
    es: 'Wallet nueva con actividad inicial moderada (100–299 transacciones totales).',
  },
  new_lownonce: {
    en: 'New wallet with low initial activity (under 100 total transactions).',
    es: 'Wallet nueva con actividad inicial baja (menos de 100 transacciones totales).',
  },
  old_inactive_highnonce: {
    en: 'Older wallet with high historical activity (500+ transactions) that is now inactive. May be abandoned, paused, or used for a one-time purpose.',
    es: 'Wallet antigua con alta actividad histórica (500+ transacciones) que ahora está inactiva. Puede estar abandonada, en pausa o de uso puntual.',
  },
  old_inactive_mediumnonce: {
    en: 'Older wallet with moderate historical activity (100–499 transactions) that is now inactive.',
    es: 'Wallet antigua con actividad histórica moderada (100–499 transacciones) que ahora está inactiva.',
  },
  old_inactive_lownonce: {
    en: 'Older wallet with low historical activity (under 100 transactions) that is now inactive.',
    es: 'Wallet antigua con actividad histórica baja (menos de 100 transacciones) que ahora está inactiva.',
  },
};

export function normalizeWalletCategoryKey(rawKey: string): string {
  return rawKey
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export function getWalletCategoryExplanation(
  rawKey: string,
  lang: WalletCategoryLang,
): string | null {
  const canonical = normalizeWalletCategoryKey(rawKey);
  const entry = EXPLANATIONS[canonical];
  if (!entry) return null;
  return lang === 'es' ? entry.es : entry.en;
}
