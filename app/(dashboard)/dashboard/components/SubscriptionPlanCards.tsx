'use client';

import { useState } from 'react';
import {
  dashboardDisabledPrimaryButtonClass,
  dashboardPrimaryButtonClass,
} from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { invokeSubscriptionNowPaymentCreation, formatNowPaymentCreationError } from '@/lib/gsa/subscription-nowpayment-creation';
import { cn } from '@/lib/utils';
import {
  isFreePlanName,
  planNamesMatch,
} from '@/lib/gsa/subscriptions';
import type { DashboardSubscriptionType } from '@/lib/gsa/subscription-dashboard-types';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from './LanguageContext';
import DashboardFormSection from './DashboardFormSection';
import {
  dashboardFormBodyClass,
  dashboardFormHeadingClass,
  dashboardFormLabelClass,
  dashboardFormMutedClass,
  dashboardSmallAccentBadgeClass,
} from './dashboard-ui';

type Props = {
  activePlanName: string | null;
  activeSubscriptionId: number | null;
  plans: DashboardSubscriptionType[];
};

const PLAN_ACCENT = '#facc15';

function formatPrice(price: number, lang: 'es' | 'en'): string {
  return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDiscount(percentage: number, lang: 'es' | 'en'): string {
  const value = Math.round(percentage);
  return lang === 'es' ? `${value}% de descuento` : `${value}% off`;
}

export default function SubscriptionPlanCards({
  activePlanName,
  activeSubscriptionId,
  plans,
}: Props) {
  const { lang, theme, t } = useLanguage();
  const isDark = theme === 'dark';
  const onFreePlan = isFreePlanName(activePlanName);
  const [subscribingPlanId, setSubscribingPlanId] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleSubscribe = async (planId: number) => {
    if (activeSubscriptionId == null) {
      setCheckoutError(t.subscriptionsCheckoutMissingSubscription);
      return;
    }

    setSubscribingPlanId(planId);
    setCheckoutError(null);

    try {
      const supabase = createClient();
      const result = await invokeSubscriptionNowPaymentCreation(
        supabase,
        activeSubscriptionId,
        planId,
      );

      if (result.success && result.payment_url) {
        window.location.assign(result.payment_url);
        return;
      }

      if (result.success && !result.payment_url) {
        setCheckoutError(
          formatNowPaymentCreationError(result, lang, t.subscriptionsCheckoutEmailSent),
        );
        return;
      }

      setCheckoutError(formatNowPaymentCreationError(result, lang, t.subscriptionsCheckoutError));
    } catch {
      setCheckoutError(t.subscriptionsCheckoutError);
    } finally {
      setSubscribingPlanId(null);
    }
  };

  if (plans.length === 0) {
    return (
      <DashboardFormSection
        isDark={isDark}
        title={t.subscriptionsAvailablePlansTitle}
        variant="profiles"
        accentHex={PLAN_ACCENT}
      >
        <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>
          {t.subscriptionsNoPlansAvailable}
        </p>
      </DashboardFormSection>
    );
  }

  return (
    <DashboardFormSection
      isDark={isDark}
      title={t.subscriptionsAvailablePlansTitle}
      variant="profiles"
      accentHex={PLAN_ACCENT}
    >
      {checkoutError ? (
        <p className="mb-4 text-sm text-red-500" role="alert">
          {checkoutError}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = planNamesMatch(activePlanName, plan.name);
          const canSubscribe =
            onFreePlan &&
            plan.is_available &&
            activeSubscriptionId != null &&
            !isFreePlanName(plan.name);
          const isLoading = subscribingPlanId === plan.id;
          const description = lang === 'es' ? plan.description_es : plan.description_en;

          return (
            <AgentDetailCard
              key={plan.id}
              isDark={isDark}
              variant="profiles"
              accentHex={PLAN_ACCENT}
              className={cn('flex h-full flex-col', isCurrent && 'ring-2 ring-emerald-500/60')}
              contentClassName="flex flex-1 flex-col gap-3 p-4 pt-12 sm:p-4 sm:pt-12"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-lg font-semibold ${dashboardFormHeadingClass(isDark)}`}>
                  {plan.name}
                </h3>
                {isCurrent ? (
                  <span className="rounded-md bg-emerald-600/15 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    {t.subscriptionsCurrentPlan}
                  </span>
                ) : null}
                {!plan.is_available && !isCurrent && !isFreePlanName(plan.name) ? (
                  <span className={dashboardSmallAccentBadgeClass(isDark, '#eab308')}>
                    {t.subscriptionsSoonBadge}
                  </span>
                ) : null}
              </div>

              <p className={`text-sm leading-relaxed ${dashboardFormBodyClass(isDark)}`}>
                {description}
              </p>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className={dashboardFormLabelClass(isDark)}>
                    {t.subscriptionsDaysValidLabel}
                  </dt>
                  <dd className={`font-medium ${dashboardFormHeadingClass(isDark)}`}>
                    {plan.days_valid}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className={dashboardFormLabelClass(isDark)}>
                    {t.subscriptionsApiCreditsLabel}
                  </dt>
                  <dd className={`font-medium ${dashboardFormHeadingClass(isDark)}`}>
                    {plan.monthly_api_credits}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className={dashboardFormLabelClass(isDark)}>
                    {t.subscriptionsPriceLabel}
                  </dt>
                  <dd className={`font-medium ${dashboardFormHeadingClass(isDark)}`}>
                    {formatPrice(plan.price, lang)}
                  </dd>
                </div>
                {plan.discount_percentage > 0 ? (
                  <div className="flex justify-between gap-2">
                    <dt className={dashboardFormLabelClass(isDark)}>
                      {t.subscriptionsDiscountLabel}
                    </dt>
                    <dd className={`font-medium text-emerald-600 dark:text-emerald-400`}>
                      {formatDiscount(plan.discount_percentage, lang)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <button
                type="button"
                disabled={!canSubscribe || isLoading}
                aria-disabled={!canSubscribe || isLoading}
                aria-busy={isLoading}
                onClick={() => {
                  if (canSubscribe && !isLoading) {
                    void handleSubscribe(plan.id);
                  }
                }}
                className={
                  canSubscribe && !isLoading
                    ? dashboardPrimaryButtonClass(isDark)
                    : dashboardDisabledPrimaryButtonClass(isDark)
                }
              >
                {isLoading ? t.subscriptionsSubscribeLoading : t.subscriptionsSubscribe}
              </button>
            </AgentDetailCard>
          );
        })}
      </div>
    </DashboardFormSection>
  );
}
