import { readFileSync, existsSync } from 'fs';
import { join, normalize, sep } from 'path';
import { NextRequest, NextResponse } from 'next/server';

const IMAGES_ROOT = join(process.cwd(), 'docs', 'images');

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

type RouteContext = {
  params: { path: string[] };
};

function resolveImagePath(segments: string[]): string | null {
  if (segments.length === 0) return null;

  const relative = segments.join('/');
  if (relative.includes('..')) return null;

  const absolute = normalize(join(IMAGES_ROOT, relative));
  const rootWithSep = IMAGES_ROOT.endsWith(sep) ? IMAGES_ROOT : `${IMAGES_ROOT}${sep}`;

  if (!absolute.startsWith(rootWithSep) && absolute !== IMAGES_ROOT) {
    return null;
  }

  if (!existsSync(absolute)) return null;
  return absolute;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const absolute = resolveImagePath(context.params.path);
  if (!absolute) {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = absolute.slice(absolute.lastIndexOf('.')).toLowerCase();
  const contentType = MIME_BY_EXT[ext] ?? 'application/octet-stream';
  const body = readFileSync(absolute);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
