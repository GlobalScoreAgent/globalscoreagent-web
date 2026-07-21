import renderOgImage, { ogContentType, ogSize } from '@/components/marketing/seo/og-image';
import { walcertCopy } from '@/content/walcert/copy';

export const runtime = 'edge';

export const alt = walcertCopy.seo.title.es;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    title: walcertCopy.seo.title.es,
    subtitle: walcertCopy.seo.description.es,
  });
}
