import type { MainPageKpi } from '@/lib/web-page/statistics';

export type InsightsStatKey = 'agents' | 'chains' | 'feedback' | 'owners';

export type InsightsStatItem = {
  key: InsightsStatKey;
  value: number;
};

export function insightsStatsFromMainKpi(kpi: MainPageKpi): InsightsStatItem[] {
  return [
    { key: 'agents', value: kpi.global_totals.agent_total },
    { key: 'chains', value: kpi.active_chains.length },
    { key: 'feedback', value: kpi.global_totals.feedback_total },
    { key: 'owners', value: kpi.global_totals.owner_total },
  ];
}

export function formatInsightsStat(value: number, lang: 'es' | 'en'): string {
  return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US').format(value);
}
