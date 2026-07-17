/**
 * Build agent nonce series for dashboard charts from BD rows (no fixed 30-day zero-fill).
 */

export type NoncePoint = {
  date: string;
  nonces: number | null;
  change: string;
};

/** Calendar date in local timezone (matches DB `date` strings, avoids UTC shift from toISOString). */
export function formatLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateKeyLocal(dateKey: string): Date | null {
  const [y, m, d] = dateKey.split('-').map((part) => Number(part));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Series from first BD date → last BD date.
 * Calendar gaps between min/max get `nonces: null` (chart line breaks; no drop to 0).
 */
export function buildNonceDailySeries(agentNonce: unknown): NoncePoint[] {
  if (!agentNonce || !Array.isArray(agentNonce)) return [];

  const realDataMap = new Map<string, number>();
  for (const item of agentNonce as { date?: unknown; total_nonce?: unknown }[]) {
    if (!item || typeof item.date !== 'string' || !item.date.trim()) continue;
    const dateKey = item.date.trim();
    const raw = item.total_nonce;
    const value = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(value)) continue;
    realDataMap.set(dateKey, value);
  }

  if (realDataMap.size === 0) return [];

  const sortedDates = [...realDataMap.keys()].sort((a, b) => a.localeCompare(b));
  const startKey = sortedDates[0];
  const endKey = sortedDates[sortedDates.length - 1];
  const start = parseDateKeyLocal(startKey);
  const end = parseDateKeyLocal(endKey);
  if (!start || !end) return [];

  const result: NoncePoint[] = [];
  let prevNonNull: number | null = null;
  const cursor = new Date(start);

  while (cursor.getTime() <= end.getTime()) {
    const dateStr = formatLocalDateKey(cursor);
    const hasValue = realDataMap.has(dateStr);
    const nonces = hasValue ? (realDataMap.get(dateStr) as number) : null;

    let change = '0%';
    if (nonces != null && prevNonNull != null) {
      if (prevNonNull === 0 && nonces > 0) {
        change = '+∞%';
      } else if (prevNonNull > 0 && nonces === 0) {
        change = '-100%';
      } else if (prevNonNull > 0) {
        const percentChange = ((nonces - prevNonNull) / prevNonNull) * 100;
        change = (percentChange >= 0 ? '+' : '') + percentChange.toFixed(1) + '%';
      }
    }

    result.push({ date: dateStr, nonces, change });
    if (nonces != null) prevNonNull = nonces;

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

/** Latest row from API agent_nonce (by date string), for total badge. */
export function getLatestNonceFromRaw(agentNonce: unknown): { date: string; nonces: number } | null {
  if (!agentNonce || !Array.isArray(agentNonce) || agentNonce.length === 0) return null;

  const rows = agentNonce as { date: string; total_nonce?: number }[];
  let latest: { date: string; total_nonce?: number } | null = null;
  for (const row of rows) {
    if (!row?.date) continue;
    const value = typeof row.total_nonce === 'number' ? row.total_nonce : Number(row.total_nonce);
    if (!Number.isFinite(value)) continue;
    if (!latest || row.date > latest.date) latest = row;
  }
  if (!latest) return null;
  return { date: latest.date, nonces: Number(latest.total_nonce) || 0 };
}
