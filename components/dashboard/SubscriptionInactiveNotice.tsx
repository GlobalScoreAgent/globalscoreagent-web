'use client';

import { DashboardStatusVideo } from '@/components/dashboard/DashboardStatusVideo';
import { useLanguage } from '@/app/(dashboard)/dashboard/components/LanguageContext';

const SUBSCRIPTION_INACTIVE_VIDEO = '/animations/agent-subscription.mp4';

export function SubscriptionInactiveNotice() {
  const { t, theme } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <div className="flex justify-center px-4 py-12 md:py-16">
      <div className="h-[min(52vh,420px)] w-full max-w-xl overflow-hidden rounded-2xl">
        <DashboardStatusVideo
          src={SUBSCRIPTION_INACTIVE_VIDEO}
          label={t.subscriptionInactiveVideoLabel}
          isDark={isDark}
          className="h-full"
        />
      </div>
    </div>
  );
}
