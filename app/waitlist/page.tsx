import type { Metadata } from 'next';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import WaitlistPageClient from './WaitlistPageClient';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('waitlist', parseSeoLang(searchParams.lang));
}

export default function WaitlistPage() {
  return <WaitlistPageClient />;
}
