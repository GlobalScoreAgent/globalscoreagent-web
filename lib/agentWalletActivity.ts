/**
 * Parsers for web_dashboard.agent_wallet_activity (multi-chain transactional wallets).
 */

export type DateValuePoint = { date: string; value: number };

export type DateBalancesPoint = {
  date: string;
  balances: Record<string, number>;
};

export type AgentWalletChainActivity = {
  chain_id: number;
  chain_name: string;
  nonce_current: number | null;
  balance_current: number | null;
  wallet_category: string | null;
  nonce_last_30_days: DateValuePoint[];
  balance_last_30_days: DateValuePoint[];
};

export type AgentWalletActivityWallet = {
  wallet_address: string;
  general_nonce_total: number | null;
  general_balance_total: Record<string, number>;
  general_nonce_last_30_days: DateValuePoint[];
  general_balance_last_30_days: DateBalancesPoint[];
  chains: AgentWalletChainActivity[];
};

export type AgentWalletActivity = {
  nonce_current: number | null;
  balance_data: Record<string, number>;
  nonce_last_30_days: DateValuePoint[];
  balance_last_30_days: DateBalancesPoint[];
  transactional_wallets: AgentWalletActivityWallet[];
  calculated_at: string | null;
};

export type DailyChartPoint = { label: string; value: number };

export type MultiSeriesChartPoint = {
  label: string;
  [seriesKey: string]: string | number;
};

function readFiniteNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

function readString(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  return t || null;
}

function parseDateValueSeries(raw: unknown): DateValuePoint[] {
  if (!Array.isArray(raw)) return [];
  const out: DateValuePoint[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const date = readString(o.date);
    const value = readFiniteNumber(o.value);
    if (!date || value === null) continue;
    out.push({ date, value });
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

function parseBalancesMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = readFiniteNumber(v);
    if (n === null) continue;
    const key = k.trim().toLowerCase();
    if (!key) continue;
    out[key] = n;
  }
  return out;
}

function parseDateBalancesSeries(raw: unknown): DateBalancesPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: DateBalancesPoint[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const date = readString(o.date);
    if (!date) continue;
    const balances = parseBalancesMap(o.balances);
    out.push({ date, balances });
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

function parseChain(raw: unknown): AgentWalletChainActivity | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const chainId = readFiniteNumber(o.chain_id);
  const chainName = readString(o.chain_name);
  if (chainId === null || !chainName) return null;
  return {
    chain_id: Math.round(chainId),
    chain_name: chainName,
    nonce_current: readFiniteNumber(o.nonce_current),
    balance_current: readFiniteNumber(o.balance_current),
    wallet_category: readString(o.wallet_category),
    nonce_last_30_days: parseDateValueSeries(o.nonce_last_30_days),
    balance_last_30_days: parseDateValueSeries(o.balance_last_30_days),
  };
}

function parseWallet(raw: unknown): AgentWalletActivityWallet | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const walletAddress =
    readString(o.wallet_address) ?? readString(o.address);
  if (!walletAddress) return null;

  const chainsRaw = Array.isArray(o.chains) ? o.chains : [];
  const chains: AgentWalletChainActivity[] = [];
  for (const c of chainsRaw) {
    const parsed = parseChain(c);
    if (parsed) chains.push(parsed);
  }
  chains.sort((a, b) => a.chain_id - b.chain_id);

  return {
    wallet_address: walletAddress,
    general_nonce_total: readFiniteNumber(o.general_nonce_total),
    general_balance_total: parseBalancesMap(o.general_balance_total),
    general_nonce_last_30_days: parseDateValueSeries(o.general_nonce_last_30_days),
    general_balance_last_30_days: parseDateBalancesSeries(
      o.general_balance_last_30_days,
    ),
    chains,
  };
}

