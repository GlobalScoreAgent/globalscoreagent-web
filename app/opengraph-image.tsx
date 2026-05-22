import renderOgImage, { ogContentType, ogSize } from '@/components/marketing/seo/og-image';

export const runtime = 'edge';

export const alt =
  'Global Score Agent — Reputación y confianza para agentes y wallets ERC-8004';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    title: 'Reputación on-chain para ERC-8004',
    subtitle: 'Índices HUMI (agentes) y WAMI (wallets)',
  });
}
