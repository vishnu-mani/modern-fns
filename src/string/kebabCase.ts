import { words } from '../internal/words.js';

/**
 * Convert any casing to `kebab-case` — CSS classes, file names, DOM attributes.
 *
 * @example
 * kebabCase('userFirstName'); // 'user-first-name'
 * kebabCase('XMLHttpRequest') // 'xml-http-request'
 */
export function kebabCase(value: string): string {
  if (typeof value !== 'string') return '';
  return words(value)
    .map((word) => word.toLowerCase())
    .join('-');
}
export default kebabCase;
