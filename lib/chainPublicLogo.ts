/**
 * Maps chains.logo_file_name from DB to a browser URL.
 * Convention: value is basename without extension (e.g. "ETH_logo"), file is public/ETH_logo.png
 */
const KNOWN_EXT = /\.(png|svg|jpe?g|webp|gif)$/i;

/** Known chain display names → logo basename in public/ */
const CHAIN_NAME_TO_LOGO_BASENAME: Record<string, string> = {
  base: 'Base_logo',
  'base mainnet': 'Base_logo',
  ethereum: 'ETH_logo',
  'ethereum mainnet': 'ETH_logo',
  bnb: 'BNB_logo',
  'bnb smart chain': 'BNB_logo',
  'bnb chain': 'BNB_logo',
  arbitrum: 'Arbitrum_logo',
  'arbitrum one': 'Arbitrum_logo',
  'arbitrum-one': 'Arbitrum_logo',
  polygon: 'Polygon_logo',
  'polygon mainnet': 'Polygon_logo',
  matic: 'Polygon_logo',
  celo: 'celo_logo',
  'celo mainnet': 'celo_logo',
  gnosis: 'gnosis-logo',
  'gnosis chain': 'gnosis-logo',
  'x layer': 'xlayer_logo',
  'x layer mainnet': 'xlayer_logo',
  xlayer: 'xlayer_logo',
};

export function chainLogoUrlFromChainName(
  chainName: string | null | undefined,
): string | null {
  return publicChainLogoUrl(resolveChainLogoFileName(null, chainName));
}

export function chainLogoBasenameFromChainName(
  chainName: string | null | undefined,
): string | null {
  if (chainName == null || typeof chainName !== 'string') return null;
  const key = chainName.trim().toLowerCase();
  if (!key) return null;
  return CHAIN_NAME_TO_LOGO_BASENAME[key] ?? null;
}

export function resolveChainLogoFileName(
  logoFileName: string | null | undefined,
  chainName: string | null | undefined,
): string | null {
  if (logoFileName != null && typeof logoFileName === 'string') {
    const trimmed = logoFileName.trim();
    if (trimmed) return trimmed;
  }
  return chainLogoBasenameFromChainName(chainName);
}

export function publicChainLogoUrl(logoFileName: string | null | undefined): string | null {
  if (logoFileName == null || typeof logoFileName !== 'string') return null;
  const s = logoFileName.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) return s;
  if (KNOWN_EXT.test(s)) return `/${s}`;
  return `/${s}.png`;
}
