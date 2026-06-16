import type { HumiPillarId } from '@/lib/indexHumiPillars';
import type { PillarSummaryBlockId } from '@/lib/indexHumiPillarSummary';

type Lang = 'es' | 'en';

type Bilingual = { es: string; en: string };

function itemKey(pillarId: HumiPillarId, blockId: PillarSummaryBlockId, itemName: string): string {
  return `${pillarId}|${blockId}|${itemName.trim().toLowerCase()}`;
}

const ITEM_DESCRIPTIONS: Record<string, Bilingual> = {
  // History — basic
  [itemKey('history', 'basic', 'Owner Wallet Active')]: {
    es: 'Evalúa la fortaleza y actividad de la wallet del propietario (5 pts máx. en bloque básico).',
    en: 'Evaluates owner wallet strength and activity (up to 5 pts in basic block).',
  },
  [itemKey('history', 'basic', 'Ownership Stability')]: {
    es: 'Mide la estabilidad de la propiedad del agente en el tiempo (pocos o ningún cambio de owner).',
    en: 'Measures ownership stability over time (few or no owner changes).',
  },
  // History — intermediate
  [itemKey('history', 'intermediate', 'Owner Advanced Antiquity')]: {
    es: 'Longevidad y antigüedad avanzada de la wallet del propietario.',
    en: 'Advanced longevity and antiquity of the owner wallet.',
  },
  [itemKey('history', 'intermediate', 'Active Agents in Portfolio')]: {
    es: 'Calidad y nivel de actividad del portafolio de agentes del propietario.',
    en: 'Quality and activity level of the owner’s agent portfolio.',
  },
  [itemKey('history', 'intermediate', 'Minimum External Audit')]: {
    es: 'Presencia mínima de auditorías externas en el portafolio del propietario.',
    en: 'Minimum external audit presence in the owner’s portfolio.',
  },
  [itemKey('history', 'intermediate', 'No External Warnings')]: {
    es: 'Baja tasa de advertencias externas en el portafolio del propietario.',
    en: 'Low external warning rate across the owner’s portfolio.',
  },
  // History — advanced
  [itemKey('history', 'advanced', 'Good Metadata + Services')]: {
    es: 'Calidad de metadata y verificación de servicios en el portafolio.',
    en: 'Metadata quality and service verification across the portfolio.',
  },
  [itemKey('history', 'advanced', 'Advanced External Audits')]: {
    es: 'Auditorías externas comprehensivas en agentes del portafolio.',
    en: 'Comprehensive external audits on portfolio agents.',
  },
  [itemKey('history', 'advanced', 'General Portfolio Activity')]: {
    es: 'Actividad sostenida y engagement de protocolo en el portafolio.',
    en: 'Sustained activity and protocol engagement across the portfolio.',
  },
  // Usage — basic
  [itemKey('usage', 'basic', 'Basic General Activity')]: {
    es: 'Actividad reciente natural del agente (wallet u on-chain) en los últimos 30 días.',
    en: 'Natural recent agent activity (wallet or on-chain) in the last 30 days.',
  },
  // Usage — intermediate
  [itemKey('usage', 'intermediate', 'Wallet Intermediate')]: {
    es: 'Volumen de actividad de wallet a nivel intermedio.',
    en: 'Intermediate-level wallet activity volume.',
  },
  [itemKey('usage', 'intermediate', 'On-Chain Activity Intermediate')]: {
    es: 'Calidad de actividad on-chain a nivel intermedio.',
    en: 'Intermediate on-chain activity quality.',
  },
  [itemKey('usage', 'intermediate', 'Comments')]: {
    es: 'Presencia de comentarios válidos en el ecosistema.',
    en: 'Presence of valid comments in the ecosystem.',
  },
  // Usage — advanced
  [itemKey('usage', 'advanced', 'Wallet Advanced')]: {
    es: 'Actividad avanzada de wallet (volumen reciente alto).',
    en: 'Advanced wallet activity (recent high volume).',
  },
  [itemKey('usage', 'advanced', 'On-Chain Activity Advanced')]: {
    es: 'Actividad on-chain avanzada con alta calidad.',
    en: 'Advanced on-chain activity with high quality.',
  },
  [itemKey('usage', 'advanced', 'Protocol Activity with Payments')]: {
    es: 'Actividad de protocolo con pagos asociados.',
    en: 'Protocol activity with associated payments.',
  },
  // Measure — basic
  [itemKey('measure', 'basic', 'Metadata Richness')]: {
    es: 'Riqueza y completitud de la metadata del agente.',
    en: 'Richness and completeness of agent metadata.',
  },
  [itemKey('measure', 'basic', 'Basic Existence')]: {
    es: 'Existencia de señales básicas: auditoría, identidad, protocolo u on-chain.',
    en: 'Existence of basic signals: audit, identity, protocol, or on-chain activity.',
  },
  // Measure — intermediate
  [itemKey('measure', 'intermediate', 'Wallet Transaction Quality')]: {
    es: 'Calidad de transacciones de wallet a nivel intermedio.',
    en: 'Intermediate wallet transaction quality.',
  },
  [itemKey('measure', 'intermediate', 'External Audit')]: {
    es: 'Auditorías externas básicas (al menos una con score aceptable).',
    en: 'Basic external audits (at least one with acceptable score).',
  },
  [itemKey('measure', 'intermediate', 'Protocol Activity')]: {
    es: 'Actividad de protocolo a nivel intermedio.',
    en: 'Intermediate protocol activity.',
  },
  // Measure — advanced
  [itemKey('measure', 'advanced', 'External Audit (Advanced)')]: {
    es: 'Auditorías externas avanzadas (múltiples con scores altos).',
    en: 'Advanced external audits (multiple with high scores).',
  },
  [itemKey('measure', 'advanced', 'Wallet Transaction Quality (Advanced)')]: {
    es: 'Calidad avanzada de transacciones de wallet.',
    en: 'Advanced wallet transaction quality.',
  },
  [itemKey('measure', 'advanced', 'Identity Analysis')]: {
    es: 'Análisis de identidad y evaluaciones especializadas.',
    en: 'Identity analysis and specialized evaluations.',
  },
  [itemKey('measure', 'advanced', 'Protocol Activity (Advanced)')]: {
    es: 'Actividad de protocolo avanzada con alta calidad.',
    en: 'Advanced protocol activity with high quality.',
  },
  // Information — basic
  [itemKey('information', 'basic', 'Name')]: {
    es: 'Calidad y claridad del nombre del agente.',
    en: 'Quality and clarity of the agent name.',
  },
  [itemKey('information', 'basic', 'Description')]: {
    es: 'Calidad y claridad de la descripción pública.',
    en: 'Quality and clarity of the public description.',
  },
  [itemKey('information', 'basic', 'Image')]: {
    es: 'Presencia y validez de la imagen del agente.',
    en: 'Presence and validity of the agent image.',
  },
  [itemKey('information', 'basic', 'Basic Sources')]: {
    es: 'Fuentes básicas de información (on-chain + URI).',
    en: 'Basic information sources (on-chain + URI).',
  },
  // Information — intermediate
  [itemKey('information', 'intermediate', 'External Sources / Diversity')]: {
    es: 'Diversidad y profundidad de fuentes externas de información.',
    en: 'Diversity and depth of external information sources.',
  },
  [itemKey('information', 'intermediate', 'Web or Email')]: {
    es: 'Disponibilidad de métodos de contacto web o email.',
    en: 'Availability of web or email contact methods.',
  },
  [itemKey('information', 'intermediate', 'Programmatic / API')]: {
    es: 'Presencia de endpoints programáticos o API.',
    en: 'Presence of programmatic or API endpoints.',
  },
  [itemKey('information', 'intermediate', 'Supported Trust')]: {
    es: 'Mecanismos de confianza soportados por el agente.',
    en: 'Trust mechanisms supported by the agent.',
  },
  [itemKey('information', 'intermediate', 'Verification Methods')]: {
    es: 'Métodos de verificación declarados.',
    en: 'Declared verification methods.',
  },
  [itemKey('information', 'intermediate', 'Basic Technical Metadata')]: {
    es: 'Metadata técnica básica (skills, capabilities, dominios).',
    en: 'Basic technical metadata (skills, capabilities, domains).',
  },
  // Information — advanced
  [itemKey('information', 'advanced', 'MCP Endpoint')]: {
    es: 'Endpoint MCP para integración avanzada.',
    en: 'MCP endpoint for advanced integration.',
  },
  [itemKey('information', 'advanced', 'A2A Endpoint')]: {
    es: 'Endpoint A2A para comunicación agente a agente.',
    en: 'A2A endpoint for agent-to-agent communication.',
  },
  [itemKey('information', 'advanced', 'Advanced Technical Setup')]: {
    es: 'Configuración técnica avanzada (stack, pagos, herramientas).',
    en: 'Advanced technical setup (stack, payments, tools).',
  },
};

