import { toSelectorFn } from '../internal/selector.js';
import { compareValues } from './sortBy.js';
import type { Selector, SortDirection } from '../types.js';

/**
 * Sort by several keys with independent directions. Stable and immutable.
 *
 * Missing directions default to `'asc'`.
 *
 * @example
 * orderBy(users, ['role', 'age'], ['asc', 'desc']);
 * orderBy(rows, [(r) => r.total], ['desc']);
 */
export function orderBy<T>(
  array: readonly T[],
  selectors: ReadonlyArray<Selector<T, unknown>>,
  directions: readonly SortDirection[] = [],
): T[] {
  if (!Array.isArray(array)) return [];
  if (!Array.isArray(selectors) || selectors.length === 0) return array.slice();
  const selects = selectors.map((selector) => toSelectorFn(selector));

  return array
    .map((item, index) => ({ item, index, keys: selects.map((select) => select(item)) }))
    .sort((a, b) => {
      for (let i = 0; i < selects.length; i += 1) {
        const order = compareValues(a.keys[i], b.keys[i]);
        if (order !== 0) return directions[i] === 'desc' ? -order : order;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.item);
}

export default orderBy;
