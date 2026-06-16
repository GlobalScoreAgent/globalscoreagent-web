'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import DashboardFormSection from './DashboardFormSection';
import {
  dashboardFormBodyClass,
  dashboardFormInsetClass,
  dashboardFormMutedClass,
} from './dashboard-ui';
import type { ProfileApiCredit } from '@/lib/gsa/profile-api-credits';

type ApiCreditsResponse = {
  success: boolean;
  credits?: ProfileApiCredit[];
  error?: string;
};

function formatDate(iso: string | null, lang: 'es' | 'en'): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(iso));
}

export default function ApiCreditsView() {
  const { lang, theme, t } = useLanguage();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<ProfileApiCredit[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/dashboard/api-credits', { credentials: 'include' });
        const data = (await res.json()) as ApiCreditsResponse;
        if (!res.ok || !data.success) {
          throw new Error(data.error ?? 'api_credits_fetch_failed');
        }
        setCredits(data.credits ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'api_credits_fetch_failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>{t.apiCreditsLoading}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DashboardFormSection
        isDark={isDark}
        title={t.apiCreditsTitle}
        variant="metadata"
        accentHex="#0ea5e9"
      >
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!error && credits.length === 0 ? (
          <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>{t.apiCreditsEmpty}</p>
        ) : (
          <div className="space-y-2">
            {credits.map((credit) => (
              <div
                key={credit.id}
                className={`space-y-1 px-3 py-3 ${dashboardFormInsetClass(isDark)}`}
              >
                <p className={`text-sm font-medium ${dashboardFormBodyClass(isDark)}`}>
                  {credit.credit_type_name}
                </p>
                {credit.credit_type_description && (
                  <p className={`text-xs ${dashboardFormMutedClass(isDark)}`}>
                    {credit.credit_type_description}
                  </p>
                )}
                <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                  <div>
                    <dt className={dashboardFormMutedClass(isDark)}>{t.apiCreditsAmount}</dt>
                    <dd className={dashboardFormBodyClass(isDark)}>
                      {credit.amount_credits_available.toLocaleString(lang)}
                    </dd>
                  </div>
                  <div>
                    <dt className={dashboardFormMutedClass(isDark)}>{t.apiCreditsValidFrom}</dt>
                    <dd className={dashboardFormBodyClass(isDark)}>
                      {formatDate(credit.valid_from, lang)}
                    </dd>
                  </div>
                  <div>
                    <dt className={dashboardFormMutedClass(isDark)}>{t.apiCreditsValidTo}</dt>
                    <dd className={dashboardFormBodyClass(isDark)}>
                      {formatDate(credit.valid_to, lang)}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </DashboardFormSection>
    </div>
  );
}
