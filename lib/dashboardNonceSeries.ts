/**
 * Build 30-day agent nonce series for dashboard charts (aligned with historical page logic).
 */

export type NoncePoint = {
  date: string;
  nonces: number;
  change: string;
};

/** Calendar date in local timezone (matches DB `date` strings, avoids UTC shift from toISOString). */
export function formatLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildNonceDailySeries(agentNonce: unknown): NoncePoint[] {
  if (!agentNonce || !Array.isArray(agentNonce)) return [];

  const rawData = agentNonce as { date: string; total_nonce?: number }[];
  const realDataMap = new Map<string, number>();
  rawData.forEach((item) => {
    realDataMap.set(item.date, item.total_nonce || 0);
  });

  const result: NoncePoint[] = [];
  const today = new Date();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const date = new Date(
      todayLocal.getFullYear(),
      todayLocal.getMonth(),
      todayLocal.getDate() - i,
      12,
      0,
      0,
    );
    const dateStr = formatLocalDateKey(date);

    const nonces = realDataMap.get(dateStr) || 0;
    let change = '0%';

    if (result.length > 0) {
      const prevNonces = result[result.length - 1].nonces;
      if (prevNonces === 0 && nonces > 0) {
        change = '+∞%';
      } else if (prevNonces > 0 && nonces === 0) {
        change = '-100%';
      } else if (prevNonces > 0) {
        const percentChange = ((nonces - prevNonces) / prevNonces) * 100;
        change = (percentChange >= 0 ? '+' : '') + percentChange.toFixed(1) + '%';
      }
    }

    result.push({ date: dateStr, nonces, change });
  }

  return result;
}

/** Latest row from API agent_nonce (by date string), for total badge. */
export function getLatestNonceFromRaw(agentNonce: unknown): { date: string; nonces: number } | null {
  if (!agentNonce || !Array.isArray(agentNonce) || agentNonce.length === 0) return null;

  const rows = agentNonce as { date: string; total_nonce?: number }[];
  let latest = rows[0];
  for (const row of rows) {
    if (row.date > latest.date) latest = row;
  }
  return { date: latest.date, nonces: latest.total_nonce ?? 0 };
}
