import { toEntries, type Collection, type CollectionKey } from '../internal/collection.js';

/**
 * First value matching a predicate, in any container. `undefined` when nothing matches.
 *
 * @example
 * find(users, (u) => u.isAdmin);
 * find({ a: 1, b: 5 }, (n) => n > 2);      // 5
 * find(new Set([1, 2]), (n) => n === 2);   // 2
 */
export function find<T>(
  value: Collection<T>,
  predicate: (value: T, key: CollectionKey, collection: Collection<T>) => unknown,
): T | undefined {
  for (const [key, item] of toEntries(value)) {
    if (predicate(item, key, value)) return item;
  }
  return undefined;
}
export default find;
