import renderOgImage, { ogContentType, ogSize } from '@/components/marketing/seo/og-image';
import { marketingCopy } from '@/content/marketing/copy';

export const runtime = 'edge';

export const alt = marketingCopy.top10Agents.title.es;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    title: marketingCopy.top10Agents.title.es,
    subtitle: marketingCopy.top10Agents.subtitle.es,
  });
}
