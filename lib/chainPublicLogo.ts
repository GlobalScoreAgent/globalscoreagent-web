/**
 * Maps chains.logo_file_name from DB to a browser URL.
 * Convention: value is basename without extension (e.g. "ETH_logo"), file is public/ETH_logo.png
 */
const KNOWN_EXT = /\.(png|svg|jpe?g|webp|gif)$/i;

export function publicChainLogoUrl(logoFileName: string | null | undefined): string | null {
  if (logoFileName == null || typeof logoFileName !== 'string') return null;
  const s = logoFileName.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) return s;
  if (KNOWN_EXT.test(s)) return `/${s}`;
  return `/${s}.png`;
}
