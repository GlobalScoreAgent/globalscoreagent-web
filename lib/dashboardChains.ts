/**
 * Types and helpers for dashboard chain cards (web_dashboard.chains).
 */

import type { AgentRouteLookupBy } from '@/lib/dashboardAgentLookup';
import { parseTop10AgentRoute } from '@/lib/dashboardAgentLookup';

export type DashboardChainRow = {
  chain_id: string;
  name: string;
  short_name: string;
  updated_at: string | null;
  logo_file_name: string | null;
  agent_stats_information: Record<string, unknown> | null;
  statistics_agent_last_30_days: Record<string, unknown> | null;
  statistics_agent_monthly: MonthlyStatRow[] | null;
  humi_distribution: Record<string, unknown> | null;
  wami_distribution: Record<string, unknown> | null;
  metadata_distribution: Record<string, unknown> | null;
  best_10_agents_humi: unknown;
  owner_stats_information: Record<string, unknown> | null;
  technical_data_information: Record<string, unknown> | null;
  warning_stats_information: Record<string, unknown> | null;
  on_chain_stats_information: Record<string, unknown> | null;
};

export type MonthlyStatRow = {
  month: string;
  new_agents?: number | null;
  total_agents?: number | null;
  active_agents?: number | null;
};

export {
  MATURITY_ORDER,
  MATURITY_COLORS,
  MATURITY_TKEY,
  MATURITY_SCORE_RANGES,
  normalizeMaturityDistribution,
  type MaturityKey,
  type MaturityTranslationKey,
} from '@/lib/dashboardMaturityDistribution';

export {
  METADATA_ORDER,
  METADATA_COLORS,
  METADATA_TKEY,
  METADATA_SCORE_RANGES,
  METADATA_RICHNESS_KEYS,
  normalizeMetadataDistribution,
  type MetadataRichnessKey,
  type MetadataTranslationKey,
} from '@/lib/dashboardMetadataDistribution';

/** @deprecated Agent detail richness tier — phase 2 migration. */
export type LegacyMetadataTranslationKey =
  | 'metadataPoor'
  | 'metadataLow'
  | 'metadataRegular'
  | 'metadataGood'
  | 'metadataExcellent'
  | 'metadataElite';

/** @deprecated Agent detail richness tier — phase 2 migration. */
export const LEGACY_METADATA_BUCKET_COLORS: Record<LegacyMetadataTranslationKey, string> = {
  metadataPoor: '#dc2626',
  metadataLow: '#f97316',
  metadataRegular: '#f59e0b',
  metadataGood: '#10b981',
  metadataExcellent: '#3b82f6',
  metadataElite: '#a855f7',
};

/** Bar/pie colors keyed by dashboard metadata translation keys. */
export { METADATA_BUCKET_COLORS } from '@/lib/dashboardMetadataDistribution';

/** @deprecated Agent HUMI badge labels — phase 2 migration. */
export type HumiTranslationKey =
  | 'humiCritical'
  | 'humiModerateRisk'
  | 'humiStable'
  | 'humiHighPerformance'
  | 'humiElite';

