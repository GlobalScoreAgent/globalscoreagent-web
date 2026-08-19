import {
  INSIGHTS_TAG_IDS,
  type InsightsTagId,
} from '@/content/insights/copy';
import { insightsManifest } from '@/content/insights/manifest';
import { insightsUpcoming } from '@/content/insights/upcoming';

export function isInsightsTagId(value: string | undefined | null): value is InsightsTagId {
  return !!value && (INSIGHTS_TAG_IDS as readonly string[]).includes(value);
}

export function collectInsightsTagIds(): InsightsTagId[] {
  const used = new Set<InsightsTagId>();
  for (const entry of insightsManifest) {
    for (const tag of entry.tags) used.add(tag);
  }
  for (const entry of insightsUpcoming) {
    for (const tag of entry.tags) used.add(tag);
  }
  return INSIGHTS_TAG_IDS.filter((id) => used.has(id));
}

export function publishedTagIds(): Set<InsightsTagId> {
  const used = new Set<InsightsTagId>();
  for (const entry of insightsManifest) {
    for (const tag of entry.tags) used.add(tag);
  }
  return used;
}
