export type TransactionalWalletRow = {
  address: string;
  wami_score: number | null;
  wallet_category: string | null;
};

export function normalizeWalletAddress(address: string): string {
  let s = address.trim().toLowerCase();
  if (/^0x[0-9a-f]{40}$/.test(s)) return s;
  if (/^[0-9a-f]{40}$/.test(s)) return `0x${s}`;
  return s;
}

function parseCategoryEntries(raw: unknown): Map<string, string> {
  const map = new Map<string, string>();
  if (!Array.isArray(raw)) return map;
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const address = typeof o.address === 'string' ? o.address.trim() : '';
    const category =
      typeof o.wallet_category === 'string' ? o.wallet_category.trim() : '';
    if (!address || !category) continue;
    map.set(normalizeWalletAddress(address), category);
  }
  return map;
}

export function humanizeWalletCategory(rawKey: string): string {
  const spaced = rawKey
    .trim()
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return spaced
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function wamiScoreRank(score: number | null): number {
  return score ?? -1;
}

function shouldReplaceRow(
  existing: TransactionalWalletRow,
  incoming: TransactionalWalletRow,
): boolean {
  return wamiScoreRank(incoming.wami_score) > wamiScoreRank(existing.wami_score);
}

export function parseTransactionalWallets(
  wamiRaw: unknown,
  categoryRaw: unknown,
): TransactionalWalletRow[] {
  const categoryMap = parseCategoryEntries(categoryRaw);
  const byKey = new Map<string, TransactionalWalletRow>();

  if (!Array.isArray(wamiRaw)) return [];

  for (const item of wamiRaw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const address = typeof o.address === 'string' ? o.address.trim() : '';
    if (!address) continue;

    const n = Number(o.wami_score);
    const wami_score = Number.isFinite(n) ? n : null;
    const key = normalizeWalletAddress(address);
    const row: TransactionalWalletRow = {
      address,
      wami_score,
      wallet_category: categoryMap.get(key) ?? null,
    };

    const existing = byKey.get(key);
    if (!existing || shouldReplaceRow(existing, row)) {
      byKey.set(key, row);
    }
  }

  const rows = [...byKey.values()];
  rows.sort((a, b) => {
    const sa = a.wami_score ?? -1;
    const sb = b.wami_score ?? -1;
    if (sb !== sa) return sb - sa;
    return a.address.localeCompare(b.address);
  });

  return rows;
}
