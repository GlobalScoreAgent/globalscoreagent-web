'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { pick } from '@/content/marketing/i18n';
import {
  WALCERT_AGENT_CARD_CONCORDIUM_URL,
  WALCERT_AGENT_CITY_URL,
  WALCERT_AGENT_FAMILY_LISTING_URL,
  WALCERT_AGENT_ID,
  WALCERT_AIGORA_PROFILE_URL,
  WALCERT_BASE_ERC8004_AGENT_ID,
  WALCERT_BNB_ERC8004_AGENT_ID,
  WALCERT_BNB_RECEIPT_CONTRACT_URL,
  WALCERT_CDP_BAZAAR_URL,
  WALCERT_CONCORDIUM_TOKEN_ID,
  WALCERT_ERC8257_TOOLS_BASE,
  WALCERT_ERC8257_TOOLS_ETH,
  WALCERT_ETH_ERC8004_AGENT_ID,
  WALCERT_EXPLORER_URL,
  WALCERT_LIVE_URL,
  WALCERT_REPO_URL,
  WALCERT_VIRTUALS_ACP_AGENT_URL,
} from '@/content/walcert/copy';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

const factsCopy = {
  title: {
    es: 'Datos del agente (para humanos y agentes)',
    en: 'Agent facts (for humans and agents)',
  },
  intro: {
    es: 'Resumen canónico de identidad, API, pagos y presencia. La misma información está en JSON-LD y en llms.txt.',
    en: 'Canonical summary of identity, API, payments, and presence. The same facts are in JSON-LD and llms.txt.',
  },
};

const rows: { label: { es: string; en: string }; value: string; href?: string }[] = [
  {
    label: { es: 'API / agent card', en: 'API / agent card' },
    value: WALCERT_LIVE_URL,
    href: WALCERT_LIVE_URL,
  },
  {
    label: { es: 'Celo ERC-8004 (emisión)', en: 'Celo ERC-8004 (issuance)' },
    value: `agentId ${WALCERT_AGENT_ID}`,
    href: WALCERT_EXPLORER_URL,
  },
  {
    label: { es: 'Base ERC-8004', en: 'Base ERC-8004' },
    value: `agentId ${WALCERT_BASE_ERC8004_AGENT_ID}`,
    href: WALCERT_VIRTUALS_ACP_AGENT_URL,
  },
  {
    label: { es: 'Ethereum ERC-8004', en: 'Ethereum ERC-8004' },
    value: `agentId ${WALCERT_ETH_ERC8004_AGENT_ID}`,
    href: WALCERT_AGENT_CITY_URL,
  },
  {
    label: { es: 'BNB ERC-8004', en: 'BNB ERC-8004' },
    value: `agentId ${WALCERT_BNB_ERC8004_AGENT_ID}`,
    href: WALCERT_AGENT_FAMILY_LISTING_URL,
  },
  {
    label: { es: 'Concordium CIS-8004', en: 'Concordium CIS-8004' },
    value: `#${WALCERT_CONCORDIUM_TOKEN_ID}`,
    href: WALCERT_AGENT_CARD_CONCORDIUM_URL,
  },
  {
    label: { es: 'Certificados', en: 'Certificates' },
    value: 'origins · activity · multichain (GoldRush v2.1) · portfolio',
  },
  {
    label: { es: 'Pago x402', en: 'x402 payment' },
    value: '$0.05 USDC · Celo · Base · BNB (Permit2 + NFT receipt)',
  },
  {
    label: { es: 'Recibo NFT (BNB)', en: 'NFT receipt (BNB)' },
    value: WALCERT_BNB_RECEIPT_CONTRACT_URL,
    href: WALCERT_BNB_RECEIPT_CONTRACT_URL,
  },
  {
    label: { es: 'Verify', en: 'Verify' },
    value: `POST ${WALCERT_LIVE_URL}/v1/verify`,
  },
  {
    label: { es: 'ERC-8257 tools', en: 'ERC-8257 tools' },
    value: `Base ${WALCERT_ERC8257_TOOLS_BASE} · Eth ${WALCERT_ERC8257_TOOLS_ETH}`,
  },
  {
    label: { es: 'Presencia', en: 'Presence' },
    value: 'Virtuals ACP · Agent.family · Agent City · CDP Bazaar · Aigora · Concordium',
  },
  {
    label: { es: 'Aigora (Celo)', en: 'Aigora (Celo)' },
    value: WALCERT_AIGORA_PROFILE_URL,
    href: WALCERT_AIGORA_PROFILE_URL,
  },
  {
    label: { es: 'CDP Bazaar', en: 'CDP Bazaar' },
    value: WALCERT_CDP_BAZAAR_URL,
    href: WALCERT_CDP_BAZAAR_URL,
  },
  {
    label: { es: 'Repo público', en: 'Public repo' },
    value: WALCERT_REPO_URL,
    href: WALCERT_REPO_URL,
  },
  {
    label: { es: 'Developers', en: 'Developers' },
    value: 'https://globalscoreagent.com/walcert/developers',
    href: '/walcert/developers',
  },
];

export default function WalcertAgentFactsSection() {
  const { language } = useLanguage();

  return (
    <SectionSurface id="agent-facts" tone="dark">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-3 text-center text-2xl font-bold text-white md:text-3xl">
          {pick(language, factsCopy.title)}
        </h2>
        <p className="mb-8 text-center text-sm leading-relaxed text-zinc-400 md:text-base">
          {pick(language, factsCopy.intro)}
        </p>
        <dl className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800/80 bg-black/25">
          {rows.map((row) => (
            <div
              key={row.label.en}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4"
            >
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {pick(language, row.label)}
              </dt>
              <dd className="min-w-0 break-all text-sm text-zinc-200">
                {row.href ? (
                  <a
                    href={row.href}
                    {...(row.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="text-gold transition-colors hover:text-amber-300"
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionSurface>
  );
}
