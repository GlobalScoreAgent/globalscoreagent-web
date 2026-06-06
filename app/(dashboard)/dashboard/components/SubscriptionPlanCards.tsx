'use client';

import {
  DASHBOARD_PLANS,
  pickBilingual,
  type RegistrationSource,
} from '@/lib/gsa/dashboard-plan-catalog';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { cn } from '@/lib/utils';
import { useLanguage } from './LanguageContext';
import DashboardFormSection from './DashboardFormSection';
import {
  dashboardDisabledPrimaryButtonClass,
  dashboardSmallAccentBadgeClass,
  dashboardFormBodyClass,
  dashboardFormHeadingClass,
  dashboardFormLabelClass,
  dashboardFormMutedClass,
} from './dashboard-ui';

type Props = {
  registrationSource: RegistrationSource | null;
};

const PLAN_ACCENT = '#facc15';

export default function SubscriptionPlanCards({ registrationSource }: Props) {
  const { lang, theme, t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <DashboardFormSection
      isDark={isDark}
      title={t.subscriptionsAvailablePlansTitle}
      variant="profiles"
      accentHex={PLAN_ACCENT}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {DASHBOARD_PLANS.map((plan) => {
          const isSelected = registrationSource === plan.source;
          const isSoon = plan.comingSoon === true;

          return (
            <AgentDetailCard
              key={plan.source}
              isDark={isDark}
              variant="profiles"
              accentHex={PLAN_ACCENT}
              className={cn(
                'flex h-full flex-col',
                isSelected && 'ring-2 ring-emerald-500/60',
                isSoon && !isSelected && 'opacity-90',
              )}
              contentClassName="flex flex-1 flex-col gap-3 p-4 pt-12 sm:p-4 sm:pt-12"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-lg font-semibold ${dashboardFormHeadingClass(isDark)}`}>
                  {pickBilingual(plan.name, lang)}
                </h3>
                {isSoon ? (
                  <span className={dashboardSmallAccentBadgeClass(isDark, '#eab308')}>
                    {t.subscriptionsSoonBadge}
                  </span>
                ) : null}
                {isSelected ? (
                  <span className="rounded-md bg-emerald-600/15 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    {t.subscriptionsCurrentPlan}
                  </span>
                ) : null}
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className={dashboardFormLabelClass(isDark)}>{t.subscriptionsMonthlyLabel}</dt>
                  <dd className={`font-medium ${dashboardFormHeadingClass(isDark)}`}>
                    {plan.monthlyPrice}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className={dashboardFormLabelClass(isDark)}>{t.subscriptionsAnnualLabel}</dt>
                  <dd className={`font-medium ${dashboardFormHeadingClass(isDark)}`}>
                    {plan.annualPrice}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className={dashboardFormLabelClass(isDark)}>{t.subscriptionsSavingsLabel}</dt>
                  <dd className={`font-medium ${dashboardFormHeadingClass(isDark)}`}>
                    {plan.savings}
                  </dd>
                </div>
              </dl>

              <p className={`flex-1 text-sm leading-relaxed ${dashboardFormBodyClass(isDark)}`}>
                <span
                  className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${dashboardFormMutedClass(isDark)}`}
                >
                  {t.subscriptionsIncludesLabel}
                </span>
                {pickBilingual(plan.includes, lang)}
              </p>

              <button
                type="button"
                disabled
                aria-disabled="true"
                className={dashboardDisabledPrimaryButtonClass(isDark)}
              >
                {t.subscriptionsSubscribe}
              </button>
            </AgentDetailCard>
          );
        })}
      </div>
    </DashboardFormSection>
  );
}
