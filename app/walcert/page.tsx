import type { Metadata } from 'next';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import WalcertHero from '@/components/walcert/sections/WalcertHero';
import WalcertProblemSection from '@/components/walcert/sections/WalcertProblemSection';
import WalcertCertificatesSection from '@/components/walcert/sections/WalcertCertificatesSection';
import WalcertPreviewVsPaidSection from '@/components/walcert/sections/WalcertPreviewVsPaidSection';
import WalcertIdentitySection from '@/components/walcert/sections/WalcertIdentitySection';
import WalcertPresenceSection from '@/components/walcert/sections/WalcertPresenceSection';
import WalcertVerifiabilitySection from '@/components/walcert/sections/WalcertVerifiabilitySection';
import WalcertAgentFactsSection from '@/components/walcert/sections/WalcertAgentFactsSection';
import WalcertCtaSection from '@/components/walcert/sections/WalcertCtaSection';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('walcert', parseSeoLang(searchParams.lang));
}

export default function WalcertPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <WalcertHero />
      <WalcertProblemSection />
      <WalcertCertificatesSection />
      <WalcertPreviewVsPaidSection />
      <WalcertIdentitySection />
      <WalcertPresenceSection />
      <WalcertVerifiabilitySection />
      <WalcertAgentFactsSection />
      <WalcertCtaSection />
    </main>
  );
}
