import { redirect } from 'next/navigation';

export default function DashboardUsageRedirectPage() {
  redirect('/dashboard/api');
}
