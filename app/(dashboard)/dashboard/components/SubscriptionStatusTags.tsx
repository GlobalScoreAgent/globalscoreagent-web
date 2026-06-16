'use client';

import { useEffect, useState } from 'react';
import { useDashboardLogin } from './DashboardLoginContext';
import { useLanguage } from './LanguageContext';
import {
  getPeriodUrgency,
  getUrgencyTagClasses,
} from '@/lib/gsa/subscription-period-urgency';

type SubscriptionSummaryResponse = {
  success: boolean;
  subscription: {
    plan_name: string;
    current_period_start: string;
    current_period_end: string;
  } | null;
};

function formatPeriodDate(iso: string, lang: 'es' | 'en'): string {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(iso));
}

export default function SubscriptionStatusTags() {
  const { profileId, loginReady } = useDashboardLogin();
  const { t, theme, lang } = useLanguage();
  const [summary, setSummary] = useState<SubscriptionSummaryResponse['subscription']>(null);

  useEffect(() => {
    if (!loginReady || profileId == null) {
      setSummary(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/dashboard/subscription-summary', {
          credentials: 'include',
        });
        const data = (await res.json()) as SubscriptionSummaryResponse;

        if (cancelled) return;

        if (res.ok && data.success && data.subscription) {
          setSummary(data.subscription);
        } else {
          setSummary(null);
        }
      } catch {
        if (!cancelled) setSummary(null);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [loginReady, profileId]);

  if (!summary) return null;

  const periodEnd = new Date(summary.current_period_end);
  const urgency = getPeriodUrgency(periodEnd);
  const tagClass = getUrgencyTagClasses(urgency, theme);
  const pillClass = `rounded-xl border px-3 py-1 text-xs font-medium whitespace-nowrap ${tagClass}`;

  const startLabel = formatPeriodDate(summary.current_period_start, lang);
  const endLabel = formatPeriodDate(summary.current_period_end, lang);

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={pillClass}>
        {t.subscriptionTagLabel}: {summary.plan_name}
      </span>
      <span className={pillClass}>
        {startLabel} · {endLabel}
      </span>
    </div>
  );
}
