/**
 * Types and helpers for dashboard chain cards (web_dashboard.chains).
 */

export type DashboardChainRow = {
  chain_id: string;
  name: string;
  short_name: string;
  logo_file_name: string | null;
  agent_stats_information: Record<string, unknown> | null;
  statistics_agent_last_30_days: Record<string, unknown> | null;
  statistics_agent_monthly: MonthlyStatRow[] | null;
  humi_distribution: Record<string, unknown> | null;
  metadata_distribution: Record<string, unknown> | null;
  owner_stats_information: Record<string, unknown> | null;
};

export type MonthlyStatRow = {
  month: string;
  new_agents?: number | null;
  total_agents?: number | null;
  active_agents?: number | null;
};

/** Visual order left→right for stacked HUMI bar (low score → elite). */
export const HUMI_BUCKET_ORDER = [
  'Critical',
  'Moderate Risk',
  'Stable',
  'High Performance',
  'Elite',
] as const;

export const HUMI_BUCKET_COLORS: Record<string, string> = {
  Critical: '#dc2626',
  'Moderate Risk': '#f97316',
  Stable: '#eab308',
  'High Performance': '#84cc16',
  Elite: '#22c55e',
};

export type HumiTranslationKey =
  | 'humiCritical'
  | 'humiModerateRisk'
  | 'humiStable'
  | 'humiHighPerformance'
  | 'humiElite';

export const HUMI_BUCKET_TKEY: Record<string, HumiTranslationKey> = {
  Critical: 'humiCritical',
  'Moderate Risk': 'humiModerateRisk',
  Stable: 'humiStable',
  'High Performance': 'humiHighPerformance',
  Elite: 'humiElite',
};

/** DB metadata JSON keys → Translation keys on LanguageContext */
export type MetadataTranslationKey =
  | 'metadataPoor'
  | 'metadataLow'
  | 'metadataRegular'
  | 'metadataGood'
  | 'metadataExcellent'
  | 'metadataElite';

export const METADATA_DB_KEY_TO_TKEY: Record<string, MetadataTranslationKey> = {
  'Mala (0-10)': 'metadataPoor',
  'Baja (10-30)': 'metadataLow',
  'Regular (30-50)': 'metadataRegular',
  'Buena (50-70)': 'metadataGood',
  'Excelente (70-90)': 'metadataExcellent',
  'Elite (90-100)': 'metadataElite',
};

export const METADATA_BUCKET_COLORS: Record<string, string> = {
  metadataPoor: '#dc2626',
  metadataLow: '#f97316',
  metadataRegular: '#f59e0b',
  metadataGood: '#10b981',
  metadataExcellent: '#3b82f6',
  metadataElite: '#a855f7',
};

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

/** Sort metadata distribution keys by lower bound of range in parentheses */
export function sortedMetadataKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => metadataRangeStart(a) - metadataRangeStart(b));
}

function metadataRangeStart(key: string): number {
  const m = key.match(/\((\d+)-/);
  return m ? parseInt(m[1], 10) : 9999;
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
