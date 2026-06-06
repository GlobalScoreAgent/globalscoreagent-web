'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { getPeriodUrgency } from '@/lib/gsa/subscription-period-urgency';
import type { RegistrationSource } from '@/lib/gsa/dashboard-plan-catalog';
import DashboardFormSection from './DashboardFormSection';
import SubscriptionPlanCards from './SubscriptionPlanCards';
import SubscriptionFaq from './SubscriptionFaq';
import {
  dashboardFormBodyClass,
  dashboardFormHeadingClass,
  dashboardFormMutedClass,
  urgencyAccentHex,
} from './dashboard-ui';

type SubscriptionRecord = {
  id: number;
  plan_name: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  metadata_payment?: Record<string, unknown>;
  registration_source?: RegistrationSource | null;
};

type SubscriptionsApiResponse = {
  success: boolean;
  active: SubscriptionRecord | null;
  history: SubscriptionRecord[];
  registration_source: RegistrationSource | null;
  error?: string;
};

function formatDate(iso: string | null, lang: 'es' | 'en'): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(iso));
}

export default function SubscriptionsView() {
  const { lang, theme, t } = useLanguage();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<SubscriptionRecord | null>(null);
  const [history, setHistory] = useState<SubscriptionRecord[]>([]);
  const [registrationSource, setRegistrationSource] = useState<RegistrationSource | null>(
    null,
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/dashboard/subscriptions', { credentials: 'include' });
        const data = (await res.json()) as SubscriptionsApiResponse;
        if (!res.ok || !data.success) {
          throw new Error(data.error ?? 'subscriptions_fetch_failed');
        }
        setActive(data.active);
        setHistory(data.history);
        setRegistrationSource(data.registration_source ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'subscriptions_fetch_failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeAccentHex = useMemo(() => {
    if (!active?.current_period_end) return '#71717a';
    const urgency = getPeriodUrgency(new Date(active.current_period_end));
    return urgencyAccentHex(urgency);
  }, [active]);

  const thClass = `px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${dashboardFormMutedClass(isDark)}`;
  const tdClass = `px-3 py-2 text-sm ${dashboardFormBodyClass(isDark)}`;

  if (loading) {
    return <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>{t.subscriptionsLoading}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className={`text-2xl font-semibold ${dashboardFormHeadingClass(isDark)}`}>
        {t.subscriptionsPageTitle}
      </h1>

      <DashboardFormSection
        isDark={isDark}
        title={t.subscriptionsActiveTitle}
        variant="transactional"
        accentHex={activeAccentHex}
      >
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        {!active ? (
          <p className={`text-sm ${dashboardFormBodyClass(isDark)}`}>{t.subscriptionsNoActive}</p>
        ) : (
          <div className="space-y-2">
            <p className={`text-xl font-semibold ${dashboardFormHeadingClass(isDark)}`}>
              {active.plan_name}
            </p>
            <p className={`text-sm ${dashboardFormBodyClass(isDark)}`}>
              {t.subscriptionPeriodStart}: {formatDate(active.current_period_start, lang)}
              {' · '}
              {t.subscriptionPeriodEnd}: {formatDate(active.current_period_end, lang)}
            </p>
          </div>
        )}
      </DashboardFormSection>

      <DashboardFormSection
        isDark={isDark}
        title={t.subscriptionsHistoryTitle}
        variant="transactional"
        accentHex="#38bdf8"
      >
        {history.length === 0 ? (
          <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>{t.subscriptionsNoHistory}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr
                  className={
                    isDark ? 'border-b border-zinc-700/60' : 'border-b border-zinc-300/70'
                  }
                >
                  <th className={thClass}>{t.subscriptionsPlanColumn}</th>
                  <th className={thClass}>{t.subscriptionsStatusColumn}</th>
                  <th className={thClass}>{t.subscriptionsPeriodStartColumn}</th>
                  <th className={thClass}>{t.subscriptionsPeriodEndColumn}</th>
                  <th className={thClass}>{t.subscriptionsCreatedColumn}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const isActiveRow = active?.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      className={
                        isDark
                          ? `border-b border-zinc-800/80 ${isActiveRow ? 'bg-emerald-500/10' : ''}`
                          : `border-b border-zinc-200/80 ${isActiveRow ? 'bg-emerald-500/5' : ''}`
                      }
                    >
                      <td className={tdClass}>
                        <span className="inline-flex items-center gap-2">
                          {row.plan_name}
                          {isActiveRow && (
                            <span className="rounded-md bg-emerald-600/15 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              {t.subscriptionsActiveBadge}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className={tdClass}>{row.status}</td>
                      <td className={tdClass}>
                        {formatDate(row.current_period_start, lang)}
                      </td>
                      <td className={tdClass}>
                        {formatDate(row.current_period_end, lang)}
                      </td>
                      <td className={tdClass}>{formatDate(row.created_at, lang)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardFormSection>

      <SubscriptionPlanCards registrationSource={registrationSource} />

      <SubscriptionFaq />
    </div>
  );
}
