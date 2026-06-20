import type { Metadata } from 'next';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import PublicApiPageClient from '@/components/public-api/PublicApiPageClient';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('publicApi', parseSeoLang(searchParams.lang));
}

export default function PublicApiPage() {
  return <PublicApiPageClient />;
}
