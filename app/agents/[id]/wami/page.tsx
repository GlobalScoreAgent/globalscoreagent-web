import type { Metadata } from 'next';

import { parseSeoLang } from '@/content/marketing/metadata';

import { resolvePublicAgentMetadata } from '@/lib/seo/resolve-public-agent-seo';

import PublicAgentWamiClient from './PublicAgentWamiClient';



type PageProps = {

  params: { id: string };

  searchParams: { lang?: string | string[]; by?: string | string[] };

};



export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {

  return resolvePublicAgentMetadata(

    params.id,

    searchParams.by,

    'wami',

    parseSeoLang(searchParams.lang),

  );

}



export default function PublicAgentWamiPage() {

  return <PublicAgentWamiClient />;

}

