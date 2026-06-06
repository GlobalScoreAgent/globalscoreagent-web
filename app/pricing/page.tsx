import type { Metadata } from 'next';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import PricingPageClient from '@/components/pricing/PricingPageClient';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('pricing', parseSeoLang(searchParams.lang));
}

export default function PricingPage() {
  return <PricingPageClient />;
}
