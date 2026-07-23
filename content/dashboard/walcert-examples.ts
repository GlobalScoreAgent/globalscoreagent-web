import type { Bilingual } from '@/content/marketing/i18n';

export const WALCERT_CERT_TYPES = [
  'origins',
  'activity',
  'multichain',
  'portfolio',
] as const;

/** Preview gratuito: solo certificados Alchemy (agente prod 2026-07-21). */
export const WALCERT_PREVIEW_TYPES = ['origins', 'activity'] as const;

export type WalcertCertType = (typeof WALCERT_CERT_TYPES)[number];
export type WalcertPreviewType = (typeof WALCERT_PREVIEW_TYPES)[number];

export function isWalcertCertType(value: string): value is WalcertCertType {
  return (WALCERT_CERT_TYPES as readonly string[]).includes(value);
}

export function isWalcertPreviewType(value: string): value is WalcertPreviewType {
  return (WALCERT_PREVIEW_TYPES as readonly string[]).includes(value);
}

/** Bilingual labels as returned by the agent (eng/esp). */
export type AgentBilingual = { eng: string; esp: string };

export type WalcertPreviewResult = {
  preview: true;
  certificate_type: WalcertCertType;
  wallet: string;
  grade: string;
  grade_label: AgentBilingual;
  analyzed_at: string;
  /** Agent returns bilingual note; older payloads may use a plain string. */
  note?: AgentBilingual | string;
};

export type WalcertExampleReport = {
  type: WalcertCertType;
  grade: string;
  grade_label: AgentBilingual;
  summary: AgentBilingual;
  strengths: AgentBilingual[];
  concerns: AgentBilingual[];
  highlights: { label: AgentBilingual; value: string }[];
};

export function pickAgentLang(
  lang: 'es' | 'en',
  value: AgentBilingual | string | null | undefined,
): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'eng' in value && 'esp' in value) {
    return lang === 'es' ? value.esp : value.eng;
  }
  return '';
}