export function parseAgentWalletActivity(raw: unknown): AgentWalletActivity | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const walletsRaw = Array.isArray(o.transactional_wallets)
    ? o.transactional_wallets
    : [];
  const wallets: AgentWalletActivityWallet[] = [];
  for (const w of walletsRaw) {
    const parsed = parseWallet(w);
    if (parsed) wallets.push(parsed);
  }
  wallets.sort((a, b) =>
    a.wallet_address.toLowerCase().localeCompare(b.wallet_address.toLowerCase()),
  );

  return {
    nonce_current: readFiniteNumber(o.nonce_current),
    balance_data: parseBalancesMap(o.balance_data),
    nonce_last_30_days: parseDateValueSeries(o.nonce_last_30_days),
    balance_last_30_days: parseDateBalancesSeries(o.balance_last_30_days),
    transactional_wallets: wallets,
    calculated_at: readString(o.calculated_at),
  };
}

/** Format YYYY-MM-DD → short chart label for locale. */
export function formatActivityDateLabel(date: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date.trim());
  if (!m) return date;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export function buildDailyValueSeries(
  points: DateValuePoint[],
  locale: string,
): DailyChartPoint[] {
  return points.map((p) => ({
    label: formatActivityDateLabel(p.date, locale),
    value: p.value,
  }));
}

export function buildDailyMultiBalanceSeries(
  points: DateBalancesPoint[],
  locale: string,
): { data: MultiSeriesChartPoint[]; seriesKeys: string[] } {
  const keySet = new Set<string>();
  for (const p of points) {
    for (const k of Object.keys(p.balances)) keySet.add(k);
  }
  const seriesKeys = [...keySet].sort((a, b) => a.localeCompare(b));
  const data: MultiSeriesChartPoint[] = points.map((p) => {
    const row: MultiSeriesChartPoint = {
      label: formatActivityDateLabel(p.date, locale),
    };
    for (const k of seriesKeys) {
      const v = p.balances[k];
      if (v !== undefined && Number.isFinite(v)) row[k] = v;
    }
    return row;
  });
  return { data, seriesKeys };
}

/** Stable series key from chain display name. */
export function chainNonceSeriesKey(chainName: string): string {
  return chainName.trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * Multi-series daily nonce from each chain's nonce_last_30_days (for «All chains»).
 */
export function buildDailyMultiNonceFromChains(
  chains: AgentWalletChainActivity[],
  locale: string,
): { data: MultiSeriesChartPoint[]; seriesKeys: string[]; seriesLabels: Record<string, string> } {
  const seriesLabels: Record<string, string> = {};
  const byKey = new Map<string, Map<string, number>>();

  for (const chain of chains) {
    const key = chainNonceSeriesKey(chain.chain_name);
    if (!key) continue;
    seriesLabels[key] = chain.chain_name;
    const dateMap = new Map<string, number>();
    for (const p of chain.nonce_last_30_days) {
      dateMap.set(p.date, p.value);
    }
    byKey.set(key, dateMap);
  }

  const seriesKeys = [...byKey.keys()].sort((a, b) =>
    (seriesLabels[a] ?? a).localeCompare(seriesLabels[b] ?? b),
  );

  const dateSet = new Set<string>();
  for (const m of byKey.values()) {
    for (const d of m.keys()) dateSet.add(d);
  }
  const dates = [...dateSet].sort((a, b) => a.localeCompare(b));

  const data: MultiSeriesChartPoint[] = dates.map((date) => {
    const row: MultiSeriesChartPoint = {
      label: formatActivityDateLabel(date, locale),
    };
    for (const key of seriesKeys) {
      const v = byKey.get(key)?.get(date);
      if (v !== undefined && Number.isFinite(v)) row[key] = v;
    }
    return row;
  });

  return { data, seriesKeys, seriesLabels };
}

export function humanizeChainKey(key: string): string {
  const spaced = key
    .trim()
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatBalanceDisplay(
  value: number | null,
  locale: string,
  symbol?: string | null,
): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  const num = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  }).format(value);
  const sym = typeof symbol === 'string' ? symbol.trim() : '';
  return sym ? `${num} ${sym}` : num;
}
