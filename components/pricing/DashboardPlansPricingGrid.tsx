'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';
import { DASHBOARD_PLANS, pickBilingual } from '@/lib/gsa/dashboard-plan-catalog';
import ComingSoonBadge from './ComingSoonBadge';
import PricingGlassCard from './PricingGlassCard';

export default function DashboardPlansPricingGrid() {
  const { language } = useLanguage();
  const { columns } = pricingCopy.sections.dashboardPlans;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {DASHBOARD_PLANS.map((plan) => {
        const isComingSoon = plan.comingSoon === true;
        const isHighlight = plan.source === 'registration_dashboard_plus_credits';

        return (
          <PricingGlassCard
            key={plan.source}
            highlight={isHighlight}
            muted={isComingSoon}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-white">
                {pickBilingual(plan.name, language)}
              </h3>
              {isComingSoon ? <ComingSoonBadge /> : null}
            </div>

            <dl className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-400">{pick(language, columns.monthly)}</dt>
                <dd className="font-medium text-white">{plan.monthlyPrice}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-400">{pick(language, columns.annual)}</dt>
                <dd className="font-medium text-white">{plan.annualPrice}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-400">{pick(language, columns.savings)}</dt>
                <dd className="font-medium text-white">{plan.savings}</dd>
              </div>
            </dl>

            <p className="text-sm leading-relaxed text-zinc-300">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {pick(language, columns.includes)}
              </span>
              {pickBilingual(plan.includes, language)}
            </p>
          </PricingGlassCard>
        );
      })}
    </div>
  );
}
