import type { SupabaseClient } from '@supabase/supabase-js';
import { getProfileIdByUserId } from '@/lib/gsa/subscription-summary';

export type FeedbackType = {
  id: number;
  name: string;
};

export type ProfileFeedback = {
  id: number;
  feedback_type_id: number;
  feedback_type_name: string;
  message: string;
  register_at: string;
  gsa_message: string | null;
};

type FeedbackTypeEmbed = {
  name: string;
};

type ProfileFeedbackRow = {
  id: number;
  feedback_type_id: number;
  message: string;
  register_at: string;
  gsa_message: string | null;
  feedback_types: FeedbackTypeEmbed | FeedbackTypeEmbed[] | null;
};

const FEEDBACK_SELECT =
  'id, feedback_type_id, message, register_at, gsa_message, feedback_types(name)';

function positiveInt(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

function extractFeedbackTypeName(
  field: ProfileFeedbackRow['feedback_types'],
): string | null {
  if (!field) return null;
  const row = Array.isArray(field) ? field[0] : field;
  return typeof row?.name === 'string' && row.name.trim() ? row.name.trim() : null;
}

function mapRowToFeedback(row: ProfileFeedbackRow): ProfileFeedback | null {
  const id = positiveInt(row.id);
  const feedbackTypeId = positiveInt(row.feedback_type_id);
  const feedbackTypeName = extractFeedbackTypeName(row.feedback_types);

  if (
    id == null ||
    feedbackTypeId == null ||
    !feedbackTypeName ||
    typeof row.message !== 'string' ||
    !row.message.trim() ||
    typeof row.register_at !== 'string'
  ) {
    return null;
  }

  return {
    id,
    feedback_type_id: feedbackTypeId,
    feedback_type_name: feedbackTypeName,
    message: row.message.trim(),
    register_at: row.register_at,
    gsa_message:
      typeof row.gsa_message === 'string' && row.gsa_message.trim()
        ? row.gsa_message.trim()
        : null,
  };
}

export async function fetchActiveFeedbackTypes(
  supabase: SupabaseClient,
): Promise<FeedbackType[]> {
  const { data, error } = await supabase
    .schema('gsa')
    .from('feedback_types')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) return [];

  return data
    .map((row) => {
      const id = positiveInt((row as { id: unknown }).id);
      const name =
        typeof (row as { name: unknown }).name === 'string'
          ? (row as { name: string }).name.trim()
          : '';
      if (id == null || !name) return null;
      return { id, name };
    })
    .filter((type): type is FeedbackType => type != null);
}

export async function fetchProfileFeedbacksForProfile(
  supabase: SupabaseClient,
  profileId: number,
): Promise<ProfileFeedback[]> {
  const { data, error } = await supabase
    .schema('gsa')
    .from('feedbacks')
    .select(FEEDBACK_SELECT)
    .eq('profile_id', profileId)
    .order('register_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) return [];

  return data
    .map((row) => mapRowToFeedback(row as ProfileFeedbackRow))
    .filter((feedback): feedback is ProfileFeedback => feedback != null);
}

export async function fetchProfileFeedbacksForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileFeedback[]> {
  const profileId = await getProfileIdByUserId(supabase, userId);
  if (profileId == null) return [];
  return fetchProfileFeedbacksForProfile(supabase, profileId);
}

export async function isActiveFeedbackType(
  supabase: SupabaseClient,
  feedbackTypeId: number,
): Promise<boolean> {
  const { data, error } = await supabase
    .schema('gsa')
    .from('feedback_types')
    .select('id')
    .eq('id', feedbackTypeId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id != null;
}

export type CreateProfileFeedbackInput = {
  feedback_type_id: number;
  message: string;
};

export async function createProfileFeedback(
  supabase: SupabaseClient,
  profileId: number,
  input: CreateProfileFeedbackInput,
): Promise<ProfileFeedback> {
  const feedbackTypeId = positiveInt(input.feedback_type_id);
  const message = typeof input.message === 'string' ? input.message.trim() : '';

  if (feedbackTypeId == null) {
    throw new Error('Invalid feedback_type_id');
  }

  if (!message) {
    throw new Error('Invalid message');
  }

  const typeActive = await isActiveFeedbackType(supabase, feedbackTypeId);
  if (!typeActive) {
    throw new Error('Invalid feedback_type_id');
  }

  const { data, error } = await supabase
    .schema('gsa')
    .from('feedbacks')
    .insert({
      profile_id: profileId,
      feedback_type_id: feedbackTypeId,
      message,
      register_at: new Date().toISOString(),
      gsa_message: null,
    })
    .select(FEEDBACK_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const feedback = mapRowToFeedback(data as ProfileFeedbackRow);
  if (!feedback) {
    throw new Error('Invalid response from feedbacks insert');
  }

  return feedback;
}

export async function createProfileFeedbackForUser(
  supabase: SupabaseClient,
  userId: string,
  input: CreateProfileFeedbackInput,
): Promise<ProfileFeedback> {
  const profileId = await getProfileIdByUserId(supabase, userId);
  if (profileId == null) {
    throw new Error('Profile not found');
  }

  return createProfileFeedback(supabase, profileId, input);
}
