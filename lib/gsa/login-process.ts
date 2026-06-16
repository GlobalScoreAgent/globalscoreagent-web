import type { SupabaseClient, User } from '@supabase/supabase-js';

export type SubscriptionStatus = 'Active' | 'Disable';

export type LoginProcessResult = {
  profile_id: number;
  login_log_id: number;
  subscription: SubscriptionStatus;
  new_user: boolean;
  message_es: string;
  message_en: string;
};

function positiveInt(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

export type LoginProcessRequest = {
  is_registration?: boolean;
  display_name?: string | null;
  avatar_url?: string | null;
};

function pickDisplayNameFromMetadata(metadata: Record<string, unknown>): string | null {
  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.user_name,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function pickAvatarFromMetadata(metadata: Record<string, unknown>): string | null {
  const candidates = [metadata.avatar_url, metadata.picture];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function resolveLoginProcessParams(
  user: User,
  request?: LoginProcessRequest,
): { displayName: string | null; avatarUrl: string | null } {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const isRegistration = request?.is_registration === true;

  if (!isRegistration) {
    return { displayName: null, avatarUrl: null };
  }

  const displayName =
    (typeof request?.display_name === 'string' && request.display_name.trim()) ||
    pickDisplayNameFromMetadata(metadata) ||
    user.email?.split('@')[0]?.trim() ||
    null;

  const avatarUrl =
    (typeof request?.avatar_url === 'string' && request.avatar_url.trim()) ||
    pickAvatarFromMetadata(metadata) ||
    null;

  return { displayName, avatarUrl };
}

export function parseLoginProcessResult(raw: unknown): LoginProcessResult | null {
  if (!raw || typeof raw !== 'object') return null;

  const row = raw as Record<string, unknown>;
  const profileId = positiveInt(row.profile_id);
  const loginLogId = positiveInt(row.login_log_id);
  const subscription = row.subscription;

  if (
    profileId == null ||
    loginLogId == null ||
    (subscription !== 'Active' && subscription !== 'Disable')
  ) {
    return null;
  }

  return {
    profile_id: profileId,
    login_log_id: loginLogId,
    subscription,
    new_user: row.new_user === true,
    message_es: typeof row.message_es === 'string' ? row.message_es : '',
    message_en: typeof row.message_en === 'string' ? row.message_en : '',
  };
}

export async function callUserLoginProcess(
  supabase: SupabaseClient,
  userId: string,
  displayName: string | null,
  avatarUrl: string | null,
): Promise<LoginProcessResult> {
  const { data, error } = await supabase.schema('gsa').rpc('user_login_process', {
    p_user_id: userId,
    p_display_name: displayName,
    p_avatar_url: avatarUrl,
  });

  if (error) {
    throw new Error(error.message);
  }

  const parsed = parseLoginProcessResult(data);
  if (!parsed) {
    throw new Error('Invalid response from user_login_process');
  }

  return parsed;
}

export async function runLoginProcessForUser(
  supabase: SupabaseClient,
  user: User,
  request?: LoginProcessRequest,
): Promise<LoginProcessResult> {
  const { displayName, avatarUrl } = resolveLoginProcessParams(user, request);
  return callUserLoginProcess(supabase, user.id, displayName, avatarUrl);
}
