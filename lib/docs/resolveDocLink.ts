import { getDocManifestEntry } from '@/content/docs/manifest';

/**
 * Resolves a relative markdown link (e.g. `./agent-warning-system.md`) to a
 * public /docs URL using the manifest. Tries sibling paths under the current
 * slug prefix first, then top-level slugs.
 */
export function resolveRelativeDocLink(currentSlug: string, mdBasename: string): string {
  const base = mdBasename.replace(/\.md$/i, '');

  const candidates: string[] = [];

  const slashIdx = currentSlug.lastIndexOf('/');
  if (slashIdx >= 0) {
    candidates.push(`${currentSlug.slice(0, slashIdx)}/${base}`);
  }

  if (currentSlug === 'dashboard' || currentSlug.startsWith('dashboard/')) {
    candidates.push(`dashboard/${base}`);
  }

  candidates.push(base);

  for (const slug of candidates) {
    if (getDocManifestEntry(slug)) {
      return `/docs/${slug}`;
    }
  }

  if (currentSlug === 'dashboard' || currentSlug.startsWith('dashboard/')) {
    return `/docs/dashboard/${base}`;
  }

  return `/docs/${base}`;
}
