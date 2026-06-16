import type { SupabaseClient } from '@supabase/supabase-js';

export type DashboardNewsItem = {
  id: number;
  message_es: string;
  message_en: string;
  start_at: string;
  end_at: string;
};

type DashboardNewsRow = {
  id: number;
  message_esp: string;
  message_eng: string;
  start_at: string;
  end_at: string;
};

function positiveInt(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

function mapRowToNewsItem(row: DashboardNewsRow): DashboardNewsItem | null {
  const id = positiveInt(row.id);
  const messageEs =
    typeof row.message_esp === 'string' ? row.message_esp.trim() : '';
  const messageEn =
    typeof row.message_eng === 'string' ? row.message_eng.trim() : '';

  if (
    id == null ||
    !messageEs ||
    !messageEn ||
    typeof row.start_at !== 'string' ||
    typeof row.end_at !== 'string'
  ) {
    return null;
  }

  return {
    id,
    message_es: messageEs,
    message_en: messageEn,
    start_at: row.start_at,
    end_at: row.end_at,
  };
}

export async function fetchActiveDashboardNews(
  supabase: SupabaseClient,
): Promise<DashboardNewsItem[]> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .schema('web_dashboard')
    .from('news')
    .select('id, message_esp, message_eng, start_at, end_at')
    .lte('start_at', nowIso)
    .gte('end_at', nowIso)
    .order('start_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) return [];

  return data
    .map((row) => mapRowToNewsItem(row as DashboardNewsRow))
    .filter((item): item is DashboardNewsItem => item != null);
}
