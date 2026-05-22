import type { Metadata } from 'next';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import WamiHero from '@/components/wami/sections/WamiHero';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('wami', parseSeoLang(searchParams.lang));
}

import WamiEcosystemSection from '@/components/wami/sections/WamiEcosystemSection';
import WamiBenefitsSection from '@/components/wami/sections/WamiBenefitsSection';
import WamiHumiSynergySection from '@/components/wami/sections/WamiHumiSynergySection';
import WamiComparisonSection from '@/components/wami/sections/WamiComparisonSection';
import WamiDataFreshnessSection from '@/components/wami/sections/WamiDataFreshnessSection';
import WamiPillarsSection from '@/components/wami/sections/WamiPillarsSection';
import WamiComingSoonBanner from '@/components/wami/sections/WamiComingSoonBanner';
import WamiCtaSection from '@/components/wami/sections/WamiCtaSection';

export default function WamiPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <WamiHero />
      <WamiEcosystemSection />
      <WamiBenefitsSection />
      <WamiHumiSynergySection />
      <WamiComparisonSection />
      <WamiDataFreshnessSection />
      <WamiPillarsSection />
      <WamiComingSoonBanner />
      <WamiCtaSection />
    </main>
  );
}
