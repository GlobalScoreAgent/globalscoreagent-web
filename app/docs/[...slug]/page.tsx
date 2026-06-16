import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DocsArticleClient from '@/components/docs/DocsArticleClient';
import { getAllDocSlugs, getDocManifestEntry } from '@/content/docs/manifest';
import { buildDocMetadata, parseSeoLang } from '@/content/marketing/metadata';
import { assertDocFilesExist, loadDocBothLanguages } from '@/lib/docs/loadDoc';

type PageProps = {
  params: { slug: string[] };
  searchParams: { lang?: string | string[] };
};

assertDocFilesExist();

function resolveDocSlug(segments: string[]): string {
  return segments.join('/');
}

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({
    slug: slug.split('/'),
  }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const docSlug = resolveDocSlug(params.slug);
  const entry = getDocManifestEntry(docSlug);
  if (!entry) {
    return { title: 'Documentation | Global Score Agent' };
  }
  return buildDocMetadata(docSlug, parseSeoLang(searchParams.lang));
}

export default function DocsArticlePage({ params }: PageProps) {
  const docSlug = resolveDocSlug(params.slug);
  const entry = getDocManifestEntry(docSlug);
  if (!entry) {
    notFound();
  }

  const docs = loadDocBothLanguages(docSlug);

  return <DocsArticleClient slug={docSlug} docs={docs} />;
}
