import type { TransactionalWalletRow } from '@/lib/agentTransactionalWallets';
import type { IndexWamiCardData } from '@/lib/indexWami';

function readAddress(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeAddress(value: string): string {
  return value.trim().toLowerCase();
}

function extractAddressFromEntry(entry: unknown): string | null {
  if (!entry || typeof entry !== 'object') return null;
  const o = entry as Record<string, unknown>;
  return readAddress(o.wallet_address) ?? readAddress(o.address);
}

export function listWamiWalletAddresses(data: IndexWamiCardData | null): string[] {
  if (!data) return [];

  const seen = new Set<string>();
  const ordered: string[] = [];

  const add = (addr: string | null) => {
    if (!addr) return;
    const key = normalizeAddress(addr);
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(addr);
  };

  if (Array.isArray(data.wallets)) {
    for (const entry of data.wallets) {
      add(extractAddressFromEntry(entry));
    }
  }

  const arrays = [
    data.wami_score_data,
    data.pillar_origins_legitimacy_summary,
    data.pillar_portfolio_quality_summary,
    data.pillar_activity_behavior_summary,
    data.pillar_multi_chain_presence_maturity_summary,
    data.wami_score_last_30_days,
  ];

  for (const raw of arrays) {
    if (!Array.isArray(raw)) continue;
    for (const entry of raw) {
      add(extractAddressFromEntry(entry));
    }
  }

  return ordered;
}

export function resolveDefaultWalletAddress(data: IndexWamiCardData | null): string | null {
  const list = listWamiWalletAddresses(data);
  return list[0] ?? null;
}

export function getWalletPillarSummaryRaw(
  pillarSummaryArray: unknown,
  walletAddress: string,
): unknown | null {
  if (!walletAddress || !Array.isArray(pillarSummaryArray)) return null;
  const target = normalizeAddress(walletAddress);

  for (const entry of pillarSummaryArray) {
    if (!entry || typeof entry !== 'object') continue;
    const o = entry as Record<string, unknown>;
    const addr = extractAddressFromEntry(o);
    if (!addr || normalizeAddress(addr) !== target) continue;
    return o.summary ?? null;
  }

  return null;
}

export function unwrapWalletSeries(raw: unknown, walletAddress: string): unknown {
  if (!walletAddress || !Array.isArray(raw)) return null;
  const target = normalizeAddress(walletAddress);

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const o = entry as Record<string, unknown>;
    const addr = extractAddressFromEntry(o);
    if (!addr || normalizeAddress(addr) !== target) continue;
    return o.data ?? null;
  }

  return null;
}

export function truncateWalletAddress(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

function readWalletFieldFromArray(
  raw: unknown,
  walletAddress: string,
  field: string,
): unknown | null {
  if (!walletAddress || !Array.isArray(raw)) return null;
  const target = normalizeAddress(walletAddress);

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const o = entry as Record<string, unknown>;
    const addr = extractAddressFromEntry(o);
    if (!addr || normalizeAddress(addr) !== target) continue;
    return o[field] ?? null;
  }

  return null;
}

export function getWalletWamiScore(
  data: IndexWamiCardData | null,
  walletAddress: string,
): number | null {
  const raw = readWalletFieldFromArray(data?.wami_score_data ?? null, walletAddress, 'score');
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function getWalletMaturityLevel(
  data: IndexWamiCardData | null,
  walletAddress: string,
): string | null {
  const raw = readWalletFieldFromArray(
    data?.maturity_level_data ?? null,
    walletAddress,
    'maturity_level',
  );
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

export function buildWamiWalletCarouselRows(data: IndexWamiCardData | null): TransactionalWalletRow[] {
  return listWamiWalletAddresses(data).map((address) => ({
    address,
    wami_score: getWalletWamiScore(data, address),
    wallet_category: null,
    maturity_level: getWalletMaturityLevel(data, address),
  }));
}

export function findWalletIndex(wallets: string[], address: string | null): number {
  if (!address) return 0;
  const target = normalizeAddress(address);
  const idx = wallets.findIndex((w) => normalizeAddress(w) === target);
  return idx >= 0 ? idx : 0;
}
