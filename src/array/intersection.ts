import { toSelectorFn } from '../internal/selector.js';
import type { Selector } from '../types.js';

/**
 * Values present in both arrays, in the order of the first array, de-duplicated.
 *
 * @example
 * intersection([1, 2, 2, 3], [2, 3, 4]); // [2, 3]
 * intersection(a, b, 'id');
 */
export function intersection<T>(
  array: readonly T[],
  other: readonly T[],
  selector?: Selector<T>,
): T[] {
  if (!Array.isArray(array) || !Array.isArray(other)) return [];
  const select = selector === undefined ? undefined : toSelectorFn(selector);
  const keyOf = (item: T): unknown => (select ? select(item) : item);
  const include = new Set<unknown>(other.map(keyOf));
  const seen = new Set<unknown>();
  const result: T[] = [];
  for (const item of array) {
    const key = keyOf(item);
    if (!include.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export default intersection;
