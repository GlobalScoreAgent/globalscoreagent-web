'use client';

import type { ReactNode } from 'react';
import { useDashboardLogin } from '@/app/(dashboard)/dashboard/components/DashboardLoginContext';
import { SubscriptionInactiveNotice } from '@/components/dashboard/SubscriptionInactiveNotice';

export function DashboardSubscriptionGate({ children }: { children: ReactNode }) {
  const { loginReady, isSubscriptionActive } = useDashboardLogin();

  if (loginReady && !isSubscriptionActive) {
    return <SubscriptionInactiveNotice />;
  }

  return <>{children}</>;
}
