const UNESCAPES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': '\u00a0',
};

/**
 * Reverse {@link escapeHtml}, and decode numeric entities (`&#38;`, `&#x26;`).
 *
 * `&nbsp;` decodes to a real non-breaking space (U+00A0), not a plain space — call
 * {@link normalizeWhitespace} afterwards if you want it collapsed.
 *
 * @example
 * unescapeHtml('&lt;b&gt;hi&lt;/b&gt;'); // '<b>hi</b>'
 * unescapeHtml('caf&#233;');             // 'café'
 */
export function unescapeHtml(value: string): string {
  if (typeof value !== 'string') return '';
  return value.replace(/&(?:#x?[0-9a-f]+|[a-z]+);/gi, (entity) => {
    const named = UNESCAPES[entity.toLowerCase()];
    if (named !== undefined) return named;
    const numeric = /^&#(x?)([0-9a-f]+);$/i.exec(entity);
    if (!numeric) return entity;
    const code = parseInt(numeric[2], numeric[1] ? 16 : 10);
    return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
      ? String.fromCodePoint(code)
      : entity;
  });
}
export default unescapeHtml;
