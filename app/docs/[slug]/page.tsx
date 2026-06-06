import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DocsArticleClient from '@/components/docs/DocsArticleClient';
import { getAllDocSlugs, getDocManifestEntry } from '@/content/docs/manifest';
import { buildDocMetadata, parseSeoLang } from '@/content/marketing/metadata';
import { assertDocFilesExist, loadDocBothLanguages } from '@/lib/docs/loadDoc';

type PageProps = {
  params: { slug: string };
  searchParams: { lang?: string | string[] };
};

assertDocFilesExist();

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const entry = getDocManifestEntry(params.slug);
  if (!entry) {
    return { title: 'Documentation | Global Score Agent' };
  }
  return buildDocMetadata(params.slug, parseSeoLang(searchParams.lang));
}

export default function DocsArticlePage({ params }: PageProps) {
  const entry = getDocManifestEntry(params.slug);
  if (!entry) {
    notFound();
  }

  const docs = loadDocBothLanguages(params.slug);

  return <DocsArticleClient slug={params.slug} docs={docs} />;
}
