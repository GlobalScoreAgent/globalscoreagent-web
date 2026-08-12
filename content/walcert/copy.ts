import type { Bilingual } from '@/content/marketing/i18n';

export const WALCERT_LIVE_URL = 'https://walcert.globalscoreagent.com';
export const WALCERT_AGENT_CARD_CONCORDIUM_URL =
  'https://walcert.globalscoreagent.com/agent-card.json';
export const WALCERT_EXPLORER_URL =
  'https://erc-8004.quicknode.com/agents/celo-mainnet/9699';
export const WALCERT_AGENT_ID = '9699';
export const WALCERT_CHAIN = 'Celo mainnet (eip155:42220)';
export const WALCERT_REPO_URL = 'https://github.com/GlobalScoreAgent/walcert-agent';
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
      es: 'Agente ERC-8004 en Celo (9699) y Base (59768), más CIS-8004 en Concordium (#1686). Certificados A–F; Provider en Virtuals ACP; preview gratis; anclaje x402 en Celo.',
      en: 'ERC-8004 agent on Celo (9699) and Base (59768), plus CIS-8004 on Concordium (#1686). A–F certificates; Virtuals ACP Provider; free preview; x402 anchor on Celo.',
    } satisfies Bilingual,
  },
  hero: {
    title: { es: 'Walcert Agent', en: 'Walcert Agent' } satisfies Bilingual,
    subtitle: {
      es: 'Certificados de madurez de wallets con calificación A–F, pensados para consumo agente-a-agente.',
      en: 'Wallet maturity certificates graded A–F, built for agent-to-agent consumption.',
    } satisfies Bilingual,
    badge: {
      es: 'Celo 9699 · Base 59768 · Concordium #1686 · En producción',
      en: 'Celo 9699 · Base 59768 · Concordium #1686 · Live in production',
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
        es: 'Diseñado para agent-to-agent: preview gratis, certificado vía x402, y offerings en Virtuals ACP.',
        en: 'Built for agent-to-agent: free preview, certificate via x402, and offerings on Virtuals ACP.',
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
          es: 'Footprint y longevidad multi-red: recencia, consistencia, ecosistemas core y span — sin intensidad de txs/volumen.',
          en: 'Multi-network footprint and longevity: recency, consistency, core ecosystems, and span — no tx/volume intensity.',
        },
        dataSource: { es: 'Moralis (+ Celo merge)', en: 'Moralis (+ Celo merge)' },
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
      es: 'Walcert tiene tres registros complementarios: ERC-8004 en Celo (certificados + x402), ERC-8004 en Base (Virtuals ACP) y CIS-8004 en Concordium (accountability ID-backed). No se reemplazan entre sí.',
      en: 'Walcert has three complementary registrations: ERC-8004 on Celo (certificates + x402), ERC-8004 on Base (Virtuals ACP), and CIS-8004 on Concordium (ID-backed accountability). They do not replace each other.',
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
            label: { es: 'Discovery / API', en: 'Discovery / API' },
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
              es: 'Identidad ERC-8004 para Virtuals ACP',
              en: 'ERC-8004 identity for Virtuals ACP',
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
      es: 'Los certificados firmados y los pagos x402 siguen anclados en Celo (agentId 9699). Base (59768) es la identidad ERC-8004 usada por Virtuals ACP. Concordium aporta accountability ID-backed vía CIS-8 + CIS-8004.',
      en: 'Signed certificates and x402 payments remain anchored on Celo (agentId 9699). Base (59768) is the ERC-8004 identity used by Virtuals ACP. Concordium adds ID-backed accountability via CIS-8 + CIS-8004.',
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
      es: 'Además de la identidad on-chain, Walcert está disponible donde los agentes ya contratan servicios — y donde la accountability ID-backed suma legitimidad.',
      en: 'Beyond on-chain identity, Walcert is available where agents already hire services — and where ID-backed accountability adds legitimacy.',
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
      logo: { src: string; alt: Bilingual };
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
      es: 'Agente ERC-8004 en Celo (9699) y Base (59768), más CIS-8004 en Concordium (#1686). Certificados A–F; Provider en Virtuals ACP. Preview gratis; certificado firmado vía x402.',
      en: 'ERC-8004 on Celo (9699) and Base (59768), plus CIS-8004 on Concordium (#1686). A–F certificates; Virtuals ACP Provider. Free preview; signed certificate via x402.',
    } satisfies Bilingual,
    question: {
      es: '¿Qué tan madura y legítima es esta wallet antes de interactuar?',
      en: 'How mature and legitimate is this wallet before you interact?',
    } satisfies Bilingual,
    cta: { es: 'Probar en el dashboard', en: 'Try in the dashboard' } satisfies Bilingual,
    certLabel: { es: 'Certificados', en: 'Certificates' } satisfies Bilingual,
  },
} as const;
