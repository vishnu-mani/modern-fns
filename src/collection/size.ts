import { toEntries, type Collection } from '../internal/collection.js';

/**
 * Count the items in **any** container — array, string, object, `Map`, `Set` or iterable —
 * without remembering which one uses `.length`, `.size` or `Object.keys()`.
 *
 * Strings count by code point, so emoji count as one. `null`/`undefined` are `0`.
 *
 * @example
 * size([1, 2, 3]);            // 3
 * size({ a: 1, b: 2 });       // 2
 * size(new Set([1, 1, 2]));   // 2
 * size('héllo');              // 5
 * size(null);                 // 0
 */
export function size(value: Collection): number {
  if (value == null) return 0;
  if (typeof value === 'string') return [...value].length;
  if (Array.isArray(value)) return value.length;
  if (value instanceof Map || value instanceof Set) return value.size;
  return toEntries(value).length;
}
export default size;
