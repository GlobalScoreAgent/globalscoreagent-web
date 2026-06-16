import type { Metadata } from 'next';

import { parseSeoLang } from '@/content/marketing/metadata';

import { resolvePublicAgentMetadata } from '@/lib/seo/resolve-public-agent-seo';

import PublicAgentHumiClient from './PublicAgentHumiClient';



type PageProps = {

  params: { id: string };

  searchParams: { lang?: string | string[]; by?: string | string[] };

};



export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {

  return resolvePublicAgentMetadata(

    params.id,

    searchParams.by,

    'humi',

    parseSeoLang(searchParams.lang),

  );

}



export default function PublicAgentHumiPage() {

  return <PublicAgentHumiClient />;

}

