import JsonLdScript from '@/components/marketing/seo/JsonLdScript';
import { walcertProductJsonLd } from '@/lib/seo/json-ld';

export default function WalcertLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLdScript data={walcertProductJsonLd} />
      {children}
    </>
  );
}
