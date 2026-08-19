'use client';

import { usePathname } from 'next/navigation';
import MarketingShell from '@/components/marketing/layout/MarketingShell';

export default function HeaderWrapper({
  children,
  skipMarketingShell = false,
}: {
  children: React.ReactNode;
  skipMarketingShell?: boolean;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') ?? false;
  const isAuth = pathname?.startsWith('/auth') ?? false;
  const isInsights = skipMarketingShell || (pathname?.startsWith('/insights') ?? false);

  if (isDashboard || isAuth || isInsights) {
    return children;
  }

  return <MarketingShell>{children}</MarketingShell>;
}
