import renderOgImage, { ogContentType, ogSize } from '@/components/marketing/seo/og-image';
import { wamiCopy } from '@/content/wami/copy';

export const runtime = 'edge';

export const alt = wamiCopy.seo.title.es;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    title: wamiCopy.seo.title.es,
    subtitle: wamiCopy.seo.description.es,
  });
}
