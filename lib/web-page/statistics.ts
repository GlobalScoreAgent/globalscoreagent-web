export type TopMetric = {
  value: number;
  chain_name: string;
};

export type MainPageKpi = {
  last_updated: string;
  active_chains: string[];
  global_totals: {
    agent_new: number;
    agent_total: number;
    owner_total: number;
    agent_active: number;
    feedback_new: number;
    feedback_total: number;
    agent_with_feedback: number;
  };
  top_new_agents: TopMetric;
  top_total_agents: TopMetric;
  top_total_owners: TopMetric;
  top_new_feedbacks: TopMetric;
  top_total_feedbacks: TopMetric;
};

export type MaturityBucket = {
  count: number;
  avg: number | null;
};

export type MaturityKey = 'Unstable' | 'Developing' | 'Stable' | 'Very Stable' | 'Elite';

/** @deprecated Use MaturityKey */
export type HumiMaturityKey = MaturityKey;
/** @deprecated Use MaturityBucket */
export type HumiMaturityBucket = MaturityBucket;
export type WamiMaturityKey = MaturityKey;

export type HumiPageKpi = {
  last_updated: string;
  best_agent: string;
  best_agent_score: number;
  total_agents_analysed: number;
  avg_top_100: number;
  distribution: Record<MaturityKey, MaturityBucket>;
};

export const MATURITY_KEYS: MaturityKey[] = [
  'Unstable',
  'Developing',
  'Stable',
  'Very Stable',
  'Elite',
];

export const HUMI_MATURITY_KEYS = MATURITY_KEYS;
export const WAMI_MATURITY_KEYS = MATURITY_KEYS;

export type StatisticsPage = 'main' | 'humi' | 'wami';

const PAGE_COLUMN: Record<StatisticsPage, string> = {
  main: 'main_page_kpi',
  humi: 'humi_page_kpi',
  wami: 'wami_page_kpi',
};

export function getStatisticsColumn(page: StatisticsPage): string {
  return PAGE_COLUMN[page];
}

