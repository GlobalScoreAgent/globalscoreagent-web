import type { InsightsTagId } from '@/content/insights/copy';
import type { InsightsManifestEntry } from '@/content/insights/manifest';
import type { SeoLang } from '@/content/marketing/metadata';

const INDEX_KEYWORDS: Record<SeoLang, readonly string[]> = {
  en: [
    'ERC-8004',
    'ERC-8004 agents',
    'trustless agents',
    'AI agents on-chain',
    'identity registry',
    'reputation registry',
    'validation registry',
    'agent economy',
    'blockchain AI agents',
    'Global Score Agent',
    'GSA Insights',
  ],
  es: [
    'ERC-8004',
    'agentes ERC-8004',
    'agentes sin confianza previa',
    'agentes IA on-chain',
    'registro de identidad',
    'registro de reputation',
    'registro de validación',
    'economía de agentes',
    'Global Score Agent',
    'GSA Insights',
  ],
};

const TAG_KEYWORDS: Record<InsightsTagId, Record<SeoLang, readonly string[]>> = {
  ecosystem: {
    en: ['ERC-8004 ecosystem', 'agent adoption', 'on-chain agent data'],
    es: ['ecosistema ERC-8004', 'adopción de agentes', 'datos de agentes on-chain'],
  },
  metadata: {
    en: ['ERC-8004 agent metadata', 'agent identity metadata'],
    es: ['metadata agentes ERC-8004', 'metadata de identidad'],
  },
  chains: {
    en: ['ERC-8004 multichain', 'agents by blockchain'],
    es: ['ERC-8004 multichain', 'agentes por blockchain'],
  },
  feedback: {
    en: ['ERC-8004 reputation', 'agent feedback on-chain'],
    es: ['reputation ERC-8004', 'feedback de agentes on-chain'],
  },
  endpoints: {
    en: ['ERC-8004 service endpoints', 'agent HTTP endpoints'],
    es: ['endpoints ERC-8004', 'endpoints HTTP de agentes'],
  },
};

export function insightsIndexKeywords(lang: SeoLang): string[] {
  return [...INDEX_KEYWORDS[lang]];
}

export function insightsPostKeywords(entry: InsightsManifestEntry, lang: SeoLang): string[] {
  const fromTags = entry.tags.flatMap((tag) => TAG_KEYWORDS[tag][lang]);
  const custom = entry.seoKeywords?.[lang] ?? [];
  return [...new Set([...insightsIndexKeywords(lang), ...fromTags, ...custom])];
}
