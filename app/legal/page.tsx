import type { Metadata } from 'next';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import LegalPageClient from './LegalPageClient';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('legal', parseSeoLang(searchParams.lang));
}

export default function LegalPage() {
  return <LegalPageClient />;
}
