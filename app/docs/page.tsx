import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';
import { assertDocFilesExist } from '@/lib/docs/loadDoc';

type PageProps = {
  searchParams: { lang?: string | string[] };
};

assertDocFilesExist();

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return buildRouteMetadata('docs', parseSeoLang(searchParams.lang));
}

export default function DocsIndexPage({ searchParams }: PageProps) {
  const lang = parseSeoLang(searchParams.lang);
  const langQuery = lang === 'en' ? '?lang=en' : '';
  redirect(`/docs/global-score-agent${langQuery}`);
}
