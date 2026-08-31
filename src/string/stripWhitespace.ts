/**
 * Remove **all** whitespace, including unicode spaces, tabs and newlines.
 *
 * Use for comparing user input where spacing is noise (coupon codes, IBANs, card numbers).
 * For display text you almost always want {@link normalizeWhitespace} instead.
 *
 * @example
 * stripWhitespace(' 4111 1111 1111 1111 '); // '4111111111111111'
 */
export function stripWhitespace(value: string): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/gu, '');
}
export default stripWhitespace;
