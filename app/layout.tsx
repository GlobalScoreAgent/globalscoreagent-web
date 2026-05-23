import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { LanguageProvider } from './contexts/LanguageContext';
import HeaderWrapper from './components/HeaderWrapper';
import JsonLdScript from '@/components/marketing/seo/JsonLdScript';
import { organizationJsonLd } from '@/lib/seo/json-ld';
import { SITE_URL } from '@/lib/seo/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Global Score Agent - Reputación y confianza para agentes ERC-8004',
    template: '%s | Global Score Agent',
  },
  description:
    'Plataforma de reputación y confianza para ERC-8004. Los índices HUMI y WAMI ofrecen confianza medible on-chain para agentes y wallets.',
  openGraph: {
    locale: 'es_ES',
    alternateLocale: ['en_US'],
    siteName: 'Global Score Agent',
    type: 'website',
  },
  keywords: [
    'ERC-8004',
    'HUMI Index',
    'WAMI Index',
    'agent reputation',
    'trust infrastructure',
    'AI agents',
    'Global Score Agent',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={GeistSans.className}>
      <body className="bg-zinc-950 text-white antialiased">
        <JsonLdScript data={organizationJsonLd} />
        <LanguageProvider>
          <HeaderWrapper>{children}</HeaderWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
