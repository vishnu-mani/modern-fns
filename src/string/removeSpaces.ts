/**
 * Remove ASCII space characters only, leaving tabs and newlines intact.
 *
 * The narrow counterpart to {@link stripWhitespace}, for when line structure matters.
 *
 * @example
 * removeSpaces('a b\tc\nd'); // 'ab\tc\nd'
 */
export function removeSpaces(value: string): string {
  if (typeof value !== 'string') return '';
  return value.replace(/ +/g, '');
}
export default removeSpaces;
