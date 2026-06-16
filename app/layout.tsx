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
    default: 'Global Score Agent - Reputation and trust for ERC-8004 agents',
    template: '%s | Global Score Agent',
  },
  description:
    'Reputation and trust platform for ERC-8004. HUMI and WAMI indices, Top 10 ranking, and public on-chain agent profiles.',
  openGraph: {
    locale: 'en_US',
    alternateLocale: ['es_ES'],
    siteName: 'Global Score Agent',
    type: 'website',
  },
  keywords: [
    'ERC-8004',
    'HUMI Index',
    'WAMI Index',
    'Top 10 agents',
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
    <html lang="en" className={GeistSans.className}>
      <body className="bg-zinc-950 text-white antialiased">
        <JsonLdScript data={organizationJsonLd} />
        <LanguageProvider>
          <HeaderWrapper>{children}</HeaderWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
