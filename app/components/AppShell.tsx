import { headers } from 'next/headers';
import HeaderWrapper from './HeaderWrapper';
import { isInsightsHostname } from '@/lib/insights/site';

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = headers();
  const skipMarketingShell =
    headerStore.get('x-gsa-surface') === 'insights' ||
    isInsightsHostname(headerStore.get('host'));

  return (
    <HeaderWrapper skipMarketingShell={skipMarketingShell}>{children}</HeaderWrapper>
  );
}
