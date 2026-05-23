import JsonLdScript from '@/components/marketing/seo/JsonLdScript';
import { wamiProductJsonLd } from '@/lib/seo/json-ld';

export default function WamiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLdScript data={wamiProductJsonLd} />
      {children}
    </>
  );
}
