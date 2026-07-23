import type { Bilingual } from '@/content/marketing/i18n';

const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;

export function isWalcertTxHash(value: string): boolean {
  return TX_HASH_RE.test(value.trim());
}

export type WalcertVerifyCertificate = {
  certificate_id?: string;
  type?: string;
  grade?: string;
  wallet?: string;
  data_hash?: string;
  analyzed_at?: string;
};

export type WalcertVerifySignature = {
  valid?: boolean;
  signer?: string;
};

export type WalcertVerifyOnchain = {
  valid?: boolean;
  tx_hash?: string;
  contract?: string;
  tag1?: string;
  tag2?: string;
  celoscan?: string;
};

/** Public shape from Walcert Agent `POST /v1/verify`. */
export type WalcertVerifyResult = {
  valid: boolean;
  source?: string;
  reason?: string;
  certificate?: WalcertVerifyCertificate | null;
  signature?: WalcertVerifySignature | null;
  onchain?: WalcertVerifyOnchain | null;
};

export function isWalcertVerifyResult(value: unknown): value is WalcertVerifyResult {
  if (!value || typeof value !== 'object') return false;
  return typeof (value as WalcertVerifyResult).valid === 'boolean';
}

export const walcertVerifyCopy = {
  verifyTitle: {
    es: 'Verificar certificado',
    en: 'Verify certificate',
  } satisfies Bilingual,
  verifyIntro: {
    es: 'Pegá el tx_hash del anclaje on-chain en Celo. El dashboard consulta POST /v1/verify del agente (BD + on-chain + firma EIP-712).',
    en: 'Paste the on-chain anchor tx_hash on Celo. The dashboard calls the agent’s POST /v1/verify (DB + on-chain + EIP-712 signature).',
  } satisfies Bilingual,
  txHashLabel: {
    es: 'Tx hash (anclaje)',
    en: 'Tx hash (anchor)',
  } satisfies Bilingual,
  txHashPlaceholder: {
    es: '0x… (64 hex)',
    en: '0x… (64 hex)',
  } satisfies Bilingual,
  verifySubmit: {
    es: 'Verificar certificado',
    en: 'Verify certificate',
  } satisfies Bilingual,
  verifyLoading: {
    es: 'Verificando…',
    en: 'Verifying…',
  } satisfies Bilingual,
  validBanner: {
    es: 'Certificado válido',
    en: 'Certificate valid',
  } satisfies Bilingual,
  invalidBanner: {
    es: 'Certificado no válido',
    en: 'Certificate not valid',
  } satisfies Bilingual,
  checkRegistry: {
    es: 'Encontrado en registro',
    en: 'Found in registry',
  } satisfies Bilingual,
  checkSignature: {
    es: 'Firma EIP-712',
    en: 'EIP-712 signature',
  } satisfies Bilingual,
  checkOnchain: {
    es: 'Anclaje on-chain',
    en: 'On-chain anchor',
  } satisfies Bilingual,
  checkPass: {
    es: 'OK',
    en: 'OK',
  } satisfies Bilingual,
  checkFail: {
    es: 'Falló',
    en: 'Failed',
  } satisfies Bilingual,
  checkUnknown: {
    es: '—',
    en: '—',
  } satisfies Bilingual,
  certType: {
    es: 'Tipo',
    en: 'Type',
  } satisfies Bilingual,
  certGrade: {
    es: 'Nota',
    en: 'Grade',
  } satisfies Bilingual,
  certWallet: {
    es: 'Wallet',
    en: 'Wallet',
  } satisfies Bilingual,
  certAnalyzedAt: {
    es: 'Analizado',
    en: 'Analyzed',
  } satisfies Bilingual,
  certDataHash: {
    es: 'Data hash',
    en: 'Data hash',
  } satisfies Bilingual,
  certSigner: {
    es: 'Firmante',
    en: 'Signer',
  } satisfies Bilingual,
  certId: {
    es: 'Certificate ID',
    en: 'Certificate ID',
  } satisfies Bilingual,
  sourceLabel: {
    es: 'Fuente',
    en: 'Source',
  } satisfies Bilingual,
  reasonLabel: {
    es: 'Motivo',
    en: 'Reason',
  } satisfies Bilingual,
  celoscanLink: {
    es: 'Ver en Celoscan',
    en: 'View on Celoscan',
  } satisfies Bilingual,
  invalidTxHash: {
    es: 'Ingresá un tx_hash válido (0x + 64 hex).',
    en: 'Enter a valid tx_hash (0x + 64 hex chars).',
  } satisfies Bilingual,
  errorNotFound: {
    es: 'No hay certificado con ese tx_hash en el registro de Walcert.',
    en: 'No certificate with that tx_hash in the Walcert registry.',
  } satisfies Bilingual,
  errorOnchainMismatch: {
    es: 'El registro no coincide con el anclaje on-chain.',
    en: 'Registry record does not match the on-chain anchor.',
  } satisfies Bilingual,
  errorOnchainFailed: {
    es: 'El anclaje on-chain falló o no se pudo confirmar.',
    en: 'On-chain anchor failed or could not be confirmed.',
  } satisfies Bilingual,
  errorVerification: {
    es: 'Error al verificar (RPC o servicio). Intentá de nuevo.',
    en: 'Verification error (RPC or service). Try again.',
  } satisfies Bilingual,
  errorGeneric: {
    es: 'No se pudo verificar el certificado. Intentá de nuevo.',
    en: 'Could not verify the certificate. Try again.',
  } satisfies Bilingual,
} as const;
