import { capitalize } from './capitalize.js';

/**
 * Capitalise every whitespace-separated word, preserving the original spacing and punctuation.
 *
 * @example
 * capitalizeWords('hello vue world');  // 'Hello Vue World'
 * capitalizeWords('  spaced   out  '); // '  Spaced   Out  '
 */
export function capitalizeWords(value: string): string {
  if (typeof value !== 'string' || value === '') return '';
  return value.replace(/\S+/gu, (word) => capitalize(word));
}
export default capitalizeWords;
