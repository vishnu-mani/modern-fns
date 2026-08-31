import { toSelectorFn } from '../internal/selector.js';
import type { Selector } from '../types.js';

/**
 * Build a lookup table keyed by a property name or derived key.
 *
 * On duplicate keys the **last** item wins, matching object-literal semantics.
 *
 * @example
 * indexBy(users, 'id'); // { '1': user1, '2': user2 }
 */
export function indexBy<T>(array: readonly T[], selector: Selector<T>): Record<string, T> {
  const result: Record<string, T> = Object.create(null) as Record<string, T>;
  if (!Array.isArray(array)) return result;
  const select = toSelectorFn(selector);
  for (const item of array) {
    result[String(select(item))] = item;
  }
  return result;
}

export default indexBy;
