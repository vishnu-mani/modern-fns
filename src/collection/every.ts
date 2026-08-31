import { toEntries, type Collection, type CollectionKey } from '../internal/collection.js';

/**
 * Do all values match? Short-circuits. Vacuously `true` for an empty container, like
 * `Array.prototype.every`.
 *
 * @example
 * every({ a: 1, b: 2 }, (n) => n > 0); // true
 * every([], () => false);              // true
 */
export function every<T>(
  value: Collection<T>,
  predicate: (value: T, key: CollectionKey, collection: Collection<T>) => unknown,
): boolean {
  for (const [key, item] of toEntries(value)) {
    if (!predicate(item, key, value)) return false;
  }
  return true;
}
export default every;
