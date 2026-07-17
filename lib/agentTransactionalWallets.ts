export type TransactionalWalletRow = {
  address: string;
  wami_score: number | null;
  wallet_category: string | null;
  maturity_level?: string | null;
};

export function normalizeWalletAddress(address: string): string {
  let s = address.trim().toLowerCase();
  if (/^0x[0-9a-f]{40}$/.test(s)) return s;
  if (/^[0-9a-f]{40}$/.test(s)) return `0x${s}`;
  return s;
}

function readWalletAddress(o: Record<string, unknown>): string {
  const raw = o.address ?? o.wallet_address;
  return typeof raw === 'string' ? raw.trim() : '';
}

function readWamiScore(o: Record<string, unknown>): number | null {
  const raw = o.wami_score ?? o.score;
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

function readWalletCategory(o: Record<string, unknown>): string | null {
  const raw = o.wallet_category;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

function parseCategoryEntries(raw: unknown): Map<string, string> {
  const map = new Map<string, string>();
  if (!Array.isArray(raw)) return map;
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const address = readWalletAddress(o);
    const category = readWalletCategory(o);
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

function mergeRow(
  byKey: Map<string, TransactionalWalletRow>,
  incoming: TransactionalWalletRow,
): void {
  const key = normalizeWalletAddress(incoming.address);
  const existing = byKey.get(key);
  if (!existing) {
    byKey.set(key, incoming);
    return;
  }

  const merged: TransactionalWalletRow = {
    address: existing.address,
    wami_score:
      shouldReplaceRow(existing, incoming) ? incoming.wami_score : existing.wami_score,
    wallet_category: incoming.wallet_category ?? existing.wallet_category,
  };

  if (
    shouldReplaceRow(existing, incoming) ||
    (merged.wallet_category && !existing.wallet_category)
  ) {
    byKey.set(key, merged);
  }
}

export function parseTransactionalWallets(
  wamiRaw: unknown,
  categoryRaw: unknown,
): TransactionalWalletRow[] {
  const categoryMap = parseCategoryEntries(categoryRaw);
  const byKey = new Map<string, TransactionalWalletRow>();

  if (Array.isArray(wamiRaw)) {
    for (const item of wamiRaw) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const address = readWalletAddress(o);
      if (!address) continue;

      const key = normalizeWalletAddress(address);
      mergeRow(byKey, {
        address,
        wami_score: readWamiScore(o),
        wallet_category: categoryMap.get(key) ?? null,
      });
    }
  }

  if (Array.isArray(categoryRaw)) {
    for (const item of categoryRaw) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const address = readWalletAddress(o);
      if (!address) continue;

      const key = normalizeWalletAddress(address);
      const category = readWalletCategory(o) ?? categoryMap.get(key) ?? null;
      const existing = byKey.get(key);

      mergeRow(byKey, {
        address,
        wami_score: existing?.wami_score ?? null,
        wallet_category: category,
      });
    }
  }

  const rows = Array.from(byKey.values());
  rows.sort((a, b) => {
    const sa = a.wami_score ?? -1;
    const sb = b.wami_score ?? -1;
    if (sb !== sa) return sb - sa;
    return a.address.localeCompare(b.address);
  });

  return rows;
}
