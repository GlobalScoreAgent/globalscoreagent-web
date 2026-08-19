import { headers } from 'next/headers';
import InsightsShell from '@/components/insights/InsightsShell';
import { assertInsightsPostsExist } from '@/lib/insights/loadPost';
import { isInsightsHostname } from '@/lib/insights/site';

assertInsightsPostsExist();

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const onInsightsHost = isInsightsHostname(headers().get('host'));

  return <InsightsShell onInsightsHost={onInsightsHost}>{children}</InsightsShell>;
}
