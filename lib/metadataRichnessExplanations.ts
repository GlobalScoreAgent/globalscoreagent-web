/**
 * Business explanations for metadata richness detail items (ES/EN).
 * Source: docs/agent-metadata-richness-analysis.md
 */

export type RichnessExplanationLang = 'es' | 'en';

type BilingualText = { es: string; en: string };

const EXPLANATIONS: Record<string, BilingualText> = {
  name: {
    en: 'A clear, meaningful name that properly identifies the agent (no generic placeholders).',
    es: 'Un nombre claro y significativo que identifica correctamente al agente (sin placeholders genéricos).',
  },
  description: {
    en: "A detailed, informative description that explains the agent's purpose and value.",
    es: 'Una descripción detallada e informativa que explica el propósito y el valor del agente.',
  },
  image: {
    en: 'A professional visual identity (logo or avatar) that represents the agent.',
    es: 'Una identidad visual profesional (logo o avatar) que representa al agente.',
  },
  tags: {
    en: 'Relevant categorization tags that improve discoverability and search relevance.',
    es: 'Etiquetas de categorización relevantes que mejoran la descubribilidad y la relevancia en búsquedas.',
  },
  verification_methods: {
    en: 'Proof that the agent is legitimately controlled and verifiable.',
    es: 'Prueba de que el agente está controlado legítimamente y es verificable.',
  },
  supported_trust: {
    en: 'Certifications, attestations, or trust frameworks the agent supports.',
    es: 'Certificaciones, attestations o marcos de confianza que el agente soporta.',
  },
  services: {
    en: 'Clearly defined services/endpoints the agent offers to users and other agents.',
    es: 'Servicios o endpoints claramente definidos que el agente ofrece a usuarios y otros agentes.',
  },
  payment: {
    en: 'Ability to accept payments or participate in economic transactions.',
    es: 'Capacidad de aceptar pagos o participar en transacciones económicas.',
  },
  governance: {
    en: 'Transparency about ownership, control, and decision-making structure.',
    es: 'Transparencia sobre propiedad, control y estructura de toma de decisiones.',
  },
  oasf: {
    en: 'Adoption of open, standardized agent frameworks for better interoperability.',
    es: 'Adopción de marcos de agentes abiertos y estandarizados para mejor interoperabilidad.',
  },
  technical_tools: {
    en: 'Advanced tooling and execution capabilities.',
    es: 'Herramientas avanzadas y capacidades de ejecución.',
  },
  technical_prompts: {
    en: 'Sophisticated prompt engineering and interaction capabilities.',
    es: 'Ingeniería de prompts sofisticada y capacidades de interacción.',
  },
  technical_capabilities: {
    en: 'Rich set of programmable features and behaviors.',
    es: 'Conjunto amplio de funciones y comportamientos programables.',
  },
};

/** Maps API/detail keys to canonical explanation keys. */
const KEY_ALIASES: Record<string, string> = {
  verification: 'verification_methods',
  verification_method: 'verification_methods',
  verifications: 'verification_methods',
  supported_trust_signals: 'supported_trust',
  trust: 'supported_trust',
  trust_signals: 'supported_trust',
  payment_capabilities: 'payment',
  payments: 'payment',
  payment_capability: 'payment',
  oasf_compatibility: 'oasf',
  oasf_compatible: 'oasf',
  technical_capability: 'technical_capabilities',
  technical_tool: 'technical_tools',
  technical_prompt: 'technical_prompts',
  tag: 'tags',
};

export function normalizeRichnessItemKey(rawKey: string): string {
  const base = rawKey
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '');
  return KEY_ALIASES[base] ?? base;
}

export function getRichnessItemExplanation(
  rawKey: string,
  lang: RichnessExplanationLang,
): string | null {
  const canonical = normalizeRichnessItemKey(rawKey);
  const entry = EXPLANATIONS[canonical];
  if (!entry) return null;
  return lang === 'es' ? entry.es : entry.en;
}
