import { isEqual } from '../object/isEqual.js';
import { diff, type DiffOptions } from '../diff/diff.js';
import type { Change } from '../types.js';

/** One item that exists in both lists but is no longer identical. */
export interface UpdatedEntry<T> {
  /** The identity value the two items were matched on. */
  key: PropertyKey;
  /** The item as it was. */
  before: T;
  /** The item as it now is. */
  after: T;
  /** Field-level changes, from the `diff` module. */
  changes: Change[];
}

/** Result of {@link diffArray}. */
export interface ArrayDiff<T> {
  /** Items present only in the new array. */
  added: T[];
  /** Items present only in the old array. */
  removed: T[];
  /** Items present in both, but not deep-equal. Empty when no `key` is given. */
  updated: Array<UpdatedEntry<T>>;
  /** Items present in both and deep-equal. */
  unchanged: T[];
}

/** Options for {@link diffArray}. */
export interface DiffArrayOptions extends Pick<DiffOptions, 'equals' | 'ignore'> {
  /** Compute per-item field changes for `updated` entries. Default `true`. */
  withChanges?: boolean;
}

/**
 * Compare two lists and report what was added, removed, updated and left alone.
 *
 * Pass a `key` (property name or function) whenever items have identity — then moving an item
 * is not a change, and an edited item lands in `updated` with its field-level `changes` rather
 * than appearing as one removal plus one addition.
 *
 * Without a `key`, items are matched by deep equality: `updated` is always empty because there
 * is no way to tell an edit from a replacement.
 *
 * Neither input is mutated; the returned arrays hold the original item references.
 *
 * @example
 * diffArray(oldUsers, newUsers, 'id');
 * // {
 * //   added:     [{ id: 4, ... }],
 * //   removed:   [{ id: 2, ... }],
 * //   updated:   [{ key: 1, before, after, changes: [{ path: 'name', type: 'changed', ... }] }],
 * //   unchanged: [{ id: 3, ... }],
 * // }
 *
 * @example Primitive lists
 * diffArray([1, 2, 3], [2, 3, 4]);
 * // { added: [4], removed: [1], updated: [], unchanged: [2, 3] }
 */
export function diffArray<T>(
  oldArray: readonly T[],
  newArray: readonly T[],
  key?: keyof T | ((item: T) => PropertyKey),
  options: DiffArrayOptions = {},
): ArrayDiff<T> {
  const before = Array.isArray(oldArray) ? oldArray : [];
  const after = Array.isArray(newArray) ? newArray : [];
  const result: ArrayDiff<T> = { added: [], removed: [], updated: [], unchanged: [] };

  if (key === undefined) {
    const remaining = before.slice();
    for (const item of after) {
      const index = remaining.findIndex((candidate) => isEqual(candidate, item));
      if (index === -1) result.added.push(item);
      else {
        result.unchanged.push(item);
        remaining.splice(index, 1);
      }
    }
    result.removed = remaining;
    return result;
  }

  const identify = (item: T): PropertyKey =>
    typeof key === 'function'
      ? key(item)
      : ((item as Record<PropertyKey, unknown>)?.[key] as PropertyKey);

  const beforeByKey = new Map<PropertyKey, T>();
  for (const item of before) beforeByKey.set(identify(item), item);

  const seen = new Set<PropertyKey>();
  for (const item of after) {
    const id = identify(item);
    seen.add(id);
    if (!beforeByKey.has(id)) {
      result.added.push(item);
      continue;
    }
    const previous = beforeByKey.get(id) as T;
    if (isEqual(previous, item)) {
      result.unchanged.push(item);
      continue;
    }
    result.updated.push({
      key: id,
      before: previous,
      after: item,
      changes:
        options.withChanges === false
          ? []
          : diff(previous, item, { equals: options.equals, ignore: options.ignore }),
    });
  }

  for (const item of before) {
    if (!seen.has(identify(item))) result.removed.push(item);
  }

  return result;
}

export default diffArray;
