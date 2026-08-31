import { toEntries, type Collection, type CollectionKey } from '../internal/collection.js';

/**
 * Iterate any container with one signature. Return `false` from the iteratee to stop early —
 * the thing `Array.prototype.forEach` cannot do.
 *
 * @example
 * each({ a: 1, b: 2 }, (value, key) => console.log(key, value));
 * each(bigList, (item) => (item.id === target ? false : undefined)); // early exit
 */
export function each<T>(
  value: Collection<T>,
  iteratee: (value: T, key: CollectionKey, collection: Collection<T>) => unknown,
): void {
  for (const [key, item] of toEntries(value)) {
    if (iteratee(item, key, value) === false) return;
  }
}
export default each;
