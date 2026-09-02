import type { Bilingual } from '@/content/marketing/i18n';

export const WALCERT_LIVE_URL = 'https://walcert.globalscoreagent.com';
export const WALCERT_AGENT_CARD_CONCORDIUM_URL =
  'https://walcert.globalscoreagent.com/agent-card.json';
export const WALCERT_EXPLORER_URL =
  'https://erc-8004.quicknode.com/agents/celo-mainnet/9699';
export const WALCERT_AGENT_ID = '9699';
export const WALCERT_CHAIN = 'Celo mainnet (eip155:42220)';
export const WALCERT_REPO_URL = 'https://github.com/MichBarbarian/walcert-agent';
export const WALCERT_CONCORDIUM_TOKEN_ID = '1686';
export const WALCERT_CONCORDIUM_REGISTRY_URL =
  'https://agent-registry.concordium.com/';
export const WALCERT_CONCORDIUM_ABOUT_URL = 'https://www.concordium.com/';
export const WALCERT_VIRTUALS_ACP_PROVIDER_ID =
  '019f917a-9ad6-7fc5-b52f-bf80864f5704';
export const WALCERT_VIRTUALS_ACP_AGENT_URL = `https://app.virtuals.io/acp/agent/${WALCERT_VIRTUALS_ACP_PROVIDER_ID}`;
export const WALCERT_VIRTUALS_ABOUT_URL = 'https://www.virtuals.io/';
export const WALCERT_BASE_ERC8004_AGENT_ID = '59768';
export const WALCERT_BASE_CHAIN = 'Base mainnet (eip155:8453)';
export const WALCERT_BASE_EXPLORER_URL =
  'https://erc-8004.quicknode.com/agents/base-mainnet/59768';
export const WALCERT_ETH_ERC8004_AGENT_ID = '50032';
export const WALCERT_ETH_CHAIN = 'Ethereum mainnet';
export const WALCERT_ETH_IDENTITY_TX_URL =
  'https://etherscan.io/tx/0x203de8fe65db17faaf7b210fe1e9022ec089d123e43a81e1dfc02a77ad2887a7';
export const WALCERT_AGENT_CITY_URL = 'https://agentcity.freaks.one/';
export const WALCERT_AGENT_CITY_ABOUT_URL = 'https://agentcity.freaks.one/how';
export const WALCERT_BNB_ERC8004_AGENT_ID = '265982';
export const WALCERT_BNB_CHAIN = 'BNB Smart Chain';
export const WALCERT_AGENT_FAMILY_LISTING_URL =
  'https://www.agent.family/listing?id=cmsr131ybcoo6v001vdkw7any';
export const WALCERT_AGENT_FAMILY_ABOUT_URL = 'https://www.agent.family/';
export const WALCERT_BNB_MINT_TX_URL =
  'https://bscscan.com/tx/0xa5a93ab7bc18e36a94a371f71200d15c6b1d5e1fe28a98735c65ab9c8f901fa8';
export const WALCERT_BNB_RECEIPT_CONTRACT =
  '0x4e430fB5A5f26ED08eC123373Cd8AD3cE15C24c7';
export const WALCERT_BNB_RECEIPT_CONTRACT_URL = `https://bscscan.com/address/${WALCERT_BNB_RECEIPT_CONTRACT}`;
export const WALCERT_BNB_X402_DOCS_URL = `${WALCERT_REPO_URL}/blob/main/docs/bnb-x402-receipt.md`;
export const WALCERT_CDP_BAZAAR_URL =
  'https://agentic.market/services/walcert-globalscoreagent-com';
export const WALCERT_CDP_BAZAAR_ABOUT_URL = 'https://agentic.market';
export const WALCERT_AIGORA_ABOUT_URL = 'https://aigora.org';
export const WALCERT_AIGORA_PROFILE_URL =
  'https://aigora.org/services/42220_0x8004a169fb4a3325136eb29fa0ceb6d2e539a432_9699';
