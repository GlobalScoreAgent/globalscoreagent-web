import { apiJsonResponse } from '@/lib/api/route-config';
import { requireDashboardUser } from '@/lib/auth/require-dashboard-user';
import { getProfileByUserId } from '@/lib/gsa/profile-preferences';
import {
  createProfileFeedbackForUser,
  fetchActiveFeedbackTypes,
  fetchProfileFeedbacksForUser,
} from '@/lib/gsa/profile-feedbacks';

export const dynamic = 'force-dynamic';

type CreateFeedbackBody = {
  feedback_type_id?: unknown;
  message?: unknown;
};

export async function GET() {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth.response;

  try {
    const [feedbacks, feedbackTypes] = await Promise.all([
      fetchProfileFeedbacksForUser(auth.supabase, auth.user.id),
      fetchActiveFeedbackTypes(auth.supabase),
    ]);

    return apiJsonResponse({
      success: true,
      feedbacks,
      feedbackTypes,
    });
  } catch (err) {
    console.error('[dashboard/feedbacks GET]', err);
    return apiJsonResponse(
      {
        success: false,
        error: err instanceof Error ? err.message : 'feedbacks_fetch_failed',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth.response;

  let body: CreateFeedbackBody = {};
  try {
    const raw = await request.text();
    if (raw) body = JSON.parse(raw) as CreateFeedbackBody;
  } catch {
    return apiJsonResponse({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const feedbackTypeId =
    typeof body.feedback_type_id === 'number'
      ? body.feedback_type_id
      : Number(body.feedback_type_id);
  const message = typeof body.message === 'string' ? body.message : '';

  if (!Number.isFinite(feedbackTypeId) || feedbackTypeId <= 0 || !message.trim()) {
    return apiJsonResponse({ success: false, error: 'Invalid feedback payload' }, { status: 400 });
  }

  try {
    const profile = await getProfileByUserId(auth.supabase, auth.user.id);
    if (!profile) {
      return apiJsonResponse({ success: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const feedback = await createProfileFeedbackForUser(auth.supabase, auth.user.id, {
      feedback_type_id: Math.trunc(feedbackTypeId),
      message,
    });

    return apiJsonResponse({
      success: true,
      feedback,
    });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'feedback_create_failed';
    const status =
      messageText === 'Profile not found'
        ? 404
        : messageText.startsWith('Invalid')
          ? 400
          : 500;

    return apiJsonResponse({ success: false, error: messageText }, { status });
  }
}
