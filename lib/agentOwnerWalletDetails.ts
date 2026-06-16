export type OwnerWalletType = 'active' | 'holder';

export type OwnerWalletDetailRow = {
  chain_name: string;
  owner_wallet_type: OwnerWalletType;
  owner_first_activity_at: string;
};

function parseWalletType(raw: unknown): OwnerWalletType | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  if (s === 'active') return 'active';
  if (s === 'holder') return 'holder';
  return null;
}

function parseEntry(raw: unknown): OwnerWalletDetailRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const chainName =
    typeof o.chain_name === 'string' ? o.chain_name.trim() : '';
  if (!chainName) return null;

  const walletType = parseWalletType(o.owner_wallet_type);
  if (!walletType) return null;

  const activityAt =
    typeof o.owner_first_activity_at === 'string'
      ? o.owner_first_activity_at.trim()
      : '';
  if (!activityAt) return null;

  const parsed = new Date(activityAt);
  if (Number.isNaN(parsed.getTime())) return null;

  return {
    chain_name: chainName,
    owner_wallet_type: walletType,
    owner_first_activity_at: activityAt,
  };
}

export function parseOwnerWalletDetails(raw: unknown): OwnerWalletDetailRow[] {
  if (!Array.isArray(raw)) return [];

  const rows: OwnerWalletDetailRow[] = [];
  for (const item of raw) {
    const entry = parseEntry(item);
    if (entry) rows.push(entry);
  }

  return rows.sort((a, b) =>
    a.chain_name.localeCompare(b.chain_name, undefined, { sensitivity: 'base' }),
  );
}
