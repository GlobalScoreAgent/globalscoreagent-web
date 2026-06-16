import type { Metadata } from 'next';

import Top10AgentsSection from '@/components/marketing/agents/Top10AgentsSection';

import JsonLdScript from '@/components/marketing/seo/JsonLdScript';

import { buildRouteMetadata, parseSeoLang } from '@/content/marketing/metadata';

import { top10ItemListJsonLd } from '@/lib/seo/json-ld';

import { fetchPublicTop10Agents } from '@/lib/web-page/fetch-top-agents';



type PageProps = {

  searchParams: { lang?: string | string[] };

};



export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {

  return buildRouteMetadata('top10Agents', parseSeoLang(searchParams.lang));

}



export default async function Top10AgentsPage({ searchParams }: PageProps) {

  const lang = parseSeoLang(searchParams.lang);

  const agents = await fetchPublicTop10Agents();

  const itemListJsonLd = agents.length > 0 ? top10ItemListJsonLd(agents, lang) : null;



  return (

    <>

      {itemListJsonLd ? <JsonLdScript data={itemListJsonLd} /> : null}

      <Top10AgentsSection />

    </>

  );

}

