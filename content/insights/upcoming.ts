import type { Bilingual } from '@/content/marketing/i18n';
import type { InsightsTagId } from '@/content/insights/copy';

export type InsightsUpcomingPriority = 'high' | 'medium';

export type InsightsUpcomingEntry = {
  id: string;
  tags: InsightsTagId[];
  title: Bilingual;
  description: Bilingual;
  priority?: InsightsUpcomingPriority;
  sourceBrief?: string;
};

export const insightsUpcoming: InsightsUpcomingEntry[] = [
  {
    id: 'metadata-duplicates',
    tags: ['metadata'],
    priority: 'high',
    sourceBrief: '2026-08-15 - erc-8004-agent-metadata-quality-and-duplicates',
    title: {
      es: 'Metadata de agentes ERC-8004: duplicados, calidad y cobertura',
      en: 'ERC-8004 agent metadata: duplicates, quality, coverage',
    },
    description: {
      es: '¿Cuánto del stock es plantilla repetida y qué queda de descripción real?',
      en: 'How much of the stock is cloned template, and what is actually described?',
    },
  },
  {
    id: 'agents-by-chain',
    tags: ['chains'],
    priority: 'high',
    sourceBrief: '2026-08-14 - erc-8004-agents-by-chain-eth-vs-l2s',
    title: {
      es: 'Dónde viven los agentes ERC-8004: L1, L2s y BNB',
      en: 'Where ERC-8004 agents actually live: L1 vs L2s vs BNB',
    },
    description: {
      es: 'El stock, el flujo reciente y el feedback no coinciden en las mismas chains.',
      en: 'Stock, recent flow, and feedback do not sit on the same chains.',
    },
  },
  {
    id: 'feedback-tags',
    tags: ['feedback'],
    priority: 'high',
    sourceBrief: '2026-08-14 - reputation-feedback-tags-are-not-method-strength',
    title: {
      es: 'Tags de Reputation: usados a escala, no como method-strength',
      en: 'Reputation feedback tags vs method-strength',
    },
    description: {
      es: 'Los tags están llenos; el vocabulario de method-strength casi no aparece.',
      en: 'Tags are filled at scale; method-strength vocabulary barely shows up.',
    },
  },
  {
    id: 'service-endpoints',
    tags: ['endpoints'],
    priority: 'high',
    sourceBrief: '2026-08-15 - erc-8004-declared-service-endpoints',
    title: {
      es: 'Cuántos agentes declaran un service endpoint',
      en: 'How many agents declare a service endpoint?',
    },
    description: {
      es: 'Un tercio declara endpoint; la tasa cambia fuerte entre Ethereum y Celo.',
      en: 'About a third declare an endpoint; the rate splits sharply between Ethereum and Celo.',
    },
  },
];
