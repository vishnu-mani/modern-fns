import { isPlainObject } from '../internal/types.js';

/**
 * "Is there nothing here?" across every container type.
 *
 * Empty: `null`, `undefined`, `''`, `'   '` (whitespace only), `[]`, `{}`, empty `Map`/`Set`,
 * and `NaN`.
 * Not empty: `0`, `false`, `new Date()`, and any non-container value.
 *
 * @example
 * isEmpty('');     // true
 * isEmpty('  ');   // true
 * isEmpty(0);      // false  <- deliberate: 0 is a value
 * isEmpty([]);     // true
 * isEmpty({ a: 1 }); // false
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value === 'boolean') return false;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}
export default isEmpty;
