import dynamic from 'next/dynamic';

const ChainsPageClient = dynamic(() => import('./ChainsPageClient'), {
  ssr: false,
  loading: () => null,
});

export default function DashboardChainsPage() {
  return <ChainsPageClient />;
}
