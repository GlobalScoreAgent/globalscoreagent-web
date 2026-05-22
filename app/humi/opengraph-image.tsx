import renderOgImage, { ogContentType, ogSize } from '@/components/marketing/seo/og-image';
import { humiCopy } from '@/content/humi/copy';

export const runtime = 'edge';

export const alt = humiCopy.seo.title.es;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    title: humiCopy.seo.title.es,
    subtitle: humiCopy.seo.description.es,
  });
}
