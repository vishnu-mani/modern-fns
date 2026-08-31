/**
 * Upper-case the first character, leaving the rest untouched.
 *
 * Unlike a naive `str[0].toUpperCase() + str.slice(1)`, this is safe on empty strings,
 * non-strings and astral characters (emoji, many scripts).
 *
 * @example
 * capitalize('hello world'); // 'Hello world'
 * capitalize('');            // ''
 */
export function capitalize(value: string): string {
  if (typeof value !== 'string' || value === '') return '';
  const head = String.fromCodePoint(value.codePointAt(0) as number);
  return head.toUpperCase() + value.slice(head.length);
}
export default capitalize;
