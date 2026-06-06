export type DocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function extractHeadings(markdown: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const seen = new Map<string, number>();

  for (const line of markdown.split('\n')) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/\*\*/g, '').trim();
    let id = slugifyHeading(text);
    const count = seen.get(id) ?? 0;
    if (count > 0) id = `${id}-${count + 1}`;
    seen.set(slugifyHeading(text), count + 1);

    headings.push({ id, text, level });
  }

  return headings;
}

export function extractTitle(markdown: string): string | null {
  for (const line of markdown.split('\n')) {
    const match = /^#\s+(.+)$/.exec(line.trim());
    if (match) return match[1].replace(/\*\*/g, '').trim();
  }
  return null;
}