export const WALCERT_ERC8257_TOOLS_BASE = '485–488';
export const WALCERT_ERC8257_TOOLS_ETH = '163–166';
export const WALCERT_ERC8257_MANIFEST_ORIGINS_URL = `${WALCERT_LIVE_URL}/.well-known/ai-tool/walcert-origins.json`;

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
      es: 'Agente ERC-8004 en Celo (9699), Base (59768), Ethereum (50032) y BNB (265982), más CIS-8004 en Concordium (#1686). Certificados A–F; x402 en Celo, Base y BNB; Virtuals ACP, Agent.family, Agent City, CDP Bazaar y Aigora.',
      en: 'ERC-8004 agent on Celo (9699), Base (59768), Ethereum (50032), and BNB (265982), plus CIS-8004 on Concordium (#1686). A–F certificates; x402 on Celo, Base, and BNB; Virtuals ACP, Agent.family, Agent City, CDP Bazaar, and Aigora.',
    } satisfies Bilingual,
    keywords: [
      'Walcert',
      'ERC-8004',
      'wallet maturity',
      'x402',
      'Celo 9699',
      'Base 59768',
      'BNB 265982',
      'Aigora',
      'GoldRush',
      'HUMI',
      'Global Score Agent',
      'agent certificates',
    ],
  },
  hero: {
    title: { es: 'Walcert Agent', en: 'Walcert Agent' } satisfies Bilingual,
    subtitle: {
      es: 'Certificados de madurez de wallets con calificación A–F, pensados para consumo agente-a-agente.',
      en: 'Wallet maturity certificates graded A–F, built for agent-to-agent consumption.',
    } satisfies Bilingual,
    badge: {
      es: 'Celo 9699 · Base 59768 · Eth 50032 · BNB 265982 · Concordium #1686 · En producción',
      en: 'Celo 9699 · Base 59768 · Eth 50032 · BNB 265982 · Concordium #1686 · Live in production',
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
      es: 'Antes de interactuar, un agente necesita señales claras sobre la wallet: origen de fondos, actividad reciente (ventana de 15 días), footprint multi-chain y composición del portfolio. Walcert convierte ese análisis en certificados estandarizados A–F, consumibles por HTTP JSON.',
      en: 'Before interacting, an agent needs clear signals about a wallet: funding origins, recent activity (15-day window), multi-chain footprint, and portfolio composition. Walcert turns that analysis into standardized A–F certificates, consumable over HTTP JSON.',
    } satisfies Bilingual,
    points: [
      {
        es: 'Hot-analysis en tiempo real — no es un score diario agregado como HUMI/WAMI.',
        en: 'Real-time hot-analysis — not a daily aggregated score like HUMI/WAMI.',
      },
      {
        es: 'Diseñado para agent-to-agent: preview gratis, certificado vía x402 en Celo, Base y BNB, y presencia en marketplaces de agentes.',
        en: 'Built for agent-to-agent: free preview, certificate via x402 on Celo, Base, and BNB, and presence on agent marketplaces.',
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
          es: 'Fondeo multi-chain con señales ORIGO: CEX, bridges, mixers, OFAC, concentración (HHI) y riesgo de mixing — scoring A–F explicable.',
          en: 'Multi-chain funding with ORIGO signals: CEX, bridges, mixers, OFAC, concentration (HHI), and mixing risk — explainable A–F scoring.',
        },
        dataSource: {
          es: 'Alchemy + DefiLlama + labels GSA',
          en: 'Alchemy + DefiLlama + GSA labels',
        },
      },
      {
        id: 'activity',
        title: { es: 'Activity', en: 'Activity' },
        summary: {
          es: 'Actividad en ventana de 15 días: contrapartes, HHI, wash / bot-like, reciprocity y velocity.',
          en: 'Activity over a 15-day window: counterparties, HHI, wash / bot-like, reciprocity, and velocity.',
        },
        dataSource: {
          es: 'Alchemy + DefiLlama + labels GSA',
          en: 'Alchemy + DefiLlama + GSA labels',
        },
      },
      {
        id: 'multichain',
        title: { es: 'Multichain', en: 'Multichain' },
        summary: {
          es: 'Footprint y longevidad multi-red (GoldRush v2.1): recencia, consistencia, ecosistemas core, span e intensidad — sin depender de Moralis.',
          en: 'Multi-network footprint and longevity (GoldRush v2.1): recency, consistency, core ecosystems, span, and intensity — no Moralis dependency.',
        },
        dataSource: { es: 'GoldRush (Covalent)', en: 'GoldRush (Covalent)' },
      },
      {
        id: 'portfolio',
        title: { es: 'Portfolio', en: 'Portfolio' },
        summary: {
          es: 'Composición, liquidez y concentración; calidad por tiers; filtrado spam/dust (totales usable vs credible).',
          en: 'Composition, liquidity, and concentration; tier quality; spam/dust filtering (usable vs credible totals).',
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
        paid: {
          es: '$0.05 USDC (x402 · Celo, Base o BNB)',
          en: '$0.05 USDC (x402 · Celo, Base, or BNB)',
        },
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
      es: 'Walcert tiene cinco registros complementarios: ERC-8004 en Celo, Base, Ethereum y BNB, más CIS-8004 en Concordium. No se reemplazan entre sí.',
      en: 'Walcert has five complementary registrations: ERC-8004 on Celo, Base, Ethereum, and BNB, plus CIS-8004 on Concordium. They do not replace each other.',
    } satisfies Bilingual,
    groups: [
      {
        title: {
          es: 'Celo · ERC-8004',
          en: 'Celo · ERC-8004',
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
            label: { es: 'Uso', en: 'Role' },
            value: {
              es: 'Emisión de certificados + x402 Celo + Aigora',
              en: 'Certificate issuance + x402 on Celo + Aigora',
            },
          },
          {
            label: { es: 'Discovery / API', en: 'Discovery / API' },
            value: {
              es: 'walcert.globalscoreagent.com (JSON)',
              en: 'walcert.globalscoreagent.com (JSON)',
            },
            href: WALCERT_LIVE_URL,
            external: true,
          },
          {
            label: { es: 'Aigora', en: 'Aigora' },
            value: {
              es: 'aigora.org · Celo · 9699',
              en: 'aigora.org · Celo · 9699',
            },
            href: WALCERT_AIGORA_PROFILE_URL,
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
        ],
      },
      {
        title: {
          es: 'Base · ERC-8004',
          en: 'Base · ERC-8004',
        } satisfies Bilingual,
        rows: [
          {
            label: { es: 'Chain', en: 'Chain' },
            value: { es: WALCERT_BASE_CHAIN, en: WALCERT_BASE_CHAIN },
          },
          {
            label: { es: 'agentId', en: 'agentId' },
            value: {
              es: WALCERT_BASE_ERC8004_AGENT_ID,
              en: WALCERT_BASE_ERC8004_AGENT_ID,
            },
          },
          {
            label: { es: 'Uso', en: 'Role' },
            value: {
              es: 'Identidad Virtuals ACP + x402 Base',
              en: 'Virtuals ACP identity + x402 on Base',
            },
          },
          {
            label: { es: 'Ficha ACP', en: 'ACP listing' },
            value: {
              es: 'app.virtuals.io/acp/agent/…',
              en: 'app.virtuals.io/acp/agent/…',
            },
            href: WALCERT_VIRTUALS_ACP_AGENT_URL,
            external: true,
          },
          {
            label: { es: 'Explorer / directory', en: 'Explorer / directory' },
            value: {
              es: 'erc-8004.quicknode.com · Base · 59768',
              en: 'erc-8004.quicknode.com · Base · 59768',
            },
            href: WALCERT_BASE_EXPLORER_URL,
          },
        ],
      },
      {
        title: {
          es: 'Ethereum · ERC-8004',
          en: 'Ethereum · ERC-8004',
        } satisfies Bilingual,
        rows: [
          {
            label: { es: 'Chain', en: 'Chain' },
            value: { es: WALCERT_ETH_CHAIN, en: WALCERT_ETH_CHAIN },
          },
          {
            label: { es: 'agentId', en: 'agentId' },
            value: {
              es: WALCERT_ETH_ERC8004_AGENT_ID,
              en: WALCERT_ETH_ERC8004_AGENT_ID,
            },
          },
          {
            label: { es: 'Uso', en: 'Role' },
            value: {
              es: 'Agent City + tools ERC-8257',
              en: 'Agent City + ERC-8257 tools',
            },
          },
          {
            label: { es: 'Agent City', en: 'Agent City' },
            value: {
              es: 'agentcity.freaks.one',
              en: 'agentcity.freaks.one',
            },
            href: WALCERT_AGENT_CITY_URL,
            external: true,
          },
          {
            label: { es: 'Identity tx', en: 'Identity tx' },
            value: {
              es: 'etherscan.io · register 50032',
              en: 'etherscan.io · register 50032',
            },
            href: WALCERT_ETH_IDENTITY_TX_URL,
          },
        ],
      },
      {
        title: {
          es: 'BNB · ERC-8004',
          en: 'BNB · ERC-8004',
        } satisfies Bilingual,
        rows: [
          {
            label: { es: 'Chain', en: 'Chain' },
            value: { es: WALCERT_BNB_CHAIN, en: WALCERT_BNB_CHAIN },
          },
          {
            label: { es: 'agentId', en: 'agentId' },
            value: {
              es: WALCERT_BNB_ERC8004_AGENT_ID,
              en: WALCERT_BNB_ERC8004_AGENT_ID,
            },
          },
          {
            label: { es: 'Uso', en: 'Role' },
            value: {
              es: 'Agent.family + x402 Permit2 + recibo NFT',
              en: 'Agent.family + x402 Permit2 + NFT receipt',
            },
          },
          {
            label: { es: 'Listing', en: 'Listing' },
            value: {
              es: 'agent.family/listing',
              en: 'agent.family/listing',
            },
            href: WALCERT_AGENT_FAMILY_LISTING_URL,
            external: true,
          },
          {
            label: { es: 'Recibo NFT', en: 'NFT receipt' },
            value: {
              es: 'BscScan · claim del pagador',
              en: 'BscScan · payer claim',
            },
            href: WALCERT_BNB_RECEIPT_CONTRACT_URL,
          },
          {
            label: { es: 'Identity tx', en: 'Identity tx' },
            value: {
              es: 'bscscan.com · mint 265982',
              en: 'bscscan.com · mint 265982',
            },
            href: WALCERT_BNB_MINT_TX_URL,
          },
        ],
      },
      {
        title: {
          es: 'Concordium · CIS-8004',
          en: 'Concordium · CIS-8004',
        } satisfies Bilingual,
        rows: [
          {
            label: { es: 'Registro', en: 'Registry' },
            value: {
              es: 'Concordium Agent Registry (CIS-8004)',
              en: 'Concordium Agent Registry (CIS-8004)',
            },
            href: WALCERT_CONCORDIUM_REGISTRY_URL,
            external: true,
          },
          {
            label: { es: 'External Agent', en: 'External Agent' },
            value: {
              es: `#${WALCERT_CONCORDIUM_TOKEN_ID} · Active`,
              en: `#${WALCERT_CONCORDIUM_TOKEN_ID} · Active`,
            },
          },
          {
            label: { es: 'Agent Card', en: 'Agent Card' },
            value: {
              es: 'walcert.globalscoreagent.com/agent-card.json',
              en: 'walcert.globalscoreagent.com/agent-card.json',
            },
            href: WALCERT_AGENT_CARD_CONCORDIUM_URL,
            external: true,
          },
          {
            label: { es: 'Trust signals', en: 'Trust signals' },
            value: {
              es: 'concordium-id-backed · cis8-ownership-proof',
              en: 'concordium-id-backed · cis8-ownership-proof',
            },
          },
        ],
      },
    ] as {
      title: Bilingual;
      rows: {
        label: Bilingual;
        value: Bilingual;
        href?: string;
        authRedirect?: boolean;
        external?: boolean;
      }[];
    }[],
    footnote: {
      es: 'Los certificados firmados y el anclaje giveFeedback siguen en Celo (agentId 9699). Los pagos x402 son $0.05 USDC en Celo, Base y BNB (Permit2 + recibo NFT en BNB). Base 59768 no es solo identidad ACP. Eth 50032 sirve Agent City y tools ERC-8257; BNB 265982, Agent.family. Aigora lista el mismo 9699 en Celo. Concordium aporta accountability ID-backed vía CIS-8 + CIS-8004.',
      en: 'Signed certificates and the giveFeedback anchor remain on Celo (agentId 9699). x402 payments are $0.05 USDC on Celo, Base, and BNB (Permit2 + NFT receipt on BNB). Base 59768 is not ACP identity only. Eth 50032 serves Agent City and ERC-8257 tools; BNB 265982, Agent.family. Aigora lists the same 9699 on Celo. Concordium adds ID-backed accountability via CIS-8 + CIS-8004.',
    } satisfies Bilingual,
    hackathon: {
      es: 'Hackathon Celo Agentic Payments & DeFAI — Track 2 (Most x402 Payments).',
      en: 'Celo Agentic Payments & DeFAI hackathon — Track 2 (Most x402 Payments).',
    } satisfies Bilingual,
  },
  presence: {
    title: {
      es: 'Presencia en el ecosistema',
      en: 'Ecosystem presence',
    } satisfies Bilingual,
    intro: {
      es: 'Además de la identidad on-chain, Walcert está donde los agentes descubren y contratan servicios — marketplaces Celo/Base/BNB/Eth, discovery x402 y accountability ID-backed.',
      en: 'Beyond on-chain identity, Walcert is where agents discover and hire services — Celo/Base/BNB/Eth marketplaces, x402 discovery, and ID-backed accountability.',
    } satisfies Bilingual,
    items: [
      {
        id: 'virtuals-acp',
        date: { es: '24 jul 2026', en: 'Jul 24, 2026' },
        title: {
          es: 'Lanzamiento en Virtuals ACP',
          en: 'Live on Virtuals ACP',
        },
        logo: {
          src: '/virtuals_logo.png',
          alt: { es: 'Virtuals', en: 'Virtuals' },
        },
        about: {
          title: { es: 'Qué es Virtuals', en: 'What is Virtuals' },
          body: {
            es: 'Virtuals es un ecosistema de agentes de IA on-chain. Su Agent Commerce Protocol (ACP) es el marketplace donde agentes descubren, contratan y pagan servicios con escrow.',
            en: 'Virtuals is an on-chain AI agent ecosystem. Its Agent Commerce Protocol (ACP) is the marketplace where agents discover, hire, and pay for services with escrow.',
          },
          href: WALCERT_VIRTUALS_ABOUT_URL,
          linkLabel: {
            es: 'Sitio de Virtuals',
            en: 'Virtuals website',
          },
        },
        body: {
          es: 'Walcert está listado como Provider en ACP: previews, cuatro certificados full y verify, con escrow en Base USDC. El anclaje de cada certificado sigue en Celo ERC-8004 (9699) — rails distintos a propósito.',
          en: 'Walcert is listed as an ACP Provider: previews, four full certificates, and verify, with escrow in Base USDC. Each certificate still anchors on Celo ERC-8004 (9699) — separate rails on purpose.',
        },
        facts: [
          {
            label: { es: 'Provider', en: 'Provider' },
            value: { es: 'Walcert · ACP', en: 'Walcert · ACP' },
          },
          {
            label: { es: 'ERC-8004 Base', en: 'ERC-8004 Base' },
            value: {
              es: `agentId ${WALCERT_BASE_ERC8004_AGENT_ID}`,
              en: `agentId ${WALCERT_BASE_ERC8004_AGENT_ID}`,
            },
          },
        ],
        links: [
          {
            label: {
              es: 'Ficha Walcert en ACP',
              en: 'Walcert ACP listing',
            },
            href: WALCERT_VIRTUALS_ACP_AGENT_URL,
          },
        ],
      },
      {
        id: 'agent-family',
        date: { es: '13 ago 2026', en: 'Aug 13, 2026' },
        title: {
          es: 'Live en Agent.family (TermiX)',
          en: 'Live on Agent.family (TermiX)',
        },
        logo: {
          src: '/agent-family-logo.png',
          alt: { es: 'Agent.family', en: 'Agent.family' },
        },
        about: {
          title: { es: 'Qué es Agent.family', en: 'What is Agent.family' },
          body: {
            es: 'Agent.family (TermiX) es un marketplace de servicios de agentes con listing Instant-buyable. Complementa Virtuals ACP: aquí la superficie es UI; la capa AACP corre por debajo.',
            en: 'Agent.family (TermiX) is an agent-services marketplace with Instant-buyable listings. It complements Virtuals ACP: the surface is UI; the AACP layer runs underneath.',
          },
          href: WALCERT_AGENT_FAMILY_ABOUT_URL,
          linkLabel: {
            es: 'Sitio de Agent.family',
            en: 'Agent.family website',
          },
        },
        body: {
          es: 'Walcert está listado Instant-buyable en BNB (agentId 265982). El emisor de cada certificado sigue siendo el agente Celo 9699.',
          en: 'Walcert is listed Instant-buyable on BNB (agentId 265982). Each certificate is still issued by the Celo 9699 agent.',
        },
        facts: [
          {
            label: { es: 'ERC-8004 BNB', en: 'ERC-8004 BNB' },
            value: {
              es: `agentId ${WALCERT_BNB_ERC8004_AGENT_ID}`,
              en: `agentId ${WALCERT_BNB_ERC8004_AGENT_ID}`,
            },
          },
          {
            label: { es: 'Listing', en: 'Listing' },
            value: { es: 'Instant-buyable', en: 'Instant-buyable' },
          },
        ],
        links: [
          {
            label: {
              es: 'Listing Walcert en Agent.family',
              en: 'Walcert listing on Agent.family',
            },
            href: WALCERT_AGENT_FAMILY_LISTING_URL,
          },
        ],
      },
      {
        id: 'agent-city',
        date: { es: '16 ago 2026', en: 'Aug 16, 2026' },
        title: {
          es: 'Live en Agent City',
          en: 'Live on Agent City',
        },
        logo: {
          src: '/agent-city-logo.png',
          alt: { es: 'Agent City', en: 'Agent City' },
        },
        about: {
          title: { es: 'Qué es Agent City', en: 'What is Agent City' },
          body: {
            es: 'Agent City es un espacio on-chain en Ethereum donde agentes ERC-8004 se registran como ciudadanos y exponen tools en el shop.',
            en: 'Agent City is an on-chain space on Ethereum where ERC-8004 agents register as citizens and expose tools in the shop.',
          },
          href: WALCERT_AGENT_CITY_ABOUT_URL,
          linkLabel: {
            es: 'Cómo funciona Agent City',
            en: 'How Agent City works',
          },
        },
        body: {
          es: 'Walcert está live como ciudadano con lote: agentId 50032 y tools ERC-8257 163–166 (Origins, Activity, Multichain, Portfolio).',
          en: 'Walcert is live as a citizen with a land lot: agentId 50032 and ERC-8257 tools 163–166 (Origins, Activity, Multichain, Portfolio).',
        },
        facts: [
          {
            label: { es: 'ERC-8004 Eth', en: 'ERC-8004 Eth' },
            value: {
              es: `agentId ${WALCERT_ETH_ERC8004_AGENT_ID}`,
              en: `agentId ${WALCERT_ETH_ERC8004_AGENT_ID}`,
            },
          },
          {
            label: { es: 'Tools ERC-8257', en: 'ERC-8257 tools' },
            value: {
              es: `Eth ${WALCERT_ERC8257_TOOLS_ETH}`,
              en: `Eth ${WALCERT_ERC8257_TOOLS_ETH}`,
            },
          },
        ],
        links: [
          {
            label: {
              es: 'Agent City',
              en: 'Agent City',
            },
            href: WALCERT_AGENT_CITY_URL,
          },
        ],
      },
      {
        id: 'cdp-bazaar',
        date: { es: '17 ago 2026', en: 'Aug 17, 2026' },
        title: {
          es: 'Indexado en CDP Bazaar',
          en: 'Indexed on CDP Bazaar',
        },
        logo: {
          src: '/agentic-market-logo.png',
          alt: { es: 'agentic.market', en: 'agentic.market' },
        },
        about: {
          title: { es: 'Qué es CDP Bazaar', en: 'What is CDP Bazaar' },
          body: {
            es: 'CDP Bazaar (agentic.market) es el catálogo de discovery x402 de Coinbase/CDP. Indexa rutas pagadas en Base; no es un marketplace con escrow.',
            en: 'CDP Bazaar (agentic.market) is the Coinbase/CDP x402 discovery catalog. It indexes paid routes on Base; it is not an escrow marketplace.',
          },
          href: WALCERT_CDP_BAZAAR_ABOUT_URL,
          linkLabel: {
            es: 'Sitio de agentic.market',
            en: 'agentic.market website',
          },
        },
        body: {
          es: 'Las cuatro rutas de certificados (Origins, Activity, Multichain, Portfolio) están en la ficha pública a $0.05 USDC en Base. Un settle Celo no indexa ni mantiene el listing.',
          en: 'All four certificate routes (Origins, Activity, Multichain, Portfolio) are on the public listing at $0.05 USDC on Base. A Celo settlement does not index or keep the listing.',
        },
        facts: [
          {
            label: { es: 'Rutas', en: 'Routes' },
            value: { es: '4 certificados A–F', en: '4 A–F certificates' },
          },
          {
            label: { es: 'Pago', en: 'Payment' },
            value: { es: '$0.05 USDC · Base', en: '$0.05 USDC · Base' },
          },
        ],
        links: [
          {
            label: {
              es: 'Ficha Walcert en agentic.market',
              en: 'Walcert listing on agentic.market',
            },
            href: WALCERT_CDP_BAZAAR_URL,
          },
        ],
      },
      {
        id: 'aigora',
        date: { es: '1 sep 2026', en: 'Sep 1, 2026' },
        title: {
          es: 'Live en Aigora (Celo)',
          en: 'Live on Aigora (Celo)',
        },
        logo: {
          src: '/aigora_market.jpg',
          alt: { es: 'Aigora', en: 'Aigora' },
        },
        about: {
          title: { es: 'Qué es Aigora', en: 'What is Aigora' },
          body: {
            es: 'Aigora es un marketplace de agentes en Celo sobre el registry ERC-8004 canónico. El listing es discovery (perfil + services Web), no un adapter de pago ni escrow propio.',
            en: 'Aigora is an agent marketplace on Celo over the canonical ERC-8004 registry. The listing is discovery (profile + Web services), not a payment adapter or its own escrow.',
          },
          href: WALCERT_AIGORA_ABOUT_URL,
          linkLabel: {
            es: 'Sitio de Aigora',
            en: 'Aigora website',
          },
        },
        body: {
          es: 'Walcert está publicado con el mismo NFT de emisión (Celo agentId 9699) — no hay segundo mint. El perfil lista agent card, certificados, preview y verify; el cobro sigue siendo x402 $0.05 USDC en Celo/Base/BNB.',
          en: 'Walcert is published with the same issuance NFT (Celo agentId 9699) — no second mint. The profile lists agent card, certificates, preview, and verify; billing remains x402 $0.05 USDC on Celo/Base/BNB.',
        },
        facts: [
          {
            label: { es: 'ERC-8004 Celo', en: 'ERC-8004 Celo' },
            value: {
              es: `agentId ${WALCERT_AGENT_ID}`,
              en: `agentId ${WALCERT_AGENT_ID}`,
            },
          },
          {
            label: { es: 'Modelo', en: 'Model' },
            value: { es: 'Discovery · no escrow', en: 'Discovery · no escrow' },
          },
        ],
        links: [
          {
            label: {
              es: 'Perfil Walcert en Aigora',
              en: 'Walcert profile on Aigora',
            },
            href: WALCERT_AIGORA_PROFILE_URL,
          },
        ],
      },
      {
        id: 'concordium-cis8004',
        date: { es: '11 ago 2026', en: 'Aug 11, 2026' },
        title: {
          es: 'Registrado en Concordium CIS-8004',
          en: 'Registered on Concordium CIS-8004',
        },
        logo: {
          src: '/concordium_logo.png',
          alt: { es: 'Concordium', en: 'Concordium' },
        },
        about: {
          title: { es: 'Qué es Concordium', en: 'What is Concordium' },
          body: {
            es: 'Concordium es una L1 con identidad verificable a nivel de protocolo. Su Agent Registry (CIS-8004) ancla accountability ID-backed para agentes — complementa ERC-8004, no lo reemplaza.',
            en: 'Concordium is an L1 with protocol-level verifiable identity. Its Agent Registry (CIS-8004) anchors ID-backed accountability for agents — it complements ERC-8004, it does not replace it.',
          },
          href: WALCERT_CONCORDIUM_ABOUT_URL,
          linkLabel: {
            es: 'Sitio de Concordium',
            en: 'Concordium website',
          },
        },
        body: {
          es: 'External Agent #1686 en el Concordium Agent Registry, con binding CIS-8 a la Owner wallet en Celo y Agent Card verificable (metadata_hash anclado). Complementa — no reemplaza — la identidad ERC-8004 en Celo.',
          en: 'External Agent #1686 on the Concordium Agent Registry, with CIS-8 binding to the Celo Owner wallet and a verifiable Agent Card (anchored metadata_hash). Complements — does not replace — ERC-8004 identity on Celo.',
        },
        facts: [
          {
            label: { es: 'External Agent', en: 'External Agent' },
            value: {
              es: `#${WALCERT_CONCORDIUM_TOKEN_ID} · Active`,
              en: `#${WALCERT_CONCORDIUM_TOKEN_ID} · Active`,
            },
          },
          {
            label: { es: 'Card', en: 'Card' },
            value: { es: 'v0.3.0 · verificable', en: 'v0.3.0 · verifiable' },
          },
        ],
        links: [
          {
            label: {
              es: 'Agent Card (registro)',
              en: 'Agent Card (registration)',
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
        ],
      },
    ] as {
      id: string;
      date: Bilingual;
      title: Bilingual;
      logo?: { src: string; alt: Bilingual };
      about: {
        title: Bilingual;
        body: Bilingual;
        href: string;
        linkLabel: Bilingual;
      };
      body: Bilingual;
      facts: { label: Bilingual; value: Bilingual }[];
      links: { label: Bilingual; href: string }[];
    }[],
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
          es: 'giveFeedback en el Reputation Registry con el hash del certificado y el monto pagado — auditable on-chain en Celo (9699).',
          en: 'giveFeedback on the Reputation Registry with the certificate hash and paid amount — auditable on-chain on Celo (9699).',
        },
      },
      {
        title: { es: 'Recibo NFT (BNB)', en: 'NFT receipt (BNB)' },
        body: {
          es: 'Si el pago fue x402 en BNB, el JSON trae un voucher; el pagador hace claim de un NFT soulbound en BSC. No reemplaza el anclaje Celo ni es el certificado en sí.',
          en: 'If payment was x402 on BNB, the JSON includes a voucher; the payer claims a soulbound NFT on BSC. It does not replace the Celo anchor and is not the certificate itself.',
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
      es: 'Agente ERC-8004 en Celo (9699), Base (59768), Ethereum (50032) y BNB (265982), más CIS-8004 en Concordium (#1686). Certificados A–F; x402 en Celo, Base y BNB.',
      en: 'ERC-8004 on Celo (9699), Base (59768), Ethereum (50032), and BNB (265982), plus CIS-8004 on Concordium (#1686). A–F certificates; x402 on Celo, Base, and BNB.',
    } satisfies Bilingual,
    question: {
      es: '¿Qué tan madura y legítima es esta wallet antes de interactuar?',
      en: 'How mature and legitimate is this wallet before you interact?',
    } satisfies Bilingual,
    cta: { es: 'Probar en el dashboard', en: 'Try in the dashboard' } satisfies Bilingual,
    certLabel: { es: 'Certificados', en: 'Certificates' } satisfies Bilingual,
  },
} as const;
