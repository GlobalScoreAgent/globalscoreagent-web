'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import DashboardFormSection from './DashboardFormSection';
import {
  dashboardFormBodyClass,
  dashboardFormInputClass,
  dashboardFormInsetClass,
  dashboardFormLabelClass,
  dashboardFormMutedClass,
} from './dashboard-ui';
import type { FeedbackType, ProfileFeedback } from '@/lib/gsa/profile-feedbacks';

type FeedbacksApiResponse = {
  success: boolean;
  feedbacks?: ProfileFeedback[];
  feedbackTypes?: FeedbackType[];
  error?: string;
};

type CreateFeedbackApiResponse = {
  success: boolean;
  feedback?: ProfileFeedback;
  error?: string;
};

function formatDateTime(iso: string, lang: 'es' | 'en'): string {
  return new Intl.DateTimeFormat(lang, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export default function FeedbacksView() {
  const { lang, theme, t } = useLanguage();
  const isDark = theme === 'dark';
  const inputClass = dashboardFormInputClass(isDark);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<ProfileFeedback[]>([]);
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);

  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaved, setFormSaved] = useState(false);

  const loadFeedbacks = useCallback(async () => {
    const res = await fetch('/api/dashboard/feedbacks', { credentials: 'include' });
    const data = (await res.json()) as FeedbacksApiResponse;
    if (!res.ok || !data.success) {
      throw new Error(data.error ?? 'feedbacks_fetch_failed');
    }
    setFeedbacks(data.feedbacks ?? []);
    setFeedbackTypes(data.feedbackTypes ?? []);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await loadFeedbacks();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'feedbacks_fetch_failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadFeedbacks]);

  const onSave = async () => {
    setFormSaved(false);
    setFormError(null);

    const feedbackTypeId = Number(selectedTypeId);
    const trimmedMessage = message.trim();

    if (!Number.isFinite(feedbackTypeId) || feedbackTypeId <= 0 || !trimmedMessage) {
      setFormError(t.feedbacksInvalidForm);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/feedbacks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type_id: feedbackTypeId,
          message: trimmedMessage,
        }),
      });
      const data = (await res.json()) as CreateFeedbackApiResponse;

      if (!res.ok || !data.success || !data.feedback) {
        throw new Error(data.error ?? 'feedback_create_failed');
      }

      setFeedbacks((prev) => [data.feedback!, ...prev]);
      setMessage('');
      setSelectedTypeId('');
      setFormSaved(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'feedback_create_failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>{t.feedbacksLoading}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DashboardFormSection
        isDark={isDark}
        title={t.feedbacksHistoryTitle}
        variant="metadata"
        accentHex="#0ea5e9"
      >
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!error && feedbacks.length === 0 ? (
          <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>{t.feedbacksEmpty}</p>
        ) : (
          <div className="space-y-2">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className={`space-y-2 px-3 py-3 ${dashboardFormInsetClass(isDark)}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className={`text-sm font-medium ${dashboardFormBodyClass(isDark)}`}>
                    {feedback.feedback_type_name}
                  </p>
                  <p className={`text-xs ${dashboardFormMutedClass(isDark)}`}>
                    {formatDateTime(feedback.register_at, lang)}
                  </p>
                </div>
                <p className={`text-sm ${dashboardFormBodyClass(isDark)}`}>{feedback.message}</p>
                {feedback.gsa_message && (
                  <div>
                    <p className={`text-xs font-medium ${dashboardFormMutedClass(isDark)}`}>
                      {t.feedbacksGsaReply}
                    </p>
                    <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>
                      {feedback.gsa_message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardFormSection>

      <DashboardFormSection
        isDark={isDark}
        title={t.feedbacksNewTitle}
        variant="profiles"
        accentHex="#22c55e"
      >
        <div className="space-y-3">
          <div>
            <label className={`mb-1 block text-xs ${dashboardFormLabelClass(isDark)}`}>
              {t.feedbacksType}
            </label>
            <select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              className={inputClass}
              disabled={saving || feedbackTypes.length === 0}
            >
              <option value="">{t.feedbacksTypePlaceholder}</option>
              {feedbackTypes.map((type) => (
                <option key={type.id} value={String(type.id)}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`mb-1 block text-xs ${dashboardFormLabelClass(isDark)}`}>
              {t.feedbacksMessage}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.feedbacksMessagePlaceholder}
              rows={4}
              className={`${inputClass} resize-y min-h-[6rem]`}
              disabled={saving}
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          {formSaved && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{t.feedbacksSaved}</p>
          )}
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving || feedbackTypes.length === 0}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              isDark
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60'
                : 'bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-60'
            }`}
          >
            {saving ? t.feedbacksSaving : t.feedbacksSave}
          </button>
        </div>
      </DashboardFormSection>
    </div>
  );
}
