'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { publicApiCopy } from '@/content/public-api/copy';
import { pick } from '@/content/marketing/i18n';
import type { PublicApiFetchResult } from '@/lib/public-api/constants';
import { fetchPublicApi } from '@/lib/public-api/fetchPublicApi';
import PublicApiPlaygroundShell, {
  PlaygroundField,
  playgroundInputClass,
} from './PublicApiPlaygroundShell';

export default function PublicApiSearchPlayground() {
  const { language } = useLanguage();
  const copy = publicApiCopy.playground.search;

  const [name, setName] = useState('');
  const [chainName, setChainName] = useState('');
  const [ownerWallet, setOwnerWallet] = useState('');
  const [walletChainRegister, setWalletChainRegister] = useState('');
  const [limit, setLimit] = useState('5');
  const [page, setPage] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicApiFetchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const params = useMemo(() => {
    const next: Record<string, string> = {};
    if (name.trim()) next.name = name.trim();
    if (chainName.trim()) next.chain_name = chainName.trim();
    if (ownerWallet.trim()) next.owner_wallet = ownerWallet.trim();
    if (walletChainRegister.trim()) next.wallet_chain_register = walletChainRegister.trim();
    if (limit.trim()) next.limit = limit.trim();
    if (page.trim()) next.page = page.trim();
    return next;
  }, [name, chainName, ownerWallet, walletChainRegister, limit, page]);

  const requestUrl = useMemo(() => {
    const qs = new URLSearchParams(params);
    return `https://api.globalscoreagent.com/v1/agents/search${
      qs.toString() ? `?${qs.toString()}` : ''
    }`;
  }, [params]);

  async function handleSubmit() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchPublicApi('search', params);
      setResult(response);
    } catch {
      setResult(null);
      setErrorMessage(pick(language, publicApiCopy.playground.networkError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicApiPlaygroundShell
      title={pick(language, copy.title)}
      requestUrl={requestUrl}
      onSubmit={handleSubmit}
      loading={loading}
      result={result}
      errorMessage={errorMessage}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <PlaygroundField label={pick(language, copy.fields.name)}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={pick(language, copy.placeholders.name)}
            className={playgroundInputClass}
          />
        </PlaygroundField>
        <PlaygroundField label={pick(language, copy.fields.chainName)}>
          <input
            type="text"
            value={chainName}
            onChange={(e) => setChainName(e.target.value)}
            placeholder={pick(language, copy.placeholders.chainName)}
            className={playgroundInputClass}
          />
        </PlaygroundField>
        <PlaygroundField label={pick(language, copy.fields.ownerWallet)}>
          <input
            type="text"
            value={ownerWallet}
            onChange={(e) => setOwnerWallet(e.target.value)}
            placeholder={pick(language, copy.placeholders.ownerWallet)}
            className={playgroundInputClass}
          />
        </PlaygroundField>
        <PlaygroundField label={pick(language, copy.fields.walletChainRegister)}>
          <input
            type="text"
            value={walletChainRegister}
            onChange={(e) => setWalletChainRegister(e.target.value)}
            placeholder={pick(language, copy.placeholders.walletChainRegister)}
            className={playgroundInputClass}
          />
        </PlaygroundField>
        <PlaygroundField label={pick(language, copy.fields.limit)}>
          <input
            type="number"
            min={1}
            max={100}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder={pick(language, copy.placeholders.limit)}
            className={playgroundInputClass}
          />
        </PlaygroundField>
        <PlaygroundField label={pick(language, copy.fields.page)}>
          <input
            type="number"
            min={1}
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder={pick(language, copy.placeholders.page)}
            className={playgroundInputClass}
          />
        </PlaygroundField>
      </div>
    </PublicApiPlaygroundShell>
  );
}
