import { words } from '../internal/words.js';

/**
 * Convert any casing to `camelCase`.
 *
 * @example
 * camelCase('user_first_name');  // 'userFirstName'
 * camelCase('XMLHttpRequest');   // 'xmlHttpRequest'
 * camelCase('hello world 42');   // 'helloWorld42'
 */
export function camelCase(value: string): string {
  if (typeof value !== 'string') return '';
  return words(value)
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('');
}
export default camelCase;
