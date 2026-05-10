/**
 * Build 30-day agent nonce series for dashboard charts (aligned with historical page logic).
 */

export type NoncePoint = {
  date: string;
  nonces: number;
  change: string;
};

export function buildNonceDailySeries(agentNonce: unknown): NoncePoint[] {
  if (!agentNonce || !Array.isArray(agentNonce)) return [];

  const rawData = agentNonce as { date: string; total_nonce?: number }[];
  const realDataMap = new Map<string, number>();
  rawData.forEach((item) => {
    realDataMap.set(item.date, item.total_nonce || 0);
  });

  const result: NoncePoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0] ?? '';

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
