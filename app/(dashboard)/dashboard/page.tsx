import dynamic from 'next/dynamic';

const DashboardPageClient = dynamic(() => import('./DashboardPageClient'), {
  ssr: false,
  loading: () => null,
});

export default function DashboardPage() {
  return <DashboardPageClient />;
}
