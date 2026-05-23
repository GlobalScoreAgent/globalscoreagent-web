import type { Metadata } from 'next';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import HumiHero from '@/components/humi/sections/HumiHero';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('humi', parseSeoLang(searchParams.lang));
}

import HumiEcosystemSection from '@/components/humi/sections/HumiEcosystemSection';
import HumiBenefitsSection from '@/components/humi/sections/HumiBenefitsSection';
import HumiWamiSynergySection from '@/components/humi/sections/HumiWamiSynergySection';
import HumiComparisonSection from '@/components/humi/sections/HumiComparisonSection';
import HumiDataFreshnessSection from '@/components/humi/sections/HumiDataFreshnessSection';
import HumiPillarsSection from '@/components/humi/sections/HumiPillarsSection';
import HumiComingSoonBanner from '@/components/humi/sections/HumiComingSoonBanner';
import HumiCtaSection from '@/components/humi/sections/HumiCtaSection';

export default function HumiPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <HumiHero />
      <HumiEcosystemSection />
      <HumiBenefitsSection />
      <HumiWamiSynergySection />
      <HumiComparisonSection />
      <HumiDataFreshnessSection />
      <HumiPillarsSection />
      <HumiComingSoonBanner />
      <HumiCtaSection />
    </main>
  );
}
