/** Options for {@link slugify}. */
export interface SlugifyOptions {
  /** Word separator. Default `'-'`. */
  separator?: string;
  /** Lower-case the result. Default `true`. */
  lower?: boolean;
  /** Trim to at most this many characters, never splitting mid-word. */
  maxLength?: number;
}

const TRANSLITERATE: Record<string, string> = {
  ß: 'ss',
  æ: 'ae',
  Æ: 'ae',
  œ: 'oe',
  Œ: 'oe',
  ø: 'o',
  Ø: 'o',
  đ: 'd',
  Đ: 'd',
  ł: 'l',
  Ł: 'l',
  þ: 'th',
  Þ: 'th',
  '&': ' and ',
};

/**
 * Turn any text into a URL-safe slug.
 *
 * Diacritics are folded to ASCII (`café` -> `cafe`), `&` becomes `and`, punctuation and emoji
 * are dropped, and runs of separators collapse. Non-Latin scripts that have no ASCII
 * equivalent (Chinese, Arabic, Devanagari…) are removed, so always keep a fallback slug such as
 * the record id if you support those inputs.
 *
 * @example
 * slugify('Hello Vue World!');        // 'hello-vue-world'
 * slugify('Café & Bar — 2026');       // 'cafe-and-bar-2026'
 * slugify('Hello World', { separator: '_' }); // 'hello_world'
 */
export function slugify(value: string, options: SlugifyOptions = {}): string {
  if (typeof value !== 'string' || value === '') return '';
  const { separator = '-', lower = true, maxLength } = options;

  let result = value.replace(/[ßæÆœŒøØđĐłŁþÞ&]/g, (char) => TRANSLITERATE[char] ?? char);
  result = result.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  result = result.replace(/[^A-Za-z0-9]+/g, ' ').trim();
  if (lower) result = result.toLowerCase();
  result = result.split(/\s+/).filter(Boolean).join(separator);

  if (maxLength !== undefined && result.length > maxLength) {
    const clipped = result.slice(0, maxLength);
    const lastSeparator = clipped.lastIndexOf(separator);
    result = lastSeparator > 0 ? clipped.slice(0, lastSeparator) : clipped;
  }
  return result;
}
export default slugify;
