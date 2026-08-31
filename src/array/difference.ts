import { toSelectorFn } from '../internal/selector.js';
import type { Selector } from '../types.js';

/**
 * Values in `array` that are not in `other`, order preserved, duplicates from `array` kept.
 *
 * Comparison is SameValueZero by default; pass a selector to compare by a derived key
 * (the common case for objects, where reference equality is useless).
 *
 * @example
 * difference([1, 2, 3], [2]);            // [1, 3]
 * difference(oldUsers, newUsers, 'id');  // users no longer present
 */
export function difference<T>(
  array: readonly T[],
  other: readonly T[],
  selector?: Selector<T>,
): T[] {
  if (!Array.isArray(array)) return [];
  const rest = Array.isArray(other) ? other : [];
  if (selector === undefined) {
    const exclude = new Set<T>(rest);
    return array.filter((item) => !exclude.has(item));
  }
  const select = toSelectorFn(selector);
  const exclude = new Set<PropertyKey>(rest.map((item) => select(item)));
  return array.filter((item) => !exclude.has(select(item)));
}

export default difference;
