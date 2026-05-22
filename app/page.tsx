import type { Metadata } from 'next';
import PortalHero from '@/components/marketing/home/PortalHero';
import ProblemSection from '@/components/marketing/sections/ProblemSection';
import MissionSection from '@/components/marketing/sections/MissionSection';
import ProductsSection from '@/components/marketing/sections/ProductsSection';
import ToolsSection from '@/components/marketing/sections/ToolsSection';
import SubscriptionsSection from '@/components/marketing/sections/SubscriptionsSection';
import HowWeWorkSection from '@/components/marketing/sections/HowWeWorkSection';
import JsonLdScript from '@/components/marketing/seo/JsonLdScript';
import { buildHomeMetadata, parseSeoLang } from '@/content/marketing/metadata';
import { webSiteJsonLd } from '@/lib/seo/json-ld';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildHomeMetadata(parseSeoLang(searchParams.lang));
}

export default function PortalPage() {
  return (
    <>
      <JsonLdScript data={webSiteJsonLd} />
      <PortalHero />
      <ProblemSection />
      <MissionSection />
      <ProductsSection />
      <ToolsSection />
      <SubscriptionsSection />
      <HowWeWorkSection />
    </>
  );
}
