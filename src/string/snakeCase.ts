import { words } from '../internal/words.js';

/**
 * Convert any casing to `snake_case` — the shape most SQL and Python APIs expect.
 *
 * @example
 * snakeCase('userFirstName'); // 'user_first_name'
 */
export function snakeCase(value: string): string {
  if (typeof value !== 'string') return '';
  return words(value)
    .map((word) => word.toLowerCase())
    .join('_');
}
export default snakeCase;
