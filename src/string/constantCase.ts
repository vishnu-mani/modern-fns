import { words } from '../internal/words.js';

/**
 * Convert any casing to `CONSTANT_CASE` — env vars, action types, enum keys.
 *
 * @example
 * constantCase('userFirstName'); // 'USER_FIRST_NAME'
 */
export function constantCase(value: string): string {
  if (typeof value !== 'string') return '';
  return words(value)
    .map((word) => word.toUpperCase())
    .join('_');
}
export default constantCase;
