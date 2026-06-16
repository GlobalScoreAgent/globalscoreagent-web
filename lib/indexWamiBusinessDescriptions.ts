import type { WamiPillarId } from '@/lib/indexWamiPillars';
import type { PillarSummaryBlockId } from '@/lib/indexHumiPillarSummary';

type Lang = 'es' | 'en';

type Bilingual = { es: string; en: string };

function itemKey(pillarId: WamiPillarId, blockId: PillarSummaryBlockId, itemName: string): string {
  return `${pillarId}|${blockId}|${itemName.trim().toLowerCase()}`;
}

const ITEM_DESCRIPTIONS: Record<string, Bilingual> = {
  // Origins — basic
  [itemKey('origins', 'basic', 'First Funds Quality')]: {
    es: 'Calidad y legitimidad de los primeros fondos recibidos por la wallet.',
    en: 'Quality and legitimacy of the wallet’s first received funds.',
  },
  [itemKey('origins', 'basic', 'Mixing Risk')]: {
    es: 'Riesgo de mezcla de fondos o fuentes sospechosas en el origen.',
    en: 'Risk of fund mixing or suspicious sources at origin.',
  },
  // Origins — intermediate
  [itemKey('origins', 'intermediate', 'Low CEX Reliance')]: {
    es: 'Baja dependencia de entradas desde exchanges centralizados (CEX).',
    en: 'Low reliance on inflows from centralized exchanges (CEX).',
  },
  [itemKey('origins', 'intermediate', 'Funding Diversity')]: {
    es: 'Diversidad saludable de fuentes y remitentes de financiamiento.',
    en: 'Healthy diversity of funding sources and senders.',
  },
  // Origins — advanced
  [itemKey('origins', 'advanced', 'Low Inflow Concentration')]: {
    es: 'Baja concentración de entradas desde pocas fuentes.',
    en: 'Low concentration of inflows from few sources.',
  },
  [itemKey('origins', 'advanced', 'Minimal Mixing Risk')]: {
    es: 'Riesgo mínimo de mezcla o patrones opacos en el historial de fondos.',
    en: 'Minimal mixing risk or opaque patterns in fund history.',
  },
  // Portfolio — basic
  [itemKey('portfolio', 'basic', 'Total Value Health')]: {
    es: 'Valor total del portafolio y salud general de los activos.',
    en: 'Total portfolio value and overall asset health.',
  },
  [itemKey('portfolio', 'basic', 'Liquid Assets Ratio')]: {
    es: 'Proporción de activos líquidos y fácilmente negociables.',
    en: 'Proportion of liquid, easily tradable assets.',
  },
  // Portfolio — intermediate
  [itemKey('portfolio', 'intermediate', 'Token Diversification')]: {
    es: 'Diversificación entre tipos y categorías de tokens.',
    en: 'Diversification across token types and categories.',
  },
  [itemKey('portfolio', 'intermediate', 'Stable & Verified Assets')]: {
    es: 'Exposición equilibrada a activos estables y verificados.',
    en: 'Balanced exposure to stable and verified assets.',
  },
  // Portfolio — advanced
  [itemKey('portfolio', 'advanced', 'Low Risk Holdings')]: {
    es: 'Tenencia de activos con bajo riesgo y mínima exposición a tokens de baja calidad.',
    en: 'Holdings with low risk and minimal low-quality token exposure.',
  },
  [itemKey('portfolio', 'advanced', 'Sophisticated Composition')]: {
    es: 'Composición sofisticada del portafolio con activos de calidad.',
    en: 'Sophisticated portfolio composition with quality assets.',
  },
  // Activity — basic
  [itemKey('activity', 'basic', 'Inflow / Outflow Balance')]: {
    es: 'Equilibrio natural entre entradas y salidas de fondos.',
    en: 'Natural balance between fund inflows and outflows.',
  },
  [itemKey('activity', 'basic', 'Unique Counterparties')]: {
    es: 'Número de contrapartes únicas y genuinas en transacciones recientes.',
    en: 'Number of unique, genuine counterparties in recent transactions.',
  },
  // Activity — intermediate
  [itemKey('activity', 'intermediate', 'Low Wash Trading')]: {
    es: 'Bajas señales de wash-trading o ciclos artificiales de transacciones.',
    en: 'Low signs of wash-trading or artificial transaction cycles.',
  },
  [itemKey('activity', 'intermediate', 'Low Suspicious Patterns')]: {
    es: 'Patrones limitados de actividad sospechosa (wallets compartidas, timing concentrado).',
    en: 'Limited suspicious activity patterns (shared wallets, concentrated timing).',
  },
  // Activity — advanced
  [itemKey('activity', 'advanced', 'Low CEX Interaction')]: {
    es: 'Interacción limitada con exchanges centralizados en actividad reciente.',
    en: 'Limited centralized exchange interaction in recent activity.',
  },
  [itemKey('activity', 'advanced', 'Healthy Interaction Ratio')]: {
    es: 'Ratio saludable de interacciones on-chain con contrapartes diversas.',
    en: 'Healthy on-chain interaction ratio with diverse counterparties.',
  },
  // Multichain — basic
  [itemKey('multichain', 'basic', 'Activity Span Age')]: {
    es: 'Antigüedad e historial consistente de actividad de la wallet.',
    en: 'Wallet activity age and consistent historical span.',
  },
  [itemKey('multichain', 'basic', 'Multi Chain Presence')]: {
    es: 'Presencia activa en múltiples redes blockchain.',
    en: 'Active presence across multiple blockchain networks.',
  },
  // Multichain — intermediate
  [itemKey('multichain', 'intermediate', 'Cross Chain Balance')]: {
    es: 'Balance y coherencia de actividad entre cadenas.',
    en: 'Balance and coherence of activity across chains.',
  },
  [itemKey('multichain', 'intermediate', 'Sustained Engagement')]: {
    es: 'Engagement sostenido y madurez demostrada en el tiempo.',
    en: 'Sustained engagement and demonstrated maturity over time.',
  },
  // Multichain — advanced
  [itemKey('multichain', 'advanced', 'High Active Chains')]: {
    es: 'Alto número de cadenas con actividad significativa.',
    en: 'High number of chains with significant activity.',
  },
  [itemKey('multichain', 'advanced', 'Cross Chain Consistency')]: {
    es: 'Consistencia de patrones de actividad entre blockchains.',
    en: 'Consistency of activity patterns across blockchains.',
  },
};

