import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import { reportSessionEnd } from '@/lib/gsa/logout-process-client';

export async function handleDashboardUnauthorized(redirectPath = '/dashboard'): Promise<void> {
  await reportSessionEnd('unauthorized');
  window.location.href = buildAuthLoginUrl(redirectPath);
}