export const walcertDashboardCopy = {
  title: { es: 'Walcert Agent', en: 'Walcert Agent' } satisfies Bilingual,
  subtitle: {
    es: 'Este es el dashboard humano de GSA. La URL pública del agente (walcert.globalscoreagent.com) es el agent card JSON / API HTTP — no una UI. Acá podés probar un preview live, verificar un certificado por tx_hash u explorar ejemplos.',
    en: 'This is the GSA human dashboard. The agent’s public URL (walcert.globalscoreagent.com) is the agent card JSON / HTTP API — not a UI. Here you can try a live preview, verify a certificate by tx_hash, or explore examples.',
  } satisfies Bilingual,
  agentId: {
    es: 'Celo · agentId 9699',
    en: 'Celo · agentId 9699',
  } satisfies Bilingual,
  agentCardLink: {
    es: 'Agent card (API)',
    en: 'Agent card (API)',
  } satisfies Bilingual,
  developersLink: {
    es: 'API / developers (x402)',
    en: 'API / developers (x402)',
  } satisfies Bilingual,
  liveTitle: {
    es: 'Preview live',
    en: 'Live preview',
  } satisfies Bilingual,
  liveIntro: {
    es: 'Análisis real vía el agente. Preview gratis solo para origins y activity (Alchemy). Límite: 8 requests por IP cada 15 minutos. El certificado completo (métricas, firma, on-chain) requiere x402.',
    en: 'Real analysis via the agent. Free preview only for origins and activity (Alchemy). Limit: 8 requests per IP every 15 minutes. The full certificate (metrics, signature, on-chain) requires x402.',
  } satisfies Bilingual,
  liveLimitHint: {
    es: 'Multichain y portfolio no están disponibles en preview gratis — mirá los ejemplos abajo o usá el endpoint pago (x402).',
    en: 'Multichain and portfolio are not available on free preview — see the examples below or use the paid endpoint (x402).',
  } satisfies Bilingual,
  walletLabel: {
    es: 'Dirección de wallet',
    en: 'Wallet address',
  } satisfies Bilingual,
  walletPlaceholder: {
    es: '0x…',
    en: '0x…',
  } satisfies Bilingual,
  typeLabel: {
    es: 'Tipo de certificado',
    en: 'Certificate type',
  } satisfies Bilingual,
  submit: {
    es: 'Generar preview',
    en: 'Generate preview',
  } satisfies Bilingual,
  loading: {
    es: 'Consultando agente…',
    en: 'Querying agent…',
  } satisfies Bilingual,
  liveBadge: {
    es: 'Live preview',
    en: 'Live preview',
  } satisfies Bilingual,
  exampleBadge: {
    es: 'Ejemplo',
    en: 'Sample',
  } satisfies Bilingual,
  examplesTitle: {
    es: 'Ejemplos por tipo',
    en: 'Examples by type',
  } satisfies Bilingual,
  examplesIntro: {
    es: 'Reportes de demostración con el nivel de detalle del certificado completo (incluye multichain y portfolio). No son análisis de una wallet real.',
    en: 'Demo reports matching the depth of a full certificate (includes multichain and portfolio). Not analyses of a real wallet.',
  } satisfies Bilingual,
  grade: { es: 'Nota', en: 'Grade' } satisfies Bilingual,
  summary: { es: 'Resumen', en: 'Summary' } satisfies Bilingual,
  strengths: { es: 'Fortalezas', en: 'Strengths' } satisfies Bilingual,
  concerns: { es: 'Alertas', en: 'Concerns' } satisfies Bilingual,
  highlights: { es: 'Métricas', en: 'Metrics' } satisfies Bilingual,
  analyzedAt: {
    es: 'Analizado',
    en: 'Analyzed',
  } satisfies Bilingual,
  invalidWallet: {
    es: 'Ingresá una dirección 0x válida (40 hex).',
    en: 'Enter a valid 0x address (40 hex chars).',
  } satisfies Bilingual,
  errorGeneric: {
    es: 'No se pudo obtener el preview. Intentá de nuevo.',
    en: 'Could not fetch the preview. Try again.',
  } satisfies Bilingual,
  errorQuota: {
    es: 'Cuota del proveedor agotada. Probá más tarde o otro tipo.',
    en: 'Provider quota exceeded. Try later or another type.',
  } satisfies Bilingual,
  errorUnavailable: {
    es: 'Certificado no disponible por ahora.',
    en: 'Certificate unavailable right now.',
  } satisfies Bilingual,
  errorPreviewNotAllowed: {
    es: 'El preview gratis solo admite origins y activity. Multichain y portfolio requieren el certificado pagado (x402).',
    en: 'Free preview only allows origins and activity. Multichain and portfolio require the paid certificate (x402).',
  } satisfies Bilingual,
  errorRateLimited: {
    es: 'Límite de previews alcanzado (8 por IP cada 15 min). Esperá un momento e intentá de nuevo.',
    en: 'Preview limit reached (8 per IP every 15 min). Wait a moment and try again.',
  } satisfies Bilingual,
  errorRateLimitedRetry: {
    es: 'Límite de previews alcanzado. Reintentá en ~{seconds}s.',
    en: 'Preview limit reached. Retry in ~{seconds}s.',
  } satisfies Bilingual,
  typeNames: {
    origins: { es: 'Origins', en: 'Origins' } satisfies Bilingual,
    activity: { es: 'Activity', en: 'Activity' } satisfies Bilingual,
    multichain: { es: 'Multichain', en: 'Multichain' } satisfies Bilingual,
    portfolio: { es: 'Portfolio', en: 'Portfolio' } satisfies Bilingual,
  },
} as const;

