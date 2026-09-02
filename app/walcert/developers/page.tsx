import type { Metadata } from 'next';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import JsonLdScript from '@/components/marketing/seo/JsonLdScript';
import { walcertDevelopersJsonLd } from '@/lib/seo/json-ld';
import WalcertDevHero from '@/components/walcert/developers/WalcertDevHero';
import WalcertDevEndpointsSection from '@/components/walcert/developers/WalcertDevEndpointsSection';
import WalcertDevBodySection from '@/components/walcert/developers/WalcertDevBodySection';
import WalcertDevX402Section from '@/components/walcert/developers/WalcertDevX402Section';
import WalcertDevErc8257Section from '@/components/walcert/developers/WalcertDevErc8257Section';
import WalcertDevPaidPayloadSection from '@/components/walcert/developers/WalcertDevPaidPayloadSection';
import WalcertDevLinksSection from '@/components/walcert/developers/WalcertDevLinksSection';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('walcertDevelopers', parseSeoLang(searchParams.lang));
}

export default function WalcertDevelopersPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <JsonLdScript data={walcertDevelopersJsonLd} />
      <WalcertDevHero />
      <WalcertDevEndpointsSection />
      <WalcertDevBodySection />
      <WalcertDevX402Section />
      <WalcertDevErc8257Section />
      <WalcertDevPaidPayloadSection />
      <WalcertDevLinksSection />
    </main>
  );
}
