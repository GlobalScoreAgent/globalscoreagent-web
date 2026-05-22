import type { GlobalTotalKey, TopMetricKey } from '@/content/marketing/kpi-labels';

export const MOBILE_HIDDEN_FEEDBACK_KEYS = new Set<string>([
  'feedback_new',
  'feedback_total',
  'top_new_feedbacks',
  'top_total_feedbacks',
]);

export const HOME_GLOBAL_KEYS: GlobalTotalKey[] = [
  'agent_new',
  'agent_total',
  'owner_total',
  'agent_active',
  'feedback_new',
  'feedback_total',
  'agent_with_feedback',
];

export const HOME_TOP_KEYS: TopMetricKey[] = [
  'top_new_agents',
  'top_total_agents',
  'top_total_owners',
  'top_new_feedbacks',
  'top_total_feedbacks',
];

export function kpiMobileWrapperClass(key: string): string | undefined {
  return MOBILE_HIDDEN_FEEDBACK_KEYS.has(key) ? 'hidden sm:contents' : undefined;
}

/** Skeleton slot order: chains (wide) + globals + tops — matches KpiOverlay grid. */
export const HOME_SKELETON_SLOTS: { wide: boolean; key?: string }[] = [
  { wide: true },
  ...HOME_GLOBAL_KEYS.map((key) => ({ wide: false as const, key })),
  ...HOME_TOP_KEYS.map((key) => ({ wide: false as const, key })),
];
