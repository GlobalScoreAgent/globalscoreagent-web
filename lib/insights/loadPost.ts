import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { Lang } from '@/content/marketing/i18n';
import { pick } from '@/content/marketing/i18n';
import type { InsightsTagId } from '@/content/insights/copy';
import {
  getAllInsightsSlugs,
  getInsightsEntry,
  insightsManifest,
  type InsightsManifestEntry,
} from '@/content/insights/manifest';
import { extractHeadings, extractTitle, type DocHeading } from '@/lib/docs/extractHeadings';

export type InsightsLang = Lang;

export type LoadedInsightsPost = {
  slug: string;
  lang: InsightsLang;
  markdown: string;
  title: string;
  date: string;
  description: string;
  status: InsightsManifestEntry['status'];
  tags: InsightsTagId[];
  readingMinutes: number;
  headings: DocHeading[];
  coverImage?: string;
  coverImageAlt?: string;
};

function postFilePath(lang: InsightsLang, slug: string): string {
  return join(process.cwd(), 'content', 'insights', 'posts', lang, `${slug}.md`);
}

export function estimateReadingMinutes(markdown: string, fallback = 3): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return fallback;
  return Math.max(1, Math.round(words / 200));
}

export function assertInsightsPostsExist(): void {
  for (const slug of getAllInsightsSlugs()) {
    for (const lang of ['es', 'en'] as const) {
      const filePath = postFilePath(lang, slug);
      if (!existsSync(filePath)) {
        throw new Error(`Missing insights post: ${filePath}`);
      }
    }
  }
}

export function loadInsightsPost(slug: string, lang: InsightsLang): LoadedInsightsPost {
  const entry = getInsightsEntry(slug);
  if (!entry) {
    throw new Error(`Unknown insights slug: ${slug}`);
  }

  const filePath = postFilePath(lang, slug);
  if (!existsSync(filePath)) {
    throw new Error(`Missing insights post: ${filePath}`);
  }

  const markdown = readFileSync(filePath, 'utf8');
  const title = extractTitle(markdown) ?? pick(lang, entry.title);

  return {
    slug,
    lang,
    markdown,
    title,
    date: entry.date,
    description: pick(lang, entry.description),
    status: entry.status,
    tags: entry.tags,
    readingMinutes: entry.readingMinutes ?? estimateReadingMinutes(markdown),
    headings: extractHeadings(markdown),
    coverImage: entry.coverImage,
    coverImageAlt: entry.coverImageAlt ? pick(lang, entry.coverImageAlt) : undefined,
  };
}

export function loadInsightsPostBothLanguages(slug: string): Record<InsightsLang, LoadedInsightsPost> {
  return {
    en: loadInsightsPost(slug, 'en'),
    es: loadInsightsPost(slug, 'es'),
  };
}

export function listInsightsPosts(lang: InsightsLang): LoadedInsightsPost[] {
  return [...insightsManifest]
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
    .map((entry) => loadInsightsPost(entry.slug, lang));
}
