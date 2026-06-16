import type { Metadata } from 'next';
import PortalHero from '@/components/marketing/home/PortalHero';
import Erc8004Section from '@/components/marketing/sections/Erc8004Section';
import ProblemSection from '@/components/marketing/sections/ProblemSection';
import MissionSection from '@/components/marketing/sections/MissionSection';
import ProductsSection from '@/components/marketing/sections/ProductsSection';
import ToolsSection from '@/components/marketing/sections/ToolsSection';
import SubscriptionsSection from '@/components/marketing/sections/SubscriptionsSection';
import RoadmapSection from '@/components/marketing/sections/RoadmapSection';
import HowWeWorkSection from '@/components/marketing/sections/HowWeWorkSection';
import JsonLdScript from '@/components/marketing/seo/JsonLdScript';
import { buildHomeMetadata, parseSeoLang } from '@/content/marketing/metadata';
import { webSiteJsonLd } from '@/lib/seo/json-ld';
import { getSupabaseReadClient } from '@/lib/supabase/read';
import { fetchRoadmapFeatures } from '@/lib/web-page/roadmap-features';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildHomeMetadata(parseSeoLang(searchParams.lang));
}

export default async function PortalPage() {
  let roadmapFeatures: Awaited<ReturnType<typeof fetchRoadmapFeatures>> = [];

  try {
    const supabase = getSupabaseReadClient();
    if (supabase) {
      roadmapFeatures = await fetchRoadmapFeatures(supabase);
    }
  } catch (err) {
    console.warn('[home/roadmap]', err instanceof Error ? err.message : 'roadmap_fetch_failed');
  }

  return (
    <>
      <JsonLdScript data={webSiteJsonLd} />
      <PortalHero />
      <Erc8004Section />
      <ProblemSection />
      <MissionSection />
      <ProductsSection />
      <ToolsSection />
      <SubscriptionsSection />
      <RoadmapSection initialFeatures={roadmapFeatures} />
      <HowWeWorkSection />
    </>
  );
}
