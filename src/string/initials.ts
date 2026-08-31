/** Options for {@link initials}. */
export interface InitialsOptions {
  /** Maximum number of initials. Default `2`. */
  max?: number;
  /** Upper-case the result. Default `true`. */
  uppercase?: boolean;
}

/**
 * Build avatar initials from a name. With the default `max` of 2 it takes the **first and last**
 * name parts, skipping the middle ones; with `max: 1` it takes the first. Punctuation-only
 * tokens are skipped, and it is safe on emoji and non-Latin scripts.
 *
 * @example
 * initials('Vishnu M');                    // 'VM'
 * initials('john ronald reuel tolkien');   // 'JT'
 * initials('Vishnu', { max: 1 });          // 'V'
 * initials('  ');                          // ''
 */
export function initials(value: string, options: InitialsOptions = {}): string {
  if (typeof value !== 'string') return '';
  const { max = 2, uppercase = true } = options;
  if (max <= 0) return '';

  const parts = value
    .trim()
    .split(/[\s._-]+/u)
    .map((part) => part.replace(/^[^\p{L}\p{N}]+/u, ''))
    .filter((part) => part.length > 0);
  if (parts.length === 0) return '';

  const picked =
    parts.length <= max
      ? parts
      : max === 1
        ? [parts[0]]
        : [...parts.slice(0, max - 1), parts[parts.length - 1]];
  const result = picked.map((part) => String.fromCodePoint(part.codePointAt(0) as number)).join('');
  return uppercase ? result.toUpperCase() : result;
}
export default initials;
