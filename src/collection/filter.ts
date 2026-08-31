import {
  fromEntries,
  toEntries,
  type Collection,
  type CollectionKey,
} from '../internal/collection.js';

/**
 * Filter any container, **preserving its type**. Filtering an object by value — the thing
 * `Object.entries().filter().fromEntries()` does in three steps — becomes one call.
 *
 * @example
 * filter([1, 2, 3], (n) => n > 1);              // [2, 3]
 * filter({ a: 1, b: 2 }, (n) => n > 1);         // { b: 2 }
 * filter(form, (value) => value !== '');        // drop empty fields before PATCH
 */
export function filter<T>(value: readonly T[], predicate: (value: T, key: number) => unknown): T[];
export function filter<T extends Record<string, unknown>>(
  value: T,
  predicate: (value: T[keyof T], key: string) => unknown,
): Partial<T>;
export function filter<T>(value: Set<T>, predicate: (value: T, key: number) => unknown): Set<T>;
export function filter<K, T>(value: Map<K, T>, predicate: (value: T, key: K) => unknown): Map<K, T>;
export function filter<T>(
  value: Collection<T>,
  predicate: (value: T, key: CollectionKey) => unknown,
): T[];
export function filter<T>(
  value: Collection<T>,
  predicate: (value: T, key: never, collection: Collection<T>) => unknown,
): unknown {
  const entries = toEntries(value).filter(([key, item]) =>
    Boolean(predicate(item, key as never, value)),
  );
  return fromEntries(value, entries);
}
export default filter;
