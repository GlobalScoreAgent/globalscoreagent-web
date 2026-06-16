import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { SeoLang } from '@/content/marketing/metadata';
import { getAllDocSlugs, getDocManifestEntry } from '@/content/docs/manifest';
import { extractHeadings, extractTitle, type DocHeading } from './extractHeadings';
import { resolveRelativeDocLink } from './resolveDocLink';

const DOC_LOCALES = { es: 'español', en: 'ingles' } as const;

const GITHUB_REPO = 'GlobalScoreAgent/globalscoreagent-web';
const GITHUB_BRANCH = 'main';

export type LoadedDoc = {
  slug: string;
  lang: SeoLang;
  markdown: string;
  title: string;
  headings: DocHeading[];
  githubUrl: string;
};

function docRelativePath(slug: string): string {
  if (slug === 'dashboard') {
    return join('dashboard', 'index.md');
  }
  if (slug.includes('/')) {
    return `${slug}.md`;
  }
  return `${slug}.md`;
}

function docFilePath(lang: SeoLang, slug: string): string {
  return join(process.cwd(), 'docs', DOC_LOCALES[lang], docRelativePath(slug));
}

function githubDocPath(lang: SeoLang, slug: string): string {
  return `docs/${DOC_LOCALES[lang]}/${docRelativePath(slug).replace(/\\/g, '/')}`;
}

export function transformMarkdownForWeb(markdown: string, slug: string): string {
  let result = markdown.replace(
    /\]\(\.\.\/\.\.\/images\/dashboard\//g,
    '](/docs-images/dashboard/',
  );

  result = result.replace(/\]\(\.\/([a-z0-9-]+)\.md\)/gi, (_match, basename: string) => {
    return `](${resolveRelativeDocLink(slug, basename)})`;
  });
  return result;
}

export function assertDocFilesExist(): void {
  for (const slug of getAllDocSlugs()) {
    for (const lang of ['es', 'en'] as const) {
      const filePath = docFilePath(lang, slug);
      if (!existsSync(filePath)) {
        throw new Error(`Missing documentation file: ${filePath}`);
      }
    }
  }
}

export function loadDoc(slug: string, lang: SeoLang): LoadedDoc {
  const entry = getDocManifestEntry(slug);
  if (!entry) {
    throw new Error(`Unknown documentation slug: ${slug}`);
  }

  const filePath = docFilePath(lang, slug);
  if (!existsSync(filePath)) {
    throw new Error(`Missing documentation file: ${filePath}`);
  }

  const rawMarkdown = readFileSync(filePath, 'utf8');
  const markdown = transformMarkdownForWeb(rawMarkdown, slug);
  const title = extractTitle(markdown) ?? (lang === 'en' ? entry.title.en : entry.title.es);

  return {
    slug,
    lang,
    markdown,
    title,
    headings: extractHeadings(markdown),
    githubUrl: `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${githubDocPath(lang, slug)}`,
  };
}

export function loadDocBothLanguages(slug: string): { es: LoadedDoc; en: LoadedDoc } {
  return {
    es: loadDoc(slug, 'es'),
    en: loadDoc(slug, 'en'),
  };
}