export const walcertExampleReports: WalcertExampleReport[] = [
  {
    type: 'origins',
    grade: 'B',
    grade_label: { eng: 'Good', esp: 'Bueno' },
    summary: {
      eng: 'Primary funding from labeled CEX with moderate sender diversity and low mixing signals.',
      esp: 'Fondeo principal desde CEX etiquetado, diversidad moderada de senders y señales bajas de mixing.',
    },
    strengths: [
      {
        eng: 'First funding traced to a major CEX (Binance).',
        esp: 'Primer fondeo trazado a un CEX mayor (Binance).',
      },
      {
        eng: 'Mixing risk classified as low across analyzed chains.',
        esp: 'Riesgo de mixing clasificado como bajo en las chains analizadas.',
      },
    ],
    concerns: [
      {
        eng: 'Notable CEX dependency (~68% of traced inflows).',
        esp: 'Dependencia notable de CEX (~68% de inflows trazados).',
      },
      {
        eng: 'Limited history of non-CEX counterparties.',
        esp: 'Historial limitado de contrapartes no-CEX.',
      },
    ],
    highlights: [
      {
        label: { eng: 'Main origin', esp: 'Origen principal' },
        value: 'CEX',
      },
      {
        label: { eng: 'CEX share', esp: 'Share CEX' },
        value: '68.5%',
      },
      {
        label: { eng: 'Mixing risk', esp: 'Riesgo mixing' },
        value: 'low',
      },
    ],
  },
  {
    type: 'activity',
    grade: 'C',
    grade_label: { eng: 'Acceptable', esp: 'Aceptable' },
    summary: {
      eng: 'Light activity in the last 7 days with few counterparties and no strong wash/circular signals.',
      esp: 'Actividad liviana en los últimos 7 días, pocas contrapartes y sin señales fuertes de wash/circular.',
    },
    strengths: [
      {
        eng: 'No circular patterns or bot-like burst detected.',
        esp: 'Sin patrones circulares ni ráfagas bot-like detectadas.',
      },
      {
        eng: 'Wash trading risk rated low.',
        esp: 'Riesgo de wash trading calificado como bajo.',
      },
    ],
    concerns: [
      {
        eng: 'Very low counterparty diversity in the window.',
        esp: 'Diversidad de contrapartes muy baja en la ventana.',
      },
      {
        eng: 'Sparse flow makes maturity hard to assert from activity alone.',
        esp: 'Flujo escaso: difícil afirmar madurez solo con activity.',
      },
    ],
    highlights: [
      {
        label: { eng: 'Window', esp: 'Ventana' },
        value: '7 days',
      },
      {
        label: { eng: 'Transfers', esp: 'Transfers' },
        value: '5',
      },
      {
        label: { eng: 'Counterparties', esp: 'Contrapartes' },
        value: '3',
      },
    ],
  },
  {
    type: 'multichain',
    grade: 'A',
    grade_label: { eng: 'Excellent', esp: 'Excelente' },
    summary: {
      eng: 'Active on multiple networks with a long activity span and consistent presence.',
      esp: 'Activa en varias redes, con span largo de actividad y presencia consistente.',
    },
    strengths: [
      {
        eng: 'Six chains with recorded activity including Base and BSC.',
        esp: 'Seis chains con actividad registrada, incluidas Base y BSC.',
      },
      {
        eng: 'Longevity score high (~980+ activity span days).',
        esp: 'Score de longevidad alto (~980+ días de span).',
      },
    ],
    concerns: [
      {
        eng: 'Some chains lack first/last tx timestamps from the provider.',
        esp: 'Algunas chains sin timestamps first/last del provider.',
      },
    ],
    highlights: [
      {
        label: { eng: 'Chains', esp: 'Chains' },
        value: '6',
      },
      {
        label: { eng: 'Activity span', esp: 'Span actividad' },
        value: '986 days',
      },
      {
        label: { eng: 'Consistency', esp: 'Consistencia' },
        value: 'high',
      },
    ],
  },
  {
    type: 'portfolio',
    grade: 'D',
    grade_label: { eng: 'Weak', esp: 'Débil' },
    summary: {
      eng: 'Small liquid portfolio with high concentration and limited diversification.',
      esp: 'Portfolio líquido pequeño, alta concentración y poca diversificación.',
    },
    strengths: [
      {
        eng: 'Positions are liquid (no locked share).',
        esp: 'Posiciones líquidas (sin share locked).',
      },
    ],
    concerns: [
      {
        eng: 'Very low total value USD — weak size signal.',
        esp: 'Valor total USD muy bajo — señal de tamaño débil.',
      },
      {
        eng: 'Concentration (HHI) implies single-asset exposure.',
        esp: 'Concentración (HHI) implica exposición a un solo activo.',
      },
    ],
    highlights: [
      {
        label: { eng: 'Total value', esp: 'Valor total' },
        value: '~$0.81',
      },
      {
        label: { eng: 'Liquid ratio', esp: 'Ratio líquido' },
        value: '100%',
      },
      {
        label: { eng: 'Positions', esp: 'Posiciones' },
        value: '1',
      },
    ],
  },
];