function hslToRgbTriplet(h360: number, s: number, l: number): [number, number, number] {
  const h = h360 / 360;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/** Same perceptual hue/sat/lightness as chainAccentColor, as #RRGGBB for hex+alpha gradients. */
export function chainAccentHex(chainId: string): string {
  let h = 0;
  for (let i = 0; i < chainId.length; i++) {
    h = chainId.charCodeAt(i) + ((h << 5) - h);
  }
  const hue = Math.abs(h) % 360;
  const [r, g, b] = hslToRgbTriplet(hue, 0.58, 0.52);
  const hex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export function chainAccentColor(chainId: string): string {
  let h = 0;
  for (let i = 0; i < chainId.length; i++) {
    h = chainId.charCodeAt(i) + ((h << 5) - h);
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 58% 52%)`;
}

export function numFromJson(obj: unknown, key: string): number | null {
  if (!obj || typeof obj !== 'object') return null;
  const v = (obj as Record<string, unknown>)[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Convert agent count to percentage of total agents (2 decimal places). */
export function pctRateFromCount(
  count: number | null,
  totalAgents: number | null,
): number | null {
  if (count === null || totalAgents === null || totalAgents <= 0) return null;
  return Math.round((count / totalAgents) * 10000) / 100;
}

/** Parse technical maturity JSON — supports raw counts (new MV) or pre-calculated pct (legacy). */
export function parseTechnicalMaturityPcts(
  techJson: unknown,
  totalAgents: number | null,
): {
  pctX402: number | null;
  pctMcpA2a: number | null;
  countX402: number | null;
  countMcpA2a: number | null;
} {
  const legacyX402 = numFromJson(techJson, 'pct_x402');
  const legacyMcpA2a = numFromJson(techJson, 'pct_mcp_a2a');
  if (legacyX402 !== null || legacyMcpA2a !== null) {
    return {
      pctX402: legacyX402,
      pctMcpA2a: legacyMcpA2a,
      countX402: null,
      countMcpA2a: null,
    };
  }

  const x402 = numFromJson(techJson, 'agents_with_x402_support');
  const mcp = numFromJson(techJson, 'agents_with_mcp_support');
  const a2a = numFromJson(techJson, 'agents_with_a2a_support');
  const mcpA2aSum =
    mcp !== null || a2a !== null ? (mcp ?? 0) + (a2a ?? 0) : null;

  return {
    pctX402: pctRateFromCount(x402, totalAgents),
    pctMcpA2a: pctRateFromCount(mcpA2aSum, totalAgents),
    countX402: x402,
    countMcpA2a: mcpA2aSum,
  };
}

export function parseMonthlyRows(raw: unknown): MonthlyStatRow[] {
  if (!Array.isArray(raw)) return [];
  const out: MonthlyStatRow[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const month = typeof r.month === 'string' ? r.month : null;
    if (!month) continue;
    const parseOpt = (k: string): number | null => {
      const x = r[k];
      if (x === null || x === undefined) return null;
      const n = typeof x === 'number' ? x : Number(x);
      return Number.isFinite(n) ? n : null;
    };
    out.push({
      month,
      new_agents: parseOpt('new_agents'),
      total_agents: parseOpt('total_agents'),
      active_agents: parseOpt('active_agents'),
    });
  }
  return out.sort((a, b) => a.month.localeCompare(b.month));
}

export function recordToNumberMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) out[k] = n;
  }
  return out;
}

export type Best10AgentHumiRow = {
  name: string;
  humi_score: number;
  agent_id?: number;
  route_lookup_by?: AgentRouteLookupBy;
  chain_short_name?: string;
};

export function parseBest10AgentsHumi(raw: unknown): Best10AgentHumiRow[] {
  if (!Array.isArray(raw)) return [];
  const rows: Best10AgentHumiRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const name =
      typeof (item as { name?: unknown }).name === 'string'
        ? String((item as { name: string }).name).trim()
        : '';
    if (!name) continue;
    const scoreRaw =
      (item as { humi_score?: unknown; index_humi_score?: unknown }).humi_score ??
      (item as { index_humi_score?: unknown }).index_humi_score;
    const n = typeof scoreRaw === 'number' ? scoreRaw : Number(scoreRaw);
    if (!Number.isFinite(n)) continue;
    const route = parseTop10AgentRoute(item);
    const chainShortRaw = (item as { chain_short_name?: unknown }).chain_short_name;
    const chainShortName =
      typeof chainShortRaw === 'string' ? chainShortRaw.trim() : '';
    const row: Best10AgentHumiRow = { name, humi_score: n };
    if (route != null) {
      row.agent_id = route.routeId;
      row.route_lookup_by = route.lookupBy;
    }
    if (chainShortName) {
      row.chain_short_name = chainShortName;
    }
    rows.push(row);
  }
  return rows.sort((a, b) => b.humi_score - a.humi_score).slice(0, 10);
}

/** Fixed display order for chain warning_stats_information JSON keys. */
export const WARNING_STAT_KEYS = [
  'dummy_metadata',
  'lower_realness',
  'lower_metadata_richness',
  'duplication_metadata',
  'multi_agent_wallet',
  'transactional_wallet_same_as_owner',
  'owner_inactive_agents',
  'high_ownership_churn',
  'attestations_spam',
  'high_revocations',
  'external_audit_warning',
] as const;

export type WarningStatKey = (typeof WARNING_STAT_KEYS)[number];

export type WarningTranslationKey =
  | 'chainWarningDummyMetadata'
  | 'chainWarningLowerRealness'
  | 'chainWarningLowerMetadataRichness'
  | 'chainWarningDuplicationMetadata'
  | 'chainWarningMultiAgentWallet'
  | 'chainWarningTransactionalWalletSameAsOwner'
  | 'chainWarningOwnerInactiveAgents'
  | 'chainWarningHighOwnershipChurn'
  | 'chainWarningAttestationsSpam'
  | 'chainWarningHighRevocations'
  | 'chainWarningExternalAuditWarning';

export type WarningHelpTranslationKey =
  | 'chainWarningDummyMetadataHelp'
  | 'chainWarningLowerRealnessHelp'
  | 'chainWarningLowerMetadataRichnessHelp'
  | 'chainWarningDuplicationMetadataHelp'
  | 'chainWarningMultiAgentWalletHelp'
  | 'chainWarningTransactionalWalletSameAsOwnerHelp'
  | 'chainWarningOwnerInactiveAgentsHelp'
  | 'chainWarningHighOwnershipChurnHelp'
  | 'chainWarningAttestationsSpamHelp'
  | 'chainWarningHighRevocationsHelp'
  | 'chainWarningExternalAuditWarningHelp';

export const WARNING_STAT_TKEY: Record<WarningStatKey, WarningTranslationKey> = {
  dummy_metadata: 'chainWarningDummyMetadata',
  lower_realness: 'chainWarningLowerRealness',
  lower_metadata_richness: 'chainWarningLowerMetadataRichness',
  duplication_metadata: 'chainWarningDuplicationMetadata',
  multi_agent_wallet: 'chainWarningMultiAgentWallet',
  transactional_wallet_same_as_owner: 'chainWarningTransactionalWalletSameAsOwner',
  owner_inactive_agents: 'chainWarningOwnerInactiveAgents',
  high_ownership_churn: 'chainWarningHighOwnershipChurn',
  attestations_spam: 'chainWarningAttestationsSpam',
  high_revocations: 'chainWarningHighRevocations',
  external_audit_warning: 'chainWarningExternalAuditWarning',
};

export const WARNING_STAT_HELP_TKEY: Record<WarningStatKey, WarningHelpTranslationKey> = {
  dummy_metadata: 'chainWarningDummyMetadataHelp',
  lower_realness: 'chainWarningLowerRealnessHelp',
  lower_metadata_richness: 'chainWarningLowerMetadataRichnessHelp',
  duplication_metadata: 'chainWarningDuplicationMetadataHelp',
  multi_agent_wallet: 'chainWarningMultiAgentWalletHelp',
  transactional_wallet_same_as_owner: 'chainWarningTransactionalWalletSameAsOwnerHelp',
  owner_inactive_agents: 'chainWarningOwnerInactiveAgentsHelp',
  high_ownership_churn: 'chainWarningHighOwnershipChurnHelp',
  attestations_spam: 'chainWarningAttestationsSpamHelp',
  high_revocations: 'chainWarningHighRevocationsHelp',
  external_audit_warning: 'chainWarningExternalAuditWarningHelp',
};

function warningStatsLookLikeCounts(values: number[]): boolean {
  return values.some((n) => n > 100);
}

export function parseWarningStats(
  raw: unknown,
  totalAgents?: number | null,
): { key: WarningStatKey; value: number; count: number | null }[] {
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as Record<string, unknown>;
  const counts: { key: WarningStatKey; value: number }[] = [];
  for (const key of WARNING_STAT_KEYS) {
    const v = obj[key];
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) counts.push({ key, value: n });
  }

  const useCountMode =
    totalAgents != null &&
    totalAgents > 0 &&
    warningStatsLookLikeCounts(counts.map((c) => c.value));

  if (!useCountMode) {
    return counts.map(({ key, value }) => ({ key, value, count: null }));
  }

  return counts.map(({ key, value: agentCount }) => ({
    key,
    value: pctRateFromCount(agentCount, totalAgents) ?? agentCount,
    count: agentCount,
  }));
}

/** Map numeric HUMI score to filter tier for badge color (approximate bands). */
export function humiFilterFromNumericScore(score: number): string {
  if (score >= 90) return 'Elite';
  if (score >= 80) return 'High Performance';
  if (score >= 60) return 'Stable';
  if (score >= 30) return 'Moderate Risk';
  return 'Critical';
}
