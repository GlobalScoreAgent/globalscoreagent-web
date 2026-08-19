import { createHeadingIdAssigner } from '@/lib/docs/headingSlug';

export type DocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function extractHeadings(markdown: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const assignId = createHeadingIdAssigner();

  for (const line of markdown.split('\n')) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/\*\*/g, '').trim();
    const id = assignId(text);

    headings.push({ id, text, level });
  }

  return headings;
}

/** Maps 1-based markdown line numbers (mdast position.start.line) to heading ids. */
export function buildHeadingIdsByLine(markdown: string): Map<number, string> {
  const idsByLine = new Map<number, string>();
  const assignId = createHeadingIdAssigner();
  const lines = markdown.split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const match = /^(#{2,3})\s+(.+)$/.exec(lines[index].trim());
    if (!match) continue;

    const text = match[2].replace(/\*\*/g, '').trim();
    idsByLine.set(index + 1, assignId(text));
  }

  return idsByLine;
}

export function extractTitle(markdown: string): string | null {
  for (const line of markdown.split('\n')) {
    const match = /^#\s+(.+)$/.exec(line.trim());
    if (match) return match[1].replace(/\*\*/g, '').trim();
  }
  return null;
}
