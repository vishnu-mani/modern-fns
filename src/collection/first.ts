import { toEntries, type Collection } from '../internal/collection.js';

/**
 * First value of any container, in iteration order. `undefined` when empty.
 *
 * @example
 * first([1, 2]);              // 1
 * first({ a: 1, b: 2 });      // 1
 * first(new Set(['x']));      // 'x'
 * first('');                  // undefined
 */
export function first<T>(value: readonly T[]): T | undefined;
export function first<T>(value: Collection<T>): T | undefined;
export function first<T>(value: Collection<T>): T | undefined {
  if (Array.isArray(value)) return value[0] as T | undefined;
  const entries = toEntries(value);
  return entries.length > 0 ? entries[0][1] : undefined;
}
export default first;
