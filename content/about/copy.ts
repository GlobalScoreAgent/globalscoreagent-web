import type { Bilingual } from '@/content/marketing/i18n';

export type AboutRecognitionImage = {
  src: string;
  alt: Bilingual;
};

export type AboutRecognitionLink = {
  label: Bilingual;
  href: string;
};

export type AboutRecognition = {
  year: string;
  title: Bilingual;
  detail: Bilingual;
  images: AboutRecognitionImage[];
  links?: AboutRecognitionLink[];
};

export type AboutCta = {
  label: Bilingual;
  href: string;
  external?: boolean;
};

export const aboutCopy = {
  seo: {
    title: {
      es: 'Nosotros | Global Score Agent',
      en: 'About | Global Score Agent',
    } satisfies Bilingual,
    description: {
      es: 'Global Score Agent convierte la confianza en una métrica medible para agentes ERC-8004. Conocé al fundador y los reconocimientos verificables de 2026.',
      en: 'Global Score Agent turns trust into a measurable metric for ERC-8004 agents. Meet the founder and our verifiable 2026 recognitions.',
    } satisfies Bilingual,
  },
  pageTitle: {
    es: 'Nosotros',
    en: 'About Global Score Agent',
  } satisfies Bilingual,
  intro: {
    title: {
      es: 'Qué es Global Score Agent',
      en: 'What is Global Score Agent',
    } satisfies Bilingual,
    paragraphs: [
      {
        es: 'Global Score Agent convierte la confianza en una métrica medible para agentes autónomos de IA y las wallets que los controlan.',
        en: 'Global Score Agent turns trust into a measurable metric for autonomous AI agents and the wallets that control them.',
      },
      {
        es: 'En el ecosistema on-chain (y en particular en ERC-8004) es difícil saber qué tan legítimo es un agente, cómo se comporta la wallet detrás y qué tan riesgoso es interactuar con él. GSA entrega señales de reputación transparentes, auditables y accionables — no scores opacos de caja negra.',
        en: 'In the on-chain ecosystem (and especially ERC-8004) it is hard to know how legitimate an agent is, how the wallet behind it behaves, and how risky it is to interact with it. GSA delivers transparent, auditable, and actionable reputation signals — not opaque black-box scores.',
      },
    ] as Bilingual[],
    productsTitle: {
      es: 'Hoy el producto incluye',
      en: 'Today the product includes',
    } satisfies Bilingual,
    products: [
      {
        name: 'HUMI',
        description: {
          es: 'Reputación de agentes',
          en: 'Agent reputation',
        } satisfies Bilingual,
      },
      {
        name: 'WAMI',
        description: {
          es: 'Legitimidad y madurez de wallets',
          en: 'Wallet legitimacy and maturity',
        } satisfies Bilingual,
      },
      {
        name: 'Walcert',
        description: {
          es: 'Certificados A–F de madurez de wallet, verificables on-chain',
          en: 'A–F wallet maturity certificates, verifiable on-chain',
        } satisfies Bilingual,
      },
    ],
  },
  founder: {
    title: { es: 'Fundador', en: 'Founder' } satisfies Bilingual,
    name: 'Ibzan Jair Valenzuela Suarez',
    initials: 'IJ',
    role: { es: 'Fundador', en: 'Founder' } satisfies Bilingual,
    bio: {
      es: 'Fundador de Global Score Agent. Construye infraestructura de reputación para el ecosistema de agentes autónomos, con foco en señales verificables y no en gatekeeping.',
      en: 'Founder of Global Score Agent. Builds reputation infrastructure for the autonomous agent ecosystem, focused on verifiable signals rather than gatekeeping.',
    } satisfies Bilingual,
    profiles: {
      linkedin: {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/ibzanjairvalenzuelasuarez',
      },
      x: {
        label: '@ibzjairvalenz',
        href: 'https://x.com/ibzjairvalenz',
      },
    },
  },
  recognitions: {
    title: { es: 'Reconocimientos', en: 'Recognitions' } satisfies Bilingual,
    items: [
      {
        year: '2026',
        title: {
          es: '1er puesto Startup · ORIGO — Hackathon ETH Uruguay + pitch BSG',
          en: '1st place Startup · ORIGO — ETH Uruguay Hackathon + BSG pitch',
        },
        detail: {
          es: '1er puesto en categoría Startup del Ethereum Uruguay Hackathon 2026 con ORIGO Certificate (análisis verificable de orígenes de fondos), y pitch oficial / entrega de premios en Blockchain Summit Global 2026 (Montevideo) — misma trayectoria en dos momentos.',
          en: '1st place in the Startup category at Ethereum Uruguay Hackathon 2026 with ORIGO Certificate (verifiable funding-origins analysis), and official pitch / awards at Blockchain Summit Global 2026 (Montevideo) — one journey across two moments.',
        },
        images: [
          {
            src: '/hackaton_eth_2026.jpg',
            alt: {
              es: 'Ethereum Uruguay Hackathon 2026 — 1er puesto Startup',
              en: 'Ethereum Uruguay Hackathon 2026 — 1st place Startup',
            },
          },
          {
            src: '/hackaton_eth_2026_2.jpg',
            alt: {
              es: 'Ethereum Uruguay Hackathon 2026 — evento',
              en: 'Ethereum Uruguay Hackathon 2026 — event',
            },
          },
          {
            src: '/hackaton_2026_premiacion.jpg',
            alt: {
              es: 'Premiación Ethereum Uruguay Hackathon / Blockchain Summit Global 2026',
              en: 'Awards ceremony — Ethereum Uruguay Hackathon / Blockchain Summit Global 2026',
            },
          },
          {
            src: '/blockchain_summit_2026.png',
            alt: {
              es: 'Logo Blockchain Summit Global 2026',
              en: 'Blockchain Summit Global 2026 logo',
            },
          },
        ],
        links: [
          {
            label: {
              es: 'Proyecto público en GitHub',
              en: 'Public project on GitHub',
            },
            href: 'https://github.com/GlobalScoreAgent/Hackaton_Etherum_Uruguay_2026',
          },
          {
            label: {
              es: 'Blockchain Summit Global',
              en: 'Blockchain Summit Global',
            },
            href: 'https://blockchainsummit.global/',
          },
          {
            label: {
              es: 'DoraHacks · Urugwei 2026',
              en: 'DoraHacks · Urugwei 2026',
            },
            href: 'https://dorahacks.io/hackathon/urugwei-2026/report',
          },
        ],
      },
    ] as AboutRecognition[],
  },
  cta: {
    title: {
      es: 'Seguí explorando',
      en: 'Keep exploring',
    } satisfies Bilingual,
    items: [
      {
        label: { es: 'Probar Walcert', en: 'Try Walcert' },
        href: '/walcert',
      },
      {
        label: { es: 'Demo pública BSG2026', en: 'BSG2026 public demo' },
        href: 'https://bsg2026.globalscoreagent.com',
        external: true,
      },
      {
        label: { es: 'Acceder al Dashboard', en: 'Access the Dashboard' },
        href: '/auth/login',
      },
      {
        label: { es: 'Contacto en X', en: 'Contact on X' },
        href: 'https://x.com/ibzjairvalenz',
        external: true,
      },
    ] as AboutCta[],
  },
  footerBlurb: {
    es: '1er puesto Startup · Ethereum Uruguay Hackathon 2026 · Pitch en Blockchain Summit Global 2026.',
    en: '1st place Startup · Ethereum Uruguay Hackathon 2026 · Pitch at Blockchain Summit Global 2026.',
  } satisfies Bilingual,
  closeModal: { es: 'Cerrar', en: 'Close' } satisfies Bilingual,
} as const;
