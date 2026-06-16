export type PublicTop10AgentRow = {
  name: string;
  agent_id: number;
  image_url: string | null;
  description: string | null;
  chain_short_name: string | null;
  index_humi_score: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function positiveInt(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

function coerceScore(raw: unknown): number | null {
  const scoreRaw =
    isRecord(raw) && ('humi_score' in raw || 'index_humi_score' in raw)
      ? raw.humi_score ?? raw.index_humi_score
      : raw;
  const n = typeof scoreRaw === 'number' ? scoreRaw : Number(scoreRaw);
  return Number.isFinite(n) ? n : null;
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

function parseRow(item: unknown): PublicTop10AgentRow | null {
  if (!isRecord(item)) return null;

  const name = typeof item.name === 'string' ? item.name.trim() : '';
  if (!name) return null;

  const agent_id = positiveInt(item.agent_id) ?? positiveInt(item.id);
  if (agent_id == null) return null;

  const index_humi_score = coerceScore(item);
  if (index_humi_score == null) return null;

  const image_url =
    typeof item.image_url === 'string' && item.image_url.trim() ? item.image_url.trim() : null;

  const description =
    typeof item.description === 'string' && item.description.trim()
      ? item.description.trim()
      : null;

  const chain_short_name =
    typeof item.chain_short_name === 'string' && item.chain_short_name.trim()
      ? item.chain_short_name.trim()
      : null;

  return {
    name,
    agent_id,
    image_url,
    description,
    chain_short_name,
    index_humi_score,
  };
}

export function parseTop10AgentsFromMv(raw: unknown): PublicTop10AgentRow[] {
  const normalized = normalizeJsonField(raw);
  if (!Array.isArray(normalized)) return [];

  const rows: PublicTop10AgentRow[] = [];
  for (const item of normalized) {
    const row = parseRow(item);
    if (row) rows.push(row);
  }

  return rows
    .sort((a, b) => b.index_humi_score - a.index_humi_score)
    .slice(0, 10);
}