const BLOCK_FALLBACK: Record<string, Bilingual> = {
  [itemKey('history', 'basic', '*')]: {
    es: 'Criterios básicos de historia y reputación del propietario.',
    en: 'Basic history and owner reputation criteria.',
  },
  [itemKey('history', 'intermediate', '*')]: {
    es: 'Criterios intermedios de madurez del portafolio del propietario.',
    en: 'Intermediate owner portfolio maturity criteria.',
  },
  [itemKey('history', 'advanced', '*')]: {
    es: 'Criterios avanzados de calidad del portafolio del propietario.',
    en: 'Advanced owner portfolio quality criteria.',
  },
  [itemKey('usage', 'basic', '*')]: {
    es: 'Actividad general reciente del agente.',
    en: 'Recent general agent activity.',
  },
  [itemKey('usage', 'intermediate', '*')]: {
    es: 'Actividad intermedia de wallet, on-chain y comentarios.',
    en: 'Intermediate wallet, on-chain, and comment activity.',
  },
  [itemKey('usage', 'advanced', '*')]: {
    es: 'Actividad avanzada y engagement de protocolo.',
    en: 'Advanced activity and protocol engagement.',
  },
  [itemKey('measure', 'basic', '*')]: {
    es: 'Validación básica: metadata y existencia de señales externas.',
    en: 'Basic validation: metadata and external signal existence.',
  },
  [itemKey('measure', 'intermediate', '*')]: {
    es: 'Validación intermedia: wallet, auditorías y protocolo.',
    en: 'Intermediate validation: wallet, audits, and protocol.',
  },
  [itemKey('measure', 'advanced', '*')]: {
    es: 'Validación avanzada: auditorías, identidad y actividad de protocolo.',
    en: 'Advanced validation: audits, identity, and protocol activity.',
  },
  [itemKey('information', 'basic', '*')]: {
    es: 'Identidad pública básica del agente.',
    en: 'Basic public agent identity.',
  },
  [itemKey('information', 'intermediate', '*')]: {
    es: 'Profundidad de fuentes y metadata técnica intermedia.',
    en: 'Source depth and intermediate technical metadata.',
  },
  [itemKey('information', 'advanced', '*')]: {
    es: 'Integración técnica avanzada (MCP, A2A, stack).',
    en: 'Advanced technical integration (MCP, A2A, stack).',
  },
};

function pickText(entry: Bilingual | undefined, lang: Lang): string | null {
  if (!entry) return null;
  return lang === 'es' ? entry.es : entry.en;
}

export function getHumiBusinessDescription(
  pillarId: HumiPillarId,
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
