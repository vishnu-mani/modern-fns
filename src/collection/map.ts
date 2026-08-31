import {
  fromEntries,
  toEntries,
  type Collection,
  type CollectionKey,
} from '../internal/collection.js';

/**
 * Map over any container, **preserving its type**: plain objects stay objects, `Map`s stay
 * `Map`s, `Set`s stay `Set`s. Strings, iterables and class instances produce arrays.
 *
 * @example
 * map([1, 2], (n) => n * 2);                 // [2, 4]
 * map({ a: 1, b: 2 }, (n) => n * 2);         // { a: 2, b: 4 }
 * map(new Map([['a', 1]]), (n) => n + 1);    // Map { 'a' => 2 }
 */
export function map<T, R>(value: readonly T[], iteratee: (value: T, key: number) => R): R[];
export function map<T extends Record<string, unknown>, R>(
  value: T,
  iteratee: (value: T[keyof T], key: string) => R,
): Record<string, R>;
export function map<T, R>(value: Set<T>, iteratee: (value: T, key: number) => R): Set<R>;
export function map<K, T, R>(value: Map<K, T>, iteratee: (value: T, key: K) => R): Map<K, R>;
export function map<T, R>(value: Collection<T>, iteratee: (value: T, key: CollectionKey) => R): R[];
export function map<T, R>(
  value: Collection<T>,
  iteratee: (value: T, key: never, collection: Collection<T>) => R,
): unknown {
  const entries = toEntries(value).map(([key, item]): [CollectionKey, R] => [
    key,
    iteratee(item, key as never, value),
  ]);
  return fromEntries(value, entries);
}
export default map;
