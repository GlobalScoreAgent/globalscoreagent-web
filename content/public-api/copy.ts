import type { Bilingual } from '@/content/marketing/i18n';

export const publicApiCopy = {
  seo: {
    title: {
      es: 'Public API – Free Tier | Global Score Agent',
      en: 'Public API – Free Tier | Global Score Agent',
    } satisfies Bilingual,
    description: {
      es: 'Acceso público sin autenticación a búsqueda de agentes ERC-8004 y nivel de madurez HUMI/WAMI. Prueba los endpoints en vivo.',
      en: 'Unauthenticated public access to ERC-8004 agent search and HUMI/WAMI maturity level. Try the endpoints live.',
    } satisfies Bilingual,
  },
  hero: {
    title: {
      es: 'Public API – Free Tier',
      en: 'Public API – Free Tier',
    } satisfies Bilingual,
    subtitle: {
      es: 'Acceso programático sin autenticación para descubrir agentes ERC-8004 y evaluar su reputación básica con los índices HUMI y WAMI.',
      en: 'Unauthenticated programmatic access to discover ERC-8004 agents and evaluate their basic reputation with HUMI and WAMI indices.',
    } satisfies Bilingual,
    badges: {
      noAuth: { es: 'Sin autenticación', en: 'No authentication' } satisfies Bilingual,
      rateLimit: { es: '20 req/min por IP', en: '20 req/min per IP' } satisfies Bilingual,
      json: { es: 'Respuesta JSON', en: 'JSON response' } satisfies Bilingual,
    },
  },
  search: {
    title: {
      es: 'Búsqueda de agentes',
      en: 'Agent search',
    } satisfies Bilingual,
    endpoint: 'GET /v1/agents/search',
    description: {
      es: 'Endpoint principal para descubrir agentes. Filtra por nombre, cadena o wallets y pagina los resultados.',
      en: 'Main endpoint for agent discovery. Filter by name, chain, or wallets and paginate results.',
    } satisfies Bilingual,
    bullets: [
      {
        es: 'Filtros opcionales: name, chain_name, owner_wallet, wallet_chain_register',
        en: 'Optional filters: name, chain_name, owner_wallet, wallet_chain_register',
      },
      {
        es: 'Paginación con limit (máx. 100) y page',
        en: 'Pagination with limit (max 100) and page',
      },
      {
        es: 'Respuesta con canonical_slug, nombre, cadena y datos básicos del agente',
        en: 'Response includes canonical_slug, name, chain, and basic agent data',
      },
    ] satisfies Bilingual[],
    responseGuide: {
      title: {
        es: 'Entender la respuesta',
        en: 'Understanding the response',
      } satisfies Bilingual,
      intro: {
        es: 'La respuesta incluye un array data con los agentes encontrados y un objeto pagination con el estado de la paginación. Usa canonical_slug como identificador estable para consultas posteriores (p. ej. el endpoint de madurez).',
        en: 'The response includes a data array with matching agents and a pagination object with paging state. Use canonical_slug as the stable identifier for follow-up queries (e.g. the maturity endpoint).',
      } satisfies Bilingual,
      agentFieldsTitle: {
        es: 'Campos por agente (data[])',
        en: 'Fields per agent (data[])',
      } satisfies Bilingual,
      agentFields: [
        {
          es: 'canonical_slug — identificador único recomendado (ej. base-30528)',
          en: 'canonical_slug — recommended unique identifier (e.g. base-30528)',
        },
        {
          es: 'name — nombre del agente',
          en: 'name — agent name',
        },
        {
          es: 'description — descripción pública del agente',
          en: 'description — public agent description',
        },
        {
          es: 'chain_name — blockchain donde está registrado',
          en: 'chain_name — blockchain where the agent is registered',
        },
        {
          es: 'owner_wallet — wallet del propietario del agente',
          en: 'owner_wallet — wallet of the agent owner',
        },
        {
          es: 'wallet_chain_register — wallet usada en el registro on-chain',
          en: 'wallet_chain_register — wallet used for on-chain registration',
        },
        {
          es: 'on_chain_created_at — fecha de creación del registro ERC-8004',
          en: 'on_chain_created_at — ERC-8004 registration creation date',
        },
      ] satisfies Bilingual[],
      paginationTitle: {
        es: 'Paginación (pagination)',
        en: 'Pagination (pagination)',
      } satisfies Bilingual,
      paginationFields: [
        {
          es: 'page — página actual',
          en: 'page — current page',
        },
        {
          es: 'limit — resultados por página',
          en: 'limit — results per page',
        },
        {
          es: 'total — total de agentes que coinciden con el filtro',
          en: 'total — total agents matching the filter',
        },
        {
          es: 'total_pages — número total de páginas',
          en: 'total_pages — total number of pages',
        },
      ] satisfies Bilingual[],
      docsTitle: {
        es: 'Más contexto',
        en: 'More context',
      } satisfies Bilingual,
      erc8004: {
        title: { es: 'ERC-8004', en: 'ERC-8004' } satisfies Bilingual,
        description: {
          es: 'Estándar de identidad y reputación on-chain para agentes de IA autónomos.',
          en: 'On-chain identity and reputation standard for autonomous AI agents.',
        } satisfies Bilingual,
        link: { es: 'Ver documentación ERC-8004', en: 'View ERC-8004 documentation' } satisfies Bilingual,
      },
      apiDocs: {
        title: { es: 'API Free Tier', en: 'API Free Tier' } satisfies Bilingual,
        description: {
          es: 'Referencia completa del endpoint de búsqueda, ejemplos cURL y buenas prácticas.',
          en: 'Full search endpoint reference, cURL examples, and best practices.',
        } satisfies Bilingual,
        link: { es: 'Ver documentación de la API', en: 'View API documentation' } satisfies Bilingual,
      },
    },
  },
  maturity: {
    title: {
      es: 'Nivel de madurez',
      en: 'Maturity level',
    } satisfies Bilingual,
    endpoint: 'GET /v1/agents/maturity',
    description: {
      es: 'Consulta el nivel de madurez HUMI (agente) y WAMI (wallet) con descripciones contextuales según el idioma.',
      en: 'Query HUMI (agent) and WAMI (wallet) maturity levels with contextual descriptions by language.',
    } satisfies Bilingual,
    bullets: [
      {
        es: 'Parámetro obligatorio: canonical_slug',
        en: 'Required parameter: canonical_slug',
      },
      {
        es: 'Idioma opcional: lang=eng (default) o lang=esp',
        en: 'Optional language: lang=eng (default) or lang=esp',
      },
      {
        es: 'Incluye maturity_level, risk, confidence_level y calculated_at',
        en: 'Includes maturity_level, risk, confidence_level, and calculated_at',
      },
    ] satisfies Bilingual[],
    responseGuide: {
      title: {
        es: 'Entender la respuesta',
        en: 'Understanding the response',
      } satisfies Bilingual,
      intro: {
        es: 'El endpoint devuelve dos bloques: humi (reputación del agente) y wami (reputación de la wallet vinculada). Cada uno incluye nivel de madurez, descripción legible, confianza, riesgo y fecha de cálculo.',
        en: 'The endpoint returns two blocks: humi (agent reputation) and wami (linked wallet reputation). Each includes maturity level, readable description, confidence, risk, and calculation date.',
      } satisfies Bilingual,
      fieldsTitle: {
        es: 'Campos por índice',
        en: 'Fields per index',
      } satisfies Bilingual,
      fields: [
        {
          es: 'maturity_level — categoría de madurez (Unstable → Elite)',
          en: 'maturity_level — maturity category (Unstable → Elite)',
        },
        {
          es: 'user_description — resumen en lenguaje natural del estado del agente o wallet',
          en: 'user_description — plain-language summary of the agent or wallet status',
        },
        {
          es: 'confidence_level — qué tan fiable es la evaluación para tomar decisiones',
          en: 'confidence_level — how reliable the assessment is for decision-making',
        },
        {
          es: 'risk — nivel de riesgo sugerido (Very Low, Low, etc.)',
          en: 'risk — suggested risk level (Very Low, Low, etc.)',
        },
        {
          es: 'calculated_at — cuándo se calculó por última vez el índice',
          en: 'calculated_at — when the index was last calculated',
        },
      ] satisfies Bilingual[],
      indicesTitle: {
        es: 'Profundiza en cada índice',
        en: 'Learn more about each index',
      } satisfies Bilingual,
      humi: {
        title: { es: 'Índice HUMI', en: 'HUMI Index' } satisfies Bilingual,
        description: {
          es: 'Puntaje 0–100 de reputación del agente ERC-8004: identidad, historial, calidad de metadata y feedback on-chain.',
          en: '0–100 reputation score for the ERC-8004 agent: identity, history, metadata quality, and on-chain feedback.',
        } satisfies Bilingual,
        link: { es: 'Ver documentación HUMI', en: 'View HUMI documentation' } satisfies Bilingual,
      },
      wami: {
        title: { es: 'Índice WAMI', en: 'WAMI Index' } satisfies Bilingual,
        description: {
          es: 'Puntaje 0–100 de la wallet que controla o registra el agente: actividad, portfolio y comportamiento transaccional.',
          en: '0–100 score for the wallet that controls or registers the agent: activity, portfolio, and transactional behavior.',
        } satisfies Bilingual,
        link: { es: 'Ver documentación WAMI', en: 'View WAMI documentation' } satisfies Bilingual,
      },
    },
  },
  docsCta: {
    title: {
      es: '¿Necesitas más detalle?',
      en: 'Need more detail?',
    } satisfies Bilingual,
    description: {
      es: 'La documentación técnica completa incluye ejemplos cURL, códigos de error, buenas prácticas y flujos recomendados para agentes autónomos.',
      en: 'Full technical documentation includes cURL examples, error codes, best practices, and recommended flows for autonomous agents.',
    } satisfies Bilingual,
    link: {
      es: 'Ver documentación técnica completa',
      en: 'View full technical documentation',
    } satisfies Bilingual,
    paidNote: {
      es: 'Reportes detallados y endpoints autenticados con API Keys estarán disponibles próximamente.',
      en: 'Detailed reports and authenticated endpoints with API Keys will be available soon.',
    } satisfies Bilingual,
  },
  playground: {
    requestUrl: {
      es: 'URL de la petición',
      en: 'Request URL',
    } satisfies Bilingual,
    sendRequest: {
      es: 'Enviar petición',
      en: 'Send request',
    } satisfies Bilingual,
    loading: {
      es: 'Enviando…',
      en: 'Sending…',
    } satisfies Bilingual,
    response: {
      es: 'Respuesta',
      en: 'Response',
    } satisfies Bilingual,
    rateLimitNote: {
      es: 'Límite: 20 peticiones por minuto por IP. Si recibes 429, espera un minuto antes de reintentar.',
      en: 'Limit: 20 requests per minute per IP. If you receive 429, wait one minute before retrying.',
    } satisfies Bilingual,
    networkError: {
      es: 'Error de red al contactar la API.',
      en: 'Network error while contacting the API.',
    } satisfies Bilingual,
    search: {
      title: {
        es: 'Probar búsqueda',
        en: 'Try search',
      } satisfies Bilingual,
      fields: {
        name: { es: 'Nombre', en: 'Name' } satisfies Bilingual,
        chainName: { es: 'Cadena', en: 'Chain name' } satisfies Bilingual,
        ownerWallet: { es: 'Wallet del owner', en: 'Owner wallet' } satisfies Bilingual,
        walletChainRegister: {
          es: 'Wallet de registro',
          en: 'Registration wallet',
        } satisfies Bilingual,
        limit: { es: 'Límite', en: 'Limit' } satisfies Bilingual,
        page: { es: 'Página', en: 'Page' } satisfies Bilingual,
      },
      placeholders: {
        name: { es: 'clawdbot', en: 'clawdbot' } satisfies Bilingual,
        chainName: { es: 'base', en: 'base' } satisfies Bilingual,
        ownerWallet: { es: '0x…', en: '0x…' } satisfies Bilingual,
        walletChainRegister: { es: '0x…', en: '0x…' } satisfies Bilingual,
        limit: { es: '20', en: '20' } satisfies Bilingual,
        page: { es: '1', en: '1' } satisfies Bilingual,
      },
    },
    maturity: {
      title: {
        es: 'Probar madurez',
        en: 'Try maturity',
      } satisfies Bilingual,
      fields: {
        canonicalSlug: {
          es: 'canonical_slug',
          en: 'canonical_slug',
        } satisfies Bilingual,
        lang: { es: 'Idioma', en: 'Language' } satisfies Bilingual,
      },
      placeholders: {
        canonicalSlug: { es: 'base-32333', en: 'base-32333' } satisfies Bilingual,
      },
      langOptions: {
        eng: { es: 'Inglés (eng)', en: 'English (eng)' } satisfies Bilingual,
        esp: { es: 'Español (esp)', en: 'Spanish (esp)' } satisfies Bilingual,
      },
      slugRequired: {
        es: 'canonical_slug es obligatorio.',
        en: 'canonical_slug is required.',
      } satisfies Bilingual,
    },
  },
};
