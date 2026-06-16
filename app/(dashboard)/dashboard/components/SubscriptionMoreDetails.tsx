'use client';

import { pickBilingual } from '@/lib/gsa/dashboard-plan-catalog';
import { SUBSCRIPTION_PRICING_DETAIL_SECTIONS } from '@/lib/gsa/subscription-pricing-details';
import DashboardMarkdown from './DashboardMarkdown';
import { useLanguage } from './LanguageContext';
import DashboardFormSection from './DashboardFormSection';
import { dashboardFormHeadingClass, dashboardFormInsetClass } from './dashboard-ui';

export default function SubscriptionMoreDetails() {
  const { lang, theme, t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <DashboardFormSection
      isDark={isDark}
      title={t.subscriptionsMoreDetailsTitle}
      variant="metadata"
      accentHex="#a855f7"
    >
      <div className="space-y-4">
        {SUBSCRIPTION_PRICING_DETAIL_SECTIONS.map((section, index) => (
          <div key={index} className={`space-y-2 px-4 py-4 ${dashboardFormInsetClass(isDark)}`}>
            <h3 className={`text-base font-semibold md:text-lg ${dashboardFormHeadingClass(isDark)}`}>
              {pickBilingual(section.title, lang)}
            </h3>
            <DashboardMarkdown
              isDark={isDark}
              markdown={pickBilingual(section.bodyMarkdown, lang)}
            />
          </div>
        ))}
      </div>
    </DashboardFormSection>
  );
}
