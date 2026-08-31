import { set } from '../object/set.js';
import { unset } from '../object/unset.js';
import type { Change } from '../types.js';

/**
 * Apply a change list produced by {@link diff}, immutably.
 *
 * `patch(before, diff(before, after))` deep-equals `after`, which is what makes undo/redo and
 * optimistic state sync straightforward: store the change list, apply it forward, or
 * {@link invert} it and apply it back.
 *
 * `removed` changes on array indices splice the item out; because indices shift, removals are
 * applied last and from the highest index down.
 *
 * @example
 * const changes = diff(before, after);
 * const rebuilt = patch(before, changes);        // === after (structurally)
 * const undone  = patch(after, invert(changes)); // === before
 */
export function patch<T>(object: T, changes: readonly Change[]): T {
  if (!Array.isArray(changes) || changes.length === 0) return object;

  let result = object;
  const removals: Change[] = [];

  for (const change of changes) {
    if (change.type === 'removed') {
      removals.push(change);
      continue;
    }
    if (change.path === '') {
      result = change.newValue as T;
      continue;
    }
    result = set(result, change.path, change.newValue);
  }

  // Highest index first so earlier splices do not shift later targets.
  removals
    .slice()
    .sort((a, b) => b.path.localeCompare(a.path, undefined, { numeric: true }))
    .forEach((change) => {
      result = unset(result, change.path);
    });

  return result;
}

/**
 * Reverse a change list so it can be applied to undo an edit.
 *
 * @example
 * patch(after, invert(diff(before, after))); // back to `before`
 */
export function invert(changes: readonly Change[]): Change[] {
  return changes.map((change): Change => {
    if (change.type === 'added')
      return { path: change.path, type: 'removed', oldValue: change.newValue };
    if (change.type === 'removed')
      return { path: change.path, type: 'added', newValue: change.oldValue };
    return {
      path: change.path,
      type: 'changed',
      oldValue: change.newValue,
      newValue: change.oldValue,
    };
  });
}

export default patch;
