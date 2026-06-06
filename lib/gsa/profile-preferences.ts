import type { SupabaseClient } from '@supabase/supabase-js';

export type DashboardLanguage = 'es' | 'en';
export type DashboardTheme = 'dark' | 'light';

export type FavoriteAgentPreference = {
  id: string;
  name: string;
};

export type ProfilePreferences = {
  language: DashboardLanguage;
  theme: DashboardTheme;
  agents: FavoriteAgentPreference[];
};

export type ProfileRecord = {
  id: number;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferences: ProfilePreferences;
};

type RawProfileRow = {
  id: number;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferences: unknown;
};

const DEFAULT_PREFERENCES: ProfilePreferences = {
  language: 'es',
  theme: 'dark',
  agents: [],
};

function normalizePreferences(raw: unknown): ProfilePreferences {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PREFERENCES;
  }

  const row = raw as Record<string, unknown>;
  const language = row.language === 'en' ? 'en' : 'es';
  const theme = row.theme === 'light' ? 'light' : 'dark';
  const agents = Array.isArray(row.agents)
    ? row.agents
        .filter(
          (entry): entry is FavoriteAgentPreference =>
            !!entry &&
            typeof entry === 'object' &&
            typeof (entry as FavoriteAgentPreference).id === 'string' &&
            typeof (entry as FavoriteAgentPreference).name === 'string' &&
            (entry as FavoriteAgentPreference).id.trim().length > 0 &&
            (entry as FavoriteAgentPreference).name.trim().length > 0,
        )
        .map((entry) => ({
          id: entry.id.trim(),
          name: entry.name.trim(),
        }))
        .filter(
          (entry, index, arr) => arr.findIndex((item) => item.id === entry.id) === index,
        )
    : [];

  return {
    language,
    theme,
    agents,
  };
}

function mapRowToProfile(row: RawProfileRow): ProfileRecord {
  return {
    id: row.id,
    user_id: row.user_id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    preferences: normalizePreferences(row.preferences),
  };
}

export async function getProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .schema('gsa')
    .from('profiles')
    .select('id, user_id, display_name, avatar_url, preferences')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapRowToProfile(data as RawProfileRow);
}

export async function updateProfilePreferences(
  supabase: SupabaseClient,
  userId: string,
  preferences: ProfilePreferences,
): Promise<ProfileRecord> {
  const { data, error } = await supabase
    .schema('gsa')
    .from('profiles')
    .update({ preferences })
    .eq('user_id', userId)
    .select('id, user_id, display_name, avatar_url, preferences')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToProfile(data as RawProfileRow);
}

export async function updateProfileAccountFields(
  supabase: SupabaseClient,
  userId: string,
  fields: { display_name?: string | null; avatar_url?: string | null },
): Promise<ProfileRecord> {
  const payload: { display_name?: string | null; avatar_url?: string | null } = {};

  if ('display_name' in fields) payload.display_name = fields.display_name ?? null;
  if ('avatar_url' in fields) payload.avatar_url = fields.avatar_url ?? null;

  const { data, error } = await supabase
    .schema('gsa')
    .from('profiles')
    .update(payload)
    .eq('user_id', userId)
    .select('id, user_id, display_name, avatar_url, preferences')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToProfile(data as RawProfileRow);
}
