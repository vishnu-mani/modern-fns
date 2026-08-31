import { toSelectorFn } from '../internal/selector.js';
import type { Selector } from '../types.js';

/**
 * Remove duplicates by a derived key, keeping the first occurrence.
 *
 * @example
 * uniqueBy(users, 'id');
 * uniqueBy(files, (f) => f.name.toLowerCase());
 */
export function uniqueBy<T>(array: readonly T[], selector: Selector<T>): T[] {
  if (!Array.isArray(array)) return [];
  const select = toSelectorFn(selector);
  const seen = new Set<PropertyKey>();
  const result: T[] = [];
  for (const item of array) {
    const key = select(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export default uniqueBy;
