import type { Bilingual } from '@/content/marketing/i18n';
import {
  WALCERT_LIVE_URL,
  WALCERT_REPO_URL,
} from '@/content/walcert/copy';

export const walcertDevelopersCopy = {
  seo: {
    title: {
      es: 'Walcert — Referencia para developers',
      en: 'Walcert — Developer reference',
    } satisfies Bilingual,
    description: {
      es: 'Agent card JSON, preview gratis, certificados x402, POST /v1/verify y verificabilidad on-chain. Base URL walcert.globalscoreagent.com.',
      en: 'Agent card JSON, free preview, x402 certificates, POST /v1/verify, and on-chain verifiability. Base URL walcert.globalscoreagent.com.',
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
          es: 'Agent card JSON bilingüe (discovery)',
          en: 'Bilingual agent card JSON (discovery)',
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
          es: 'Certificado completo + firma + on-chain',
          en: 'Full certificate + signature + on-chain',
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
      es: 'Certificados completos usan el paywall estándar x402 en Celo mainnet ($0.05 USDC, scheme exact).',
      en: 'Full certificates use the standard x402 paywall on Celo mainnet ($0.05 USDC, exact scheme).',
    } satisfies Bilingual,
    steps: [
      {
        es: 'POST /v1/certificates/{type} sin pago → respuesta 402 con requirements.',
        en: 'POST /v1/certificates/{type} without payment → 402 with requirements.',
      },
      {
        es: 'El cliente firma la autorización EIP-3009 y reintenta con header X-PAYMENT.',
        en: 'Client signs the EIP-3009 authorization and retries with X-PAYMENT header.',
      },
      {
        es: 'El agente verifica y liquida vía facilitador → 200 + certificado.',
        en: 'Agent verifies and settles via facilitator → 200 + certificate.',
      },
    ] as Bilingual[],
    note: {
      es: 'Preview (/v1/preview/{type}): solo origins/activity, gratis, 8 req/IP / 15 min. Facilitador x402: api.x402.celo.org (mainnet).',
      en: 'Preview (/v1/preview/{type}): origins/activity only, free, 8 req/IP / 15 min. x402 facilitator: api.x402.celo.org (mainnet).',
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
