import type { Metadata } from 'next';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import AboutPageClient from '@/components/about/AboutPageClient';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('about', parseSeoLang(searchParams.lang));
}

export default function AboutPage() {
  return <AboutPageClient />;
}
