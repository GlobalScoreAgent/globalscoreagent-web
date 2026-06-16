'use client';

import { usePathname } from 'next/navigation';
import MarketingShell from '@/components/marketing/layout/MarketingShell';

export default function HeaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') ?? false;
  const isAuth = pathname?.startsWith('/auth') ?? false;

  if (isDashboard || isAuth) {
    return children;
  }

  return <MarketingShell>{children}</MarketingShell>;
}
