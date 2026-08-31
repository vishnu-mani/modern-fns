import { toEntries, type Collection, type CollectionKey } from '../internal/collection.js';

/**
 * Does at least one value match? Short-circuits.
 *
 * @example
 * some({ a: 0, b: 3 }, (n) => n > 2); // true
 * some([], () => true);               // false
 */
export function some<T>(
  value: Collection<T>,
  predicate: (value: T, key: CollectionKey, collection: Collection<T>) => unknown,
): boolean {
  for (const [key, item] of toEntries(value)) {
    if (predicate(item, key, value)) return true;
  }
  return false;
}
export default some;
