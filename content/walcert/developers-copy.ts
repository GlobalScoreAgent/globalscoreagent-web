import type { Bilingual } from '@/content/marketing/i18n';
import {
  WALCERT_LIVE_URL,
  WALCERT_REPO_URL,
  WALCERT_AGENT_CARD_CONCORDIUM_URL,
  WALCERT_CONCORDIUM_REGISTRY_URL,
  WALCERT_VIRTUALS_ACP_AGENT_URL,
  WALCERT_AGENT_FAMILY_LISTING_URL,
  WALCERT_AGENT_CITY_URL,
  WALCERT_CDP_BAZAAR_URL,
  WALCERT_ERC8257_TOOLS_BASE,
  WALCERT_ERC8257_TOOLS_ETH,
  WALCERT_ERC8257_MANIFEST_ORIGINS_URL,
} from '@/content/walcert/copy';

export const walcertDevelopersCopy = {
  seo: {
    title: {
      es: 'Walcert — Referencia para developers',
      en: 'Walcert — Developer reference',
    } satisfies Bilingual,
    description: {
      es: 'Agent card JSON, preview gratis, certificados x402 en Celo y Base, POST /v1/verify, tools ERC-8257 y listings (Virtuals ACP, Agent.family, Agent City, CDP Bazaar). Base URL walcert.globalscoreagent.com.',
      en: 'Agent card JSON, free preview, x402 certificates on Celo and Base, POST /v1/verify, ERC-8257 tools, and listings (Virtuals ACP, Agent.family, Agent City, CDP Bazaar). Base URL walcert.globalscoreagent.com.',
    } satisfies Bilingual,
  },
  hero: {
    title: {
      es: 'Referencia técnica — Walcert',
      en: 'Technical reference — Walcert',
    } satisfies Bilingual,
    subtitle: {
      es: 'Cómo llamar al agente desde otro agente o cliente HTTP. Sin secretos de operación: solo superficie pública.',
      en: 'How to call the agent from another agent or HTTP client. No ops secrets — public surface only.',
    } satisfies Bilingual,
    baseUrlLabel: { es: 'Base URL (API)', en: 'Base URL (API)' } satisfies Bilingual,
    baseUrl: WALCERT_LIVE_URL,
    baseUrlHint: {
      es: 'GET / devolvé el agent card JSON bilingüe (discovery). No es el dashboard humano de GSA.',
      en: 'GET / returns the bilingual agent card JSON (discovery). Not the GSA human dashboard.',
    } satisfies Bilingual,
    openAgentCard: {
      es: 'Ver agent card (JSON)',
      en: 'View agent card (JSON)',
    } satisfies Bilingual,
    backToProduct: {
      es: 'Página de producto',
      en: 'Product page',
    } satisfies Bilingual,
    openAgent: {
      es: 'Probar en el dashboard',
      en: 'Try in the dashboard',
    } satisfies Bilingual,
  },
  endpoints: {
    title: { es: 'Endpoints públicos', en: 'Public endpoints' } satisfies Bilingual,
    intro: {
      es: 'Certificados pagados: `{type}` ∈ origins | activity | multichain | portfolio. Preview gratis: solo origins | activity (Alchemy); multichain/portfolio → 403; rate limit 8 req/IP / 15 min → 429.',
      en: 'Paid certificates: `{type}` ∈ origins | activity | multichain | portfolio. Free preview: origins | activity only (Alchemy); multichain/portfolio → 403; rate limit 8 req/IP / 15 min → 429.',
    } satisfies Bilingual,
    columns: {
      method: { es: 'Método', en: 'Method' } satisfies Bilingual,
      path: { es: 'Path', en: 'Path' } satisfies Bilingual,
      auth: { es: 'Auth', en: 'Auth' } satisfies Bilingual,
      delivers: { es: 'Entrega', en: 'Delivers' } satisfies Bilingual,
    },
    rows: [
      {
        method: 'GET',
        path: '/',
        auth: { es: 'Ninguna', en: 'None' },
        delivers: {
          es: 'Agent card JSON bilingüe (discovery ERC-8004)',
          en: 'Bilingual agent card JSON (ERC-8004 discovery)',
        },
      },
      {
        method: 'GET',
        path: '/agent-card.json',
        auth: { es: 'Ninguna', en: 'None' },
        delivers: {
          es: 'Agent Card Concordium CIS-8004 (External Agent #1686)',
          en: 'Concordium CIS-8004 Agent Card (External Agent #1686)',
        },
      },
      {
        method: 'GET',
        path: '/health',
        auth: { es: 'Ninguna', en: 'None' },
        delivers: { es: 'Liveness', en: 'Liveness' },
      },
      {
        method: 'GET',
        path: '/v1/quota',
        auth: { es: 'Ninguna', en: 'None' },
        delivers: {
          es: 'Cupos / estado de providers',
          en: 'Provider quota / status',
        },
      },
      {
        method: 'POST',
        path: '/v1/preview/{type}',
        auth: { es: 'Ninguna', en: 'None' },
        delivers: {
          es: 'Preview gratis (origins/activity); 403/429 según reglas',
          en: 'Free preview (origins/activity); 403/429 per rules',
        },
      },
      {
        method: 'POST',
        path: '/v1/certificates/{type}',
        auth: { es: 'x402', en: 'x402' },
        delivers: {
          es: 'Certificado completo + firma + on-chain (x402 Celo o Base)',
          en: 'Full certificate + signature + on-chain (x402 Celo or Base)',
        },
      },
      {
        method: 'POST',
        path: '/v1/verify',
        auth: { es: 'Ninguna', en: 'None' },
        delivers: {
          es: 'Verifica por tx_hash (BD + Celo + EIP-712); sin x402',
          en: 'Verify by tx_hash (DB + Celo + EIP-712); no x402',
        },
      },
      {
        method: 'GET',
        path: '/.well-known/ai-tool/walcert-{type}.json',
        auth: { es: 'Ninguna', en: 'None' },
        delivers: {
          es: 'Manifest ERC-8257 (origins | activity | multichain | portfolio)',
          en: 'ERC-8257 manifest (origins | activity | multichain | portfolio)',
        },
      },
    ] as {
      method: string;
      path: string;
      auth: Bilingual;
      delivers: Bilingual;
    }[],
  },
  body: {
    title: { es: 'Body de request', en: 'Request body' } satisfies Bilingual,
    intro: {
      es: 'Preview y certificados esperan el mismo JSON:',
      en: 'Preview and certificates expect the same JSON:',
    } satisfies Bilingual,
    example: `{
  "wallet_address": "0x..."
}`,
    verifyIntro: {
      es: 'Verificación pública (`POST /v1/verify`) — solo hace falta el tx_hash del anclaje:',
      en: 'Public verification (`POST /v1/verify`) — only the anchor tx_hash is required:',
    } satisfies Bilingual,
    verifyExample: `{
  "tx_hash": "0x..."
}`,
  },
  x402: {
    title: { es: 'Flujo de pago x402', en: 'x402 payment flow' } satisfies Bilingual,
    intro: {
      es: 'Certificados completos usan el paywall x402 a $0.05 USDC (scheme exact). El cliente elige red en el 402: Celo o Base.',
      en: 'Full certificates use the x402 paywall at $0.05 USDC (exact scheme). The client picks the network in the 402: Celo or Base.',
    } satisfies Bilingual,
    steps: [
      {
        es: 'POST /v1/certificates/{type} sin pago → 402 con options (accepts[0] Base / CDP cuando está activo; accepts[1] Celo).',
        en: 'POST /v1/certificates/{type} without payment → 402 with options (accepts[0] Base / CDP when enabled; accepts[1] Celo).',
      },
      {
        es: 'El cliente firma la autorización EIP-3009 en una red y reintenta con header PAYMENT-SIGNATURE / X-PAYMENT.',
        en: 'Client signs the EIP-3009 authorization on one network and retries with PAYMENT-SIGNATURE / X-PAYMENT.',
      },
      {
        es: 'El agente verifica y liquida vía el facilitador de esa red → 200 + certificado. El anclaje giveFeedback sigue en Celo.',
        en: 'Agent verifies and settles via that network facilitator → 200 + certificate. The giveFeedback anchor remains on Celo.',
      },
    ] as Bilingual[],
    note: {
      es: 'Preview (/v1/preview/{type}): solo origins/activity, gratis, 8 req/IP / 15 min. Facilitadores: api.x402.celo.org (Celo) y CDP (Base). Un settle Celo no indexa CDP Bazaar.',
      en: 'Preview (/v1/preview/{type}): origins/activity only, free, 8 req/IP / 15 min. Facilitators: api.x402.celo.org (Celo) and CDP (Base). A Celo settlement does not index CDP Bazaar.',
    } satisfies Bilingual,
  },
  erc8257: {
    title: { es: 'Tools ERC-8257', en: 'ERC-8257 tools' } satisfies Bilingual,
    intro: {
      es: 'Los cuatro certificados pagados están registrados como tools en el Agent Tool Registry (ERC-8257) en Base y Ethereum. Un tool por certificado; el cobro es x402 en el endpoint. Sin predicados NFT / subscription.',
      en: 'The four paid certificates are registered as tools in the Agent Tool Registry (ERC-8257) on Base and Ethereum. One tool per certificate; billing is x402 at the endpoint. No NFT / subscription predicates.',
    } satisfies Bilingual,
    facts: [
      {
        label: { es: 'Base (8453)', en: 'Base (8453)' },
        value: {
          es: `toolId ${WALCERT_ERC8257_TOOLS_BASE}`,
          en: `toolId ${WALCERT_ERC8257_TOOLS_BASE}`,
        },
      },
      {
        label: { es: 'Ethereum (1)', en: 'Ethereum (1)' },
        value: {
          es: `toolId ${WALCERT_ERC8257_TOOLS_ETH}`,
          en: `toolId ${WALCERT_ERC8257_TOOLS_ETH}`,
        },
      },
    ] as { label: Bilingual; value: Bilingual }[],
    rows: [
      {
        slug: 'walcert-origins',
        ids: { es: 'Base 485 · Eth 163', en: 'Base 485 · Eth 163' },
      },
      {
        slug: 'walcert-activity',
        ids: { es: 'Base 486 · Eth 164', en: 'Base 486 · Eth 164' },
      },
      {
        slug: 'walcert-multichain',
        ids: { es: 'Base 487 · Eth 165', en: 'Base 487 · Eth 165' },
      },
      {
        slug: 'walcert-portfolio',
        ids: { es: 'Base 488 · Eth 166', en: 'Base 488 · Eth 166' },
      },
    ] as { slug: string; ids: Bilingual }[],
    manifestLabel: {
      es: 'Manifest (ejemplo Origins)',
      en: 'Manifest (Origins example)',
    } satisfies Bilingual,
    manifestHref: WALCERT_ERC8257_MANIFEST_ORIGINS_URL,
    note: {
      es: 'Manifests: GET /.well-known/ai-tool/walcert-{origins|activity|multichain|portfolio}.json en el mismo origin del agente.',
      en: 'Manifests: GET /.well-known/ai-tool/walcert-{origins|activity|multichain|portfolio}.json on the agent origin.',
    } satisfies Bilingual,
  },
  paidPayload: {
    title: {
      es: 'Qué incluye el certificado pagado',
      en: 'What the paid certificate includes',
    } satisfies Bilingual,
    items: [
      {
        es: 'Nota A–F y textos bilingües completos (summary, strengths, concerns).',
        en: 'A–F grade and full bilingual texts (summary, strengths, concerns).',
      },
      {
        es: 'Campo de marca GSA (provider) dentro del certificate.',
        en: 'GSA brand field (provider) inside the certificate.',
      },
      {
        es: 'signature — firma EIP-712 sobre el data_hash.',
        en: 'signature — EIP-712 signature over data_hash.',
      },
      {
        es: 'onchain — anclaje giveFeedback en el Reputation Registry (Celo).',
        en: 'onchain — giveFeedback anchor on the Reputation Registry (Celo).',
      },
      {
        es: 'Verificable después con POST /v1/verify (tx_hash) o en el dashboard GSA.',
        en: 'Verifiable afterwards via POST /v1/verify (tx_hash) or the GSA dashboard.',
      },
    ] as Bilingual[],
  },
  links: {
    title: { es: 'Documentación técnica', en: 'Technical documentation' } satisfies Bilingual,
    intro: {
      es: 'Detalle de schemas, deploy y scoring vive en el repo del agente — no lo duplicamos aquí.',
      en: 'Schemas, deploy, and scoring detail live in the agent repo — we do not duplicate them here.',
    } satisfies Bilingual,
    items: [
      {
        label: { es: 'README del agente', en: 'Agent README' },
        href: `${WALCERT_REPO_URL}/blob/main/README.md`,
      },
      {
        label: {
          es: 'Agent Card Concordium (JSON)',
          en: 'Concordium Agent Card (JSON)',
        },
        href: WALCERT_AGENT_CARD_CONCORDIUM_URL,
      },
      {
        label: {
          es: 'Concordium Agent Registry',
          en: 'Concordium Agent Registry',
        },
        href: WALCERT_CONCORDIUM_REGISTRY_URL,
      },
      {
        label: {
          es: 'Virtuals ACP — ficha Walcert',
          en: 'Virtuals ACP — Walcert listing',
        },
        href: WALCERT_VIRTUALS_ACP_AGENT_URL,
      },
      {
        label: {
          es: 'Agent.family — listing Instant-buyable',
          en: 'Agent.family — Instant-buyable listing',
        },
        href: WALCERT_AGENT_FAMILY_LISTING_URL,
      },
      {
        label: {
          es: 'Agent City',
          en: 'Agent City',
        },
        href: WALCERT_AGENT_CITY_URL,
      },
      {
        label: {
          es: 'CDP Bazaar — ficha agentic.market',
          en: 'CDP Bazaar — agentic.market listing',
        },
        href: WALCERT_CDP_BAZAAR_URL,
      },
      {
        label: {
          es: 'Docs ERC-8257 tools (repo)',
          en: 'ERC-8257 tools docs (repo)',
        },
        href: `${WALCERT_REPO_URL}/blob/main/docs/erc8257-tools.md`,
      },
      {
        label: {
          es: 'Docs CDP Bazaar (repo)',
          en: 'CDP Bazaar docs (repo)',
        },
        href: `${WALCERT_REPO_URL}/blob/main/docs/cdp-bazaar.md`,
      },
      {
        label: {
          es: 'Docs Concordium CIS-8004 (repo)',
          en: 'Concordium CIS-8004 docs (repo)',
        },
        href: `${WALCERT_REPO_URL}/blob/main/docs/concordium-cis8004.md`,
      },
      {
        label: {
          es: 'Docs Virtuals ACP (repo)',
          en: 'Virtuals ACP docs (repo)',
        },
        href: `${WALCERT_REPO_URL}/blob/main/docs/virtuals-acp.md`,
      },
      {
        label: { es: 'Certificados (ES)', en: 'Certificates (ES)' },
        href: `${WALCERT_REPO_URL}/blob/main/docs/certificados-es.md`,
      },
      {
        label: { es: 'Certificates (EN)', en: 'Certificates (EN)' },
        href: `${WALCERT_REPO_URL}/blob/main/docs/certificates-en.md`,
      },
      {
        label: { es: 'JSON schemas', en: 'JSON schemas' },
        href: `${WALCERT_REPO_URL}/blob/main/docs/certificate-json-schemas.md`,
      },
      {
        label: { es: 'Deployment guide', en: 'Deployment guide' },
        href: `${WALCERT_REPO_URL}/blob/main/docs/deployment-guide.md`,
      },
    ] as { label: Bilingual; href: string }[],
  },
  cta: {
    title: {
      es: 'Listo para integrar',
      en: 'Ready to integrate',
    } satisfies Bilingual,
    description: {
      es: 'Empezá con GET / (agent card), un preview o POST /v1/verify; para el certificado completo seguí el flujo x402.',
      en: 'Start with GET / (agent card), a preview, or POST /v1/verify; for the full certificate follow the x402 flow.',
    } satisfies Bilingual,
    openAgent: {
      es: 'Probar en el dashboard',
      en: 'Try in the dashboard',
    } satisfies Bilingual,
    productPage: {
      es: 'Volver a la página de producto',
      en: 'Back to product page',
    } satisfies Bilingual,
  },
} as const;
