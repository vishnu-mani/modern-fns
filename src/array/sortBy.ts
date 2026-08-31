import { toSelectorFn } from '../internal/selector.js';
import type { Selector } from '../types.js';

/** Comparison that keeps `undefined`/`null` last and compares strings with `localeCompare`. */
export function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
  if (typeof a === 'boolean' || typeof b === 'boolean') return Number(a) - Number(b);
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a)) return Number.isNaN(b) ? 0 : 1;
    if (Number.isNaN(b)) return -1;
    return a - b;
  }
  const left = toComparable(a);
  const right = toComparable(b);
  if (left === undefined || right === undefined) return 0;
  return left.localeCompare(right);
}

/** Values we can meaningfully order as text; anything else sorts as equal (stable). */
function toComparable(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
    return String(value);
  }
  return undefined;
}

/**
 * Return a new array sorted ascending by a derived value. Stable, and never mutates the input
 * (unlike `Array.prototype.sort`).
 *
 * @example
 * sortBy(users, 'age');
 * sortBy(files, (f) => f.name.toLowerCase());
 */
export function sortBy<T>(array: readonly T[], selector: Selector<T, unknown>): T[] {
  if (!Array.isArray(array)) return [];
  const select = toSelectorFn(selector);
  return array
    .map((item, index) => ({ item, index, key: select(item) }))
    .sort((a, b) => compareValues(a.key, b.key) || a.index - b.index)
    .map((entry) => entry.item);
}

export default sortBy;
