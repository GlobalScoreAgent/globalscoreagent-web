import type { Bilingual } from '@/content/marketing/i18n';

export const WALCERT_LIVE_URL = 'https://walcert.globalscoreagent.com';
export const WALCERT_EXPLORER_URL =
  'https://erc-8004.quicknode.com/agents/celo-mainnet/9699';
export const WALCERT_AGENT_ID = '9699';
export const WALCERT_CHAIN = 'Celo mainnet (eip155:42220)';
export const WALCERT_REPO_URL = 'https://github.com/GlobalScoreAgent/walcert-agent';

export type WalcertCertificateType = {
  id: 'origins' | 'activity' | 'multichain' | 'portfolio';
  title: Bilingual;
  summary: Bilingual;
  dataSource: Bilingual;
};

export const walcertCopy = {
  seo: {
    title: {
      es: 'Walcert Agent — Certificados de madurez de wallets',
      en: 'Walcert Agent — Wallet maturity certificates',
    } satisfies Bilingual,
    description: {
      es: 'Agente autónomo ERC-8004 que emite certificados A–F de madurez de wallets (origins, activity, multichain, portfolio). Preview gratis (origins/activity); certificado firmado y anclado on-chain vía x402 en Celo.',
      en: 'Autonomous ERC-8004 agent issuing A–F wallet maturity certificates (origins, activity, multichain, portfolio). Free preview (origins/activity); signed and on-chain anchored certificates via x402 on Celo.',
    } satisfies Bilingual,
  },
  hero: {
    title: { es: 'Walcert Agent', en: 'Walcert Agent' } satisfies Bilingual,
    subtitle: {
      es: 'Certificados de madurez de wallets con calificación A–F, pensados para consumo agente-a-agente.',
      en: 'Wallet maturity certificates graded A–F, built for agent-to-agent consumption.',
    } satisfies Bilingual,
    badge: {
      es: 'ERC-8004 · Celo · agentId 9699 · En producción',
      en: 'ERC-8004 · Celo · agentId 9699 · Live in production',
    } satisfies Bilingual,
    openAgent: {
      es: 'Probar en el dashboard',
      en: 'Try in the dashboard',
    } satisfies Bilingual,
    forDevelopers: {
      es: 'Guía para developers',
      en: 'Developer guide',
    } satisfies Bilingual,
    backToPortal: { es: 'Volver al portal', en: 'Back to portal' } satisfies Bilingual,
  },
  problem: {
    title: {
      es: 'Madurez de wallet, sin fricción entre agentes',
      en: 'Wallet maturity without friction between agents',
    } satisfies Bilingual,
    intro: {
      es: 'Antes de interactuar, un agente necesita señales claras sobre la wallet: origen de fondos, actividad reciente, presencia multi-chain y composición del portfolio. Walcert convierte ese análisis en certificados estandarizados A–F, consumibles por HTTP JSON.',
      en: 'Before interacting, an agent needs clear signals about a wallet: funding origins, recent activity, multi-chain presence, and portfolio composition. Walcert turns that analysis into standardized A–F certificates, consumable over HTTP JSON.',
    } satisfies Bilingual,
    points: [
      {
        es: 'Hot-analysis en tiempo real — no es un score diario agregado como HUMI/WAMI.',
        en: 'Real-time hot-analysis — not a daily aggregated score like HUMI/WAMI.',
      },
      {
        es: 'Diseñado para agent-to-agent: preview gratis y certificado pagado vía x402.',
        en: 'Built for agent-to-agent: free preview and paid certificate via x402.',
      },
      {
        es: 'Parte del ecosistema Global Score Agent — powered by GSA.',
        en: 'Part of the Global Score Agent ecosystem — powered by GSA.',
      },
    ] as Bilingual[],
  },
  certificates: {
    title: {
      es: 'Cuatro certificados A–F',
      en: 'Four A–F certificates',
    } satisfies Bilingual,
    intro: {
      es: 'Cada tipo evalúa una dimensión distinta de la wallet. La nota va de A (más sólido) a F (mayor riesgo / menor madurez).',
      en: 'Each type evaluates a different wallet dimension. Grades run from A (strongest) to F (higher risk / lower maturity).',
    } satisfies Bilingual,
    types: [
      {
        id: 'origins',
        title: { es: 'Origins', en: 'Origins' },
        summary: {
          es: 'Origen de fondos (CEX, bridges, mixers, OFAC) y riesgo de mixing.',
          en: 'Funding origins (CEX, bridges, mixers, OFAC) and mixing risk.',
        },
        dataSource: { es: 'Alchemy + labels GSA', en: 'Alchemy + GSA labels' },
      },
      {
        id: 'activity',
        title: { es: 'Activity', en: 'Activity' },
        summary: {
          es: 'Actividad reciente (~7 días), contrapartes y patrones wash / circular.',
          en: 'Recent activity (~7 days), counterparties, and wash / circular patterns.',
        },
        dataSource: { es: 'Alchemy + labels GSA', en: 'Alchemy + GSA labels' },
      },
      {
        id: 'multichain',
        title: { es: 'Multichain', en: 'Multichain' },
        summary: {
          es: 'Presencia multi-red, consistencia y longevidad across chains.',
          en: 'Multi-network presence, consistency, and longevity across chains.',
        },
        dataSource: { es: 'Moralis (+ Celo merge)', en: 'Moralis (+ Celo merge)' },
      },
      {
        id: 'portfolio',
        title: { es: 'Portfolio', en: 'Portfolio' },
        summary: {
          es: 'Composición, liquidez y concentración (HHI).',
          en: 'Composition, liquidity, and concentration (HHI).',
        },
        dataSource: { es: 'Zerion', en: 'Zerion' },
      },
    ] as WalcertCertificateType[],
  },
  previewVsPaid: {
    title: {
      es: 'Preview gratis vs certificado completo',
      en: 'Free preview vs full certificate',
    } satisfies Bilingual,
    intro: {
      es: 'El preview gratis solo cubre origins y activity (Alchemy), con rate limit por IP. El certificado pagado añade los 4 tipos, marca GSA, firma criptográfica y anclaje on-chain.',
      en: 'Free preview covers only origins and activity (Alchemy), with a per-IP rate limit. The paid certificate adds all 4 types, GSA branding, a cryptographic signature, and an on-chain anchor.',
    } satisfies Bilingual,
    columns: {
      feature: { es: 'Qué incluye', en: 'What you get' } satisfies Bilingual,
      preview: { es: 'Preview', en: 'Preview' } satisfies Bilingual,
      paid: { es: 'Certificado', en: 'Certificate' } satisfies Bilingual,
    },
    rows: [
      {
        feature: { es: 'Tipos', en: 'Types' },
        preview: {
          es: 'Solo origins / activity',
          en: 'origins / activity only',
        },
        paid: { es: 'Los 4 tipos', en: 'All 4 types' },
      },
      {
        feature: { es: 'Precio', en: 'Price' },
        preview: {
          es: 'Gratis (8 req/IP / 15 min)',
          en: 'Free (8 req/IP / 15 min)',
        },
        paid: { es: '$0.05 USDC (x402)', en: '$0.05 USDC (x402)' },
      },
      {
        feature: { es: 'Nota A–F', en: 'A–F grade' },
        preview: { es: 'Sí', en: 'Yes' },
        paid: { es: 'Sí', en: 'Yes' },
      },
      {
        feature: { es: 'Textos bilingües', en: 'Bilingual texts' },
        preview: { es: 'Reducido', en: 'Reduced' },
        paid: { es: 'Completo', en: 'Full' },
      },
      {
        feature: { es: 'Marca GSA (provider)', en: 'GSA brand (provider)' },
        preview: { es: 'No', en: 'No' },
        paid: { es: 'Sí', en: 'Yes' },
      },
      {
        feature: { es: 'Firma EIP-712', en: 'EIP-712 signature' },
        preview: { es: 'No', en: 'No' },
        paid: { es: 'Sí', en: 'Yes' },
      },
      {
        feature: { es: 'Anclaje on-chain (giveFeedback)', en: 'On-chain anchor (giveFeedback)' },
        preview: { es: 'No', en: 'No' },
        paid: { es: 'Sí', en: 'Yes' },
      },
    ] as { feature: Bilingual; preview: Bilingual; paid: Bilingual }[],
  },
  identity: {
    title: {
      es: 'Identidad on-chain',
      en: 'On-chain identity',
    } satisfies Bilingual,
    intro: {
      es: 'Walcert está registrado como agente ERC-8004 en Celo mainnet.',
      en: 'Walcert is registered as an ERC-8004 agent on Celo mainnet.',
    } satisfies Bilingual,
    rows: [
      {
        label: { es: 'Chain', en: 'Chain' },
        value: { es: WALCERT_CHAIN, en: WALCERT_CHAIN },
      },
      {
        label: { es: 'agentId', en: 'agentId' },
        value: { es: WALCERT_AGENT_ID, en: WALCERT_AGENT_ID },
      },
      {
        label: { es: 'Agent card / API', en: 'Agent card / API' },
        value: {
          es: 'walcert.globalscoreagent.com (JSON)',
          en: 'walcert.globalscoreagent.com (JSON)',
        },
        href: WALCERT_LIVE_URL,
        external: true,
      },
      {
        label: { es: 'Dashboard GSA', en: 'GSA Dashboard' },
        value: {
          es: 'globalscoreagent.com/dashboard/walcert',
          en: 'globalscoreagent.com/dashboard/walcert',
        },
        href: '/dashboard/walcert',
        authRedirect: true,
      },
      {
        label: { es: 'Explorer / directory', en: 'Explorer / directory' },
        value: {
          es: 'erc-8004.quicknode.com · Celo · 9699',
          en: 'erc-8004.quicknode.com · Celo · 9699',
        },
        href: WALCERT_EXPLORER_URL,
      },
    ] as {
      label: Bilingual;
      value: Bilingual;
      href?: string;
      authRedirect?: boolean;
      external?: boolean;
    }[],
    hackathon: {
      es: 'Hackathon Celo Agentic Payments & DeFAI — Track 2 (Most x402 Payments).',
      en: 'Celo Agentic Payments & DeFAI hackathon — Track 2 (Most x402 Payments).',
    } satisfies Bilingual,
  },
  verifiability: {
    title: {
      es: 'Verificabilidad',
      en: 'Verifiability',
    } satisfies Bilingual,
    intro: {
      es: 'Los certificados pagados no son solo un JSON: llevan autenticidad criptográfica y rastro on-chain. Cualquiera puede verificarlos con el tx_hash del anclaje — vía API o en el dashboard GSA.',
      en: 'Paid certificates are more than JSON: they carry cryptographic authenticity and an on-chain trail. Anyone can verify them with the anchor tx_hash — via API or the GSA dashboard.',
    } satisfies Bilingual,
    layers: [
      {
        title: { es: 'Firma EIP-712', en: 'EIP-712 signature' },
        body: {
          es: 'Autenticidad instantánea sobre el hash del certificado, sin gas para quien verifica.',
          en: 'Instant authenticity over the certificate hash — no gas for the verifier.',
        },
      },
      {
        title: { es: 'Anclaje ERC-8004', en: 'ERC-8004 anchor' },
        body: {
          es: 'giveFeedback en el Reputation Registry con el hash del certificado y el monto pagado — auditable on-chain.',
          en: 'giveFeedback on the Reputation Registry with the certificate hash and paid amount — auditable on-chain.',
        },
      },
      {
        title: { es: 'Verificación pública', en: 'Public verification' },
        body: {
          es: 'Con solo el tx_hash: lookup en registro + confirmación en Celo + check EIP-712. Agentes: POST /v1/verify. Humanos: dashboard GSA.',
          en: 'With only the tx_hash: registry lookup + Celo confirmation + EIP-712 check. Agents: POST /v1/verify. Humans: GSA dashboard.',
        },
      },
    ] as { title: Bilingual; body: Bilingual }[],
    verifyCta: {
      es: 'Verificar un certificado en el dashboard',
      en: 'Verify a certificate in the dashboard',
    } satisfies Bilingual,
  },
  cta: {
    title: {
      es: 'Probá Walcert en el dashboard',
      en: 'Try Walcert in the dashboard',
    } satisfies Bilingual,
    description: {
      es: 'Generá un preview live, verificá un certificado por tx_hash, explorá ejemplos, o leé la referencia HTTP/x402 para agentes.',
      en: 'Generate a live preview, verify a certificate by tx_hash, explore examples, or read the HTTP/x402 reference for agents.',
    } satisfies Bilingual,
    openAgent: {
      es: 'Probar en el dashboard',
      en: 'Try in the dashboard',
    } satisfies Bilingual,
    developers: {
      es: 'Referencia para developers',
      en: 'Developer reference',
    } satisfies Bilingual,
    backToPortal: { es: 'Volver al portal', en: 'Back to portal' } satisfies Bilingual,
  },
  /** Compact fields for home product card */
  card: {
    name: { es: 'Walcert Agent', en: 'Walcert Agent' } satisfies Bilingual,
    subtitle: {
      es: 'Certificados A–F · Wallets · Agente autónomo',
      en: 'A–F certificates · Wallets · Autonomous agent',
    } satisfies Bilingual,
    description: {
      es: 'Agente ERC-8004 en Celo que emite certificados de madurez de wallets (origins, activity, multichain, portfolio). Preview gratis; certificado firmado vía x402.',
      en: 'ERC-8004 agent on Celo issuing wallet maturity certificates (origins, activity, multichain, portfolio). Free preview; signed certificate via x402.',
    } satisfies Bilingual,
    question: {
      es: '¿Qué tan madura y legítima es esta wallet antes de interactuar?',
      en: 'How mature and legitimate is this wallet before you interact?',
    } satisfies Bilingual,
    cta: { es: 'Probar en el dashboard', en: 'Try in the dashboard' } satisfies Bilingual,
    certLabel: { es: 'Certificados', en: 'Certificates' } satisfies Bilingual,
  },
} as const;
