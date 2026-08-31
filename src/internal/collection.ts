/** Internal iteration helpers backing the container-agnostic `collection` module. */

import { isPlainObject } from './types.js';

/** Anything the `collection` module can iterate. */
export type Collection<T = unknown> =
  | readonly T[]
  | Record<string, T>
  | Set<T>
  | Map<unknown, T>
  | string
  | Iterable<T>
  | null
  | undefined;

/**
 * The key passed to an iteratee: the property name for objects, the index for arrays, strings
 * and sets, and the real key for `Map`s — so it is only knowable as `unknown`.
 */
export type CollectionKey = unknown;

/** Normalise any supported container into `[key, value]` pairs. */
export function toEntries<T>(collection: Collection<T>): Array<[CollectionKey, T]> {
  if (collection == null) return [];
  if (typeof collection === 'string') {
    return [...collection].map((char, index) => [index, char as unknown as T]);
  }
  if (Array.isArray(collection)) return collection.map((value, index) => [index, value as T]);
  if (collection instanceof Map) return [...collection.entries()] as Array<[CollectionKey, T]>;
  if (collection instanceof Set) return [...collection].map((value, index) => [index, value]);
  if (isPlainObject(collection)) {
    return Object.entries(collection);
  }
  if (typeof (collection as Iterable<T>)[Symbol.iterator] === 'function') {
    return [...(collection as Iterable<T>)].map((value, index) => [index, value]);
  }
  return Object.entries(collection as unknown as Record<string, T>);
}

/** Rebuild a container of the same kind from `[key, value]` pairs. */
export function fromEntries<T>(
  original: Collection<unknown>,
  entries: Array<[CollectionKey, T]>,
): unknown {
  if (original instanceof Map) return new Map(entries);
  if (original instanceof Set) return new Set(entries.map(([, value]) => value));
  if (isPlainObject(original)) {
    return Object.fromEntries(entries as Array<[string, T]>);
  }
  return entries.map(([, value]) => value);
}
