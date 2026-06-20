export const PUBLIC_API_BASE_URL = 'https://api.globalscoreagent.com';

export type PublicApiEndpoint = 'search' | 'maturity';

export const SEARCH_QUERY_PARAMS = [
  'name',
  'chain_name',
  'owner_wallet',
  'wallet_chain_register',
  'limit',
  'page',
] as const;

export const MATURITY_QUERY_PARAMS = ['canonical_slug', 'lang'] as const;

export type PublicApiSearchParams = Partial<
  Record<(typeof SEARCH_QUERY_PARAMS)[number], string>
>;

export type PublicApiMaturityParams = Partial<
  Record<(typeof MATURITY_QUERY_PARAMS)[number], string>
>;

export type PublicApiFetchResult = {
  status: number;
  body: unknown;
  requestUrl: string;
};
