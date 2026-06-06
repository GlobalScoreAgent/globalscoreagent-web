'use client';

import { SUBSCRIPTION_FAQ_ITEMS, pickBilingual } from '@/lib/gsa/dashboard-plan-catalog';
import { useLanguage } from './LanguageContext';
import DashboardFormSection from './DashboardFormSection';
import {
  dashboardFormBodyClass,
  dashboardFormHeadingClass,
  dashboardFormInsetClass,
} from './dashboard-ui';

export default function SubscriptionFaq() {
  const { lang, theme, t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <DashboardFormSection
      isDark={isDark}
      title={t.subscriptionsFaqTitle}
      variant="metadata"
      accentHex="#a855f7"
    >
      <div className="space-y-3">
        {SUBSCRIPTION_FAQ_ITEMS.map((item, index) => (
          <details
            key={index}
            className={`group px-4 py-3 ${dashboardFormInsetClass(isDark)} open:bg-white/60 dark:open:bg-zinc-950/60`}
          >
            <summary
              className={`cursor-pointer list-none text-sm font-medium marker:content-none md:text-base [&::-webkit-details-marker]:hidden ${dashboardFormHeadingClass(isDark)}`}
            >
              <span className="flex items-center justify-between gap-3">
                {pickBilingual(item.question, lang)}
                <span className="text-violet-400 transition-transform group-open:rotate-45 dark:text-violet-300">
                  +
                </span>
              </span>
            </summary>
            <p className={`mt-3 text-sm leading-relaxed md:text-base ${dashboardFormBodyClass(isDark)}`}>
              {pickBilingual(item.answer, lang)}
            </p>
          </details>
        ))}
      </div>
    </DashboardFormSection>
  );
}
