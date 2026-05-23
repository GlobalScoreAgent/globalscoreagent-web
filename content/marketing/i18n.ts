export type Lang = 'es' | 'en';

export type Bilingual = Record<Lang, string>;

export function pick(lang: Lang, text: Bilingual): string {
  return text[lang];
}