const BLOCK_FALLBACK: Record<string, Bilingual> = {
  [itemKey('origins', 'basic', '*')]: {
    es: 'Criterios básicos de origen y legitimidad de fondos.',
    en: 'Basic fund origin and legitimacy criteria.',
  },
  [itemKey('origins', 'intermediate', '*')]: {
    es: 'Criterios intermedios de diversidad y riesgo de financiamiento.',
    en: 'Intermediate funding diversity and risk criteria.',
  },
  [itemKey('origins', 'advanced', '*')]: {
    es: 'Criterios avanzados de concentración y riesgo de mezcla.',
    en: 'Advanced concentration and mixing risk criteria.',
  },
  [itemKey('portfolio', 'basic', '*')]: {
    es: 'Salud básica del valor y liquidez del portafolio.',
    en: 'Basic portfolio value health and liquidity.',
  },
  [itemKey('portfolio', 'intermediate', '*')]: {
    es: 'Diversificación intermedia y activos verificados.',
    en: 'Intermediate diversification and verified assets.',
  },
  [itemKey('portfolio', 'advanced', '*')]: {
    es: 'Composición avanzada y tenencia de bajo riesgo.',
    en: 'Advanced composition and low-risk holdings.',
  },
  [itemKey('activity', 'basic', '*')]: {
    es: 'Actividad básica: balance de flujos y contrapartes.',
    en: 'Basic activity: flow balance and counterparties.',
  },
  [itemKey('activity', 'intermediate', '*')]: {
    es: 'Actividad intermedia: wash-trading y patrones sospechosos.',
    en: 'Intermediate activity: wash-trading and suspicious patterns.',
  },
  [itemKey('activity', 'advanced', '*')]: {
    es: 'Actividad avanzada: interacción CEX y ratio saludable.',
    en: 'Advanced activity: CEX interaction and healthy ratio.',
  },
  [itemKey('multichain', 'basic', '*')]: {
    es: 'Madurez básica: antigüedad y presencia multi-cadena.',
    en: 'Basic maturity: age and multi-chain presence.',
  },
  [itemKey('multichain', 'intermediate', '*')]: {
    es: 'Madurez intermedia: balance cross-chain y engagement.',
    en: 'Intermediate maturity: cross-chain balance and engagement.',
  },
  [itemKey('multichain', 'advanced', '*')]: {
    es: 'Madurez avanzada: cadenas activas y consistencia.',
    en: 'Advanced maturity: active chains and consistency.',
  },
};

function pickText(entry: Bilingual | undefined, lang: Lang): string | null {
  if (!entry) return null;
  return lang === 'es' ? entry.es : entry.en;
}

export function getWamiBusinessDescription(
  pillarId: WamiPillarId,
  blockId: PillarSummaryBlockId,
  itemName: string,
  lang: Lang,
  genericFallback: string,
): string {
  const exact = ITEM_DESCRIPTIONS[itemKey(pillarId, blockId, itemName)];
  const exactText = pickText(exact, lang);
  if (exactText) return exactText;

  const blockFallback = BLOCK_FALLBACK[itemKey(pillarId, blockId, '*')];
  const blockText = pickText(blockFallback, lang);
  if (blockText) return blockText;

  return genericFallback;
}
