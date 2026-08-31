import { toSelectorFn } from '../internal/selector.js';
import type { Selector } from '../types.js';

/**
 * Group items into a record keyed by a property name or derived key.
 *
 * Keys are stringified (object keys always are). Groups keep insertion order, except that
 * integer-like keys follow JavaScript's own numeric-key ordering (`'2'` before `'10'`).
 *
 * @example
 * groupBy(users, 'role');                    // { admin: [...], editor: [...] }
 * groupBy(orders, (o) => o.date.slice(0, 7)) // { '2026-08': [...] }
 */
export function groupBy<T>(array: readonly T[], selector: Selector<T>): Record<string, T[]> {
  const result: Record<string, T[]> = Object.create(null) as Record<string, T[]>;
  if (!Array.isArray(array)) return result;
  const select = toSelectorFn(selector);
  for (const item of array) {
    const key = String(select(item));
    (result[key] ??= []).push(item);
  }
  return result;
}

export default groupBy;
