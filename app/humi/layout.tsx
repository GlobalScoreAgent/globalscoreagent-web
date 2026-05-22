import JsonLdScript from '@/components/marketing/seo/JsonLdScript';
import { humiProductJsonLd } from '@/lib/seo/json-ld';

export default function HumiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLdScript data={humiProductJsonLd} />
      {children}
    </>
  );
}
