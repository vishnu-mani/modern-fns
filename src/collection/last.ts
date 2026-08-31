import { toEntries, type Collection } from '../internal/collection.js';

/**
 * Last value of any container, in iteration order. `undefined` when empty.
 *
 * @example
 * last([1, 2]);          // 2
 * last({ a: 1, b: 2 });  // 2
 */
export function last<T>(value: readonly T[]): T | undefined;
export function last<T>(value: Collection<T>): T | undefined;
export function last<T>(value: Collection<T>): T | undefined {
  if (Array.isArray(value)) return value.length > 0 ? (value[value.length - 1] as T) : undefined;
  const entries = toEntries(value);
  return entries.length > 0 ? entries[entries.length - 1][1] : undefined;
}
export default last;