export function startOfUtcDayIso(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function utcDayIso(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export function utcDateFromTimestamp(iso: string): string {
  return iso.slice(0, 10);
}

export type StatisticsSource = 'today' | 'yesterday' | 'latest';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeJsonField(raw: unknown): unknown {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }
  return raw;
}

function parseTopMetric(value: unknown): TopMetric | null {
  if (!isRecord(value)) return null;
  const num = coerceNumber(value.value);
  const chain = value.chain_name;
  if (num === null || typeof chain !== 'string') return null;
  return { value: num, chain_name: chain };
}

export function parseMainPageKpi(raw: unknown): MainPageKpi | null {
  const normalized = normalizeJsonField(raw);
  if (!isRecord(normalized)) return null;
  const record = normalized;

  const chains = record.active_chains;
  const totals = record.global_totals;
  if (!Array.isArray(chains) || !chains.every((c) => typeof c === 'string')) return null;
  if (!isRecord(totals)) return null;

  const requiredTotals = [
    'agent_new',
    'agent_total',
    'owner_total',
    'agent_active',
    'feedback_new',
    'feedback_total',
    'agent_with_feedback',
  ] as const;

  const coercedTotals: Record<(typeof requiredTotals)[number], number> = {
    agent_new: 0,
    agent_total: 0,
    owner_total: 0,
    agent_active: 0,
    feedback_new: 0,
    feedback_total: 0,
    agent_with_feedback: 0,
  };

  for (const key of requiredTotals) {
    const n = coerceNumber(totals[key]);
    if (n === null) return null;
    coercedTotals[key] = n;
  }

  const top_new_agents = parseTopMetric(record.top_new_agents);
  const top_total_agents = parseTopMetric(record.top_total_agents);
  const top_total_owners = parseTopMetric(record.top_total_owners);
  const top_new_feedbacks = parseTopMetric(record.top_new_feedbacks);
  const top_total_feedbacks = parseTopMetric(record.top_total_feedbacks);

  if (
    !top_new_agents ||
    !top_total_agents ||
    !top_total_owners ||
    !top_new_feedbacks ||
    !top_total_feedbacks
  ) {
    return null;
  }

  const last_updated =
    typeof record.last_updated === 'string' ? record.last_updated : new Date().toISOString();

  return {
    last_updated,
    active_chains: chains,
    global_totals: coercedTotals,
    top_new_agents,
    top_total_agents,
    top_total_owners,
    top_new_feedbacks,
    top_total_feedbacks,
  };
}

function parseMaturityBucket(value: unknown): MaturityBucket {
  if (value === null || value === undefined) {
    return { count: 0, avg: null };
  }
  if (!isRecord(value)) {
    return { count: 0, avg: null };
  }
  const count = coerceNumber(value.count);
  const avg = coerceNumber(value.avg);
  if (count === null || avg === null) {
    return { count: 0, avg: null };
  }
  return { count, avg };
}

export function parseHumiPageKpi(raw: unknown): HumiPageKpi | null {
  const normalized = normalizeJsonField(raw);
  if (!isRecord(normalized)) return null;
  const record = normalized;

  const best_agent = record.best_agent;
  if (typeof best_agent !== 'string') return null;

  const best_agent_score = coerceNumber(record.best_agent_score);
  const total_agents_analysed = coerceNumber(record.total_agents_analysed);
  const avg_top_100 = coerceNumber(record.avg_top_100);
  if (
    best_agent_score === null ||
    total_agents_analysed === null ||
    avg_top_100 === null
  ) {
    return null;
  }

  const distRaw = record.distribution;
  if (!isRecord(distRaw)) return null;

  const distribution = {} as Record<MaturityKey, MaturityBucket>;
  for (const key of MATURITY_KEYS) {
    distribution[key] = parseMaturityBucket(distRaw[key]);
  }

  const last_updated =
    typeof record.last_updated === 'string' ? record.last_updated : new Date().toISOString();

  return {
    last_updated,
    best_agent,
    best_agent_score,
    total_agents_analysed,
    avg_top_100,
    distribution,
  };
}

export type WamiPageKpi = {
  last_updated: string;
  wallet_analysed: number;
  nonce_total: number;
  nonce_delta: number;
  wallet_link_agent_valid: number;
  wallet_link_agent_not_valid: number;
  distribution: Record<MaturityKey, MaturityBucket>;
  wallet_categories: Record<string, number>;
};

function parseWalletCategories(value: unknown): Record<string, number> | null {
  if (!isRecord(value)) return null;
  const result: Record<string, number> = {};
  for (const [key, val] of Object.entries(value)) {
    const n = coerceNumber(val);
    if (n === null) return null;
    result[key] = n;
  }
  return result;
}

export function parseWamiPageKpi(raw: unknown): WamiPageKpi | null {
  const normalized = normalizeJsonField(raw);
  if (!isRecord(normalized)) return null;
  const record = normalized;

  const wallet_analysed = coerceNumber(record.wallet_analysed);
  const nonce_total = coerceNumber(record.nonce_total);
  const nonce_delta = coerceNumber(record.nonce_delta);
  const wallet_link_agent_valid = coerceNumber(record.wallet_link_agent_valid);
  const wallet_link_agent_not_valid = coerceNumber(record.wallet_link_agent_not_valid);

  if (
    wallet_analysed === null ||
    nonce_total === null ||
    nonce_delta === null ||
    wallet_link_agent_valid === null ||
    wallet_link_agent_not_valid === null
  ) {
    return null;
  }

  const distRaw = record.distribution;
  if (!isRecord(distRaw)) return null;

  const distribution = {} as Record<MaturityKey, MaturityBucket>;
  for (const key of MATURITY_KEYS) {
    distribution[key] = parseMaturityBucket(distRaw[key]);
  }

  const wallet_categories = parseWalletCategories(record.wallet_categories);
  if (!wallet_categories) return null;

  const last_updated =
    typeof record.last_updated === 'string' ? record.last_updated : new Date().toISOString();

  return {
    last_updated,
    wallet_analysed,
    nonce_total,
    nonce_delta,
    wallet_link_agent_valid,
    wallet_link_agent_not_valid,
    distribution,
    wallet_categories,
  };
}
