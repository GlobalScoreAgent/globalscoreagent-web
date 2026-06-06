import { apiJsonResponse } from '@/lib/api/route-config';
import { requireDashboardUser } from '@/lib/auth/require-dashboard-user';
import {
  type FavoriteAgentPreference,
  getProfileByUserId,
  updateProfileAccountFields,
  updateProfilePreferences,
  type ProfilePreferences,
} from '@/lib/gsa/profile-preferences';

export const dynamic = 'force-dynamic';

type ProfilePatchBody = {
  display_name?: string | null;
  avatar_url?: string | null;
  preferences?: Partial<ProfilePreferences>;
};

function normalizePreferences(input: Partial<ProfilePreferences> | undefined): ProfilePreferences {
  return {
    language: input?.language === 'en' ? 'en' : 'es',
    theme: input?.theme === 'light' ? 'light' : 'dark',
    agents: Array.isArray(input?.agents)
      ? input.agents
          .filter(
            (entry): entry is FavoriteAgentPreference =>
              !!entry &&
              typeof entry === 'object' &&
              typeof (entry as FavoriteAgentPreference).id === 'string' &&
              typeof (entry as FavoriteAgentPreference).name === 'string',
          )
          .map((entry) => ({ id: entry.id.trim(), name: entry.name.trim() }))
          .filter((entry) => entry.id.length > 0 && entry.name.length > 0)
          .filter(
            (entry, index, arr) => arr.findIndex((item) => item.id === entry.id) === index,
          )
      : [],
  };
}

function isOAuthProvider(provider: unknown): boolean {
  return provider === 'google' || provider === 'github';
}

export async function GET() {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth.response;

  try {
    const profile = await getProfileByUserId(auth.supabase, auth.user.id);
    if (!profile) {
      return apiJsonResponse({ success: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const provider = auth.user.app_metadata?.provider;

    return apiJsonResponse({
      success: true,
      provider,
      oauth_locked: isOAuthProvider(provider),
      profile: {
        display_name: profile.display_name ?? '',
        avatar_url: profile.avatar_url ?? '',
        preferences: profile.preferences,
      },
    });
  } catch (err) {
    return apiJsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'profile_fetch_failed' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth.response;

  let body: ProfilePatchBody = {};
  try {
    const raw = await request.text();
    if (raw) body = JSON.parse(raw) as ProfilePatchBody;
  } catch {
    return apiJsonResponse({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const provider = auth.user.app_metadata?.provider;
    const oauthLocked = isOAuthProvider(provider);
    const currentProfile = await getProfileByUserId(auth.supabase, auth.user.id);
    if (!currentProfile) {
      return apiJsonResponse({ success: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    if (!oauthLocked && ('display_name' in body || 'avatar_url' in body)) {
      await updateProfileAccountFields(auth.supabase, auth.user.id, {
        display_name: body.display_name ?? null,
        avatar_url: body.avatar_url ?? null,
      });
    }

    const mergedPreferences = {
      language: body.preferences?.language ?? currentProfile.preferences.language,
      theme: body.preferences?.theme ?? currentProfile.preferences.theme,
      agents: body.preferences?.agents ?? currentProfile.preferences.agents,
    };
    const preferences = normalizePreferences(mergedPreferences);
    const profile = await updateProfilePreferences(auth.supabase, auth.user.id, preferences);

    return apiJsonResponse({
      success: true,
      provider,
      oauth_locked: oauthLocked,
      profile: {
        display_name: profile.display_name ?? '',
        avatar_url: profile.avatar_url ?? '',
        preferences: profile.preferences,
      },
    });
  } catch (err) {
    return apiJsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'profile_update_failed' },
      { status: 500 },
    );
  }
}
