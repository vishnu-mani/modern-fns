import { isPlainObject } from '../internal/types.js';
import { joinPath } from '../internal/path.js';
import { isEqual } from '../object/isEqual.js';
import type { Change } from '../types.js';

/** Options controlling how {@link diff} walks a structure. */
export interface DiffOptions {
  /**
   * How arrays are compared.
   * - `'index'` (default) — recurse position by position; reports `added`/`removed` for tail
   *   length changes. Best for ordered lists.
   * - `'whole'` — treat the array as one atomic value; a single `changed` entry.
   * - `'key'` — match items by `key` regardless of position. Best for collections of records.
   */
  arrays?: 'index' | 'whole' | 'key';
  /** Item identity for `arrays: 'key'`. A property name or a function. */
  key?: string | ((item: unknown) => PropertyKey);
  /**
   * Custom equality. Return `true`/`false` to decide, or `undefined` to defer to the default
   * structural comparison. Receives the dotted path, so rules can be field-specific.
   */
  equals?: (a: unknown, b: unknown, path: string) => boolean | undefined;
  /** Stop recursing below this depth and report the whole subtree as one change. */
  maxDepth?: number;
  /** Return `true` to skip a path entirely (e.g. `updatedAt`). */
  ignore?: (path: string) => boolean;
}

/**
 * Compute the list of structural changes between two values.
 *
 * The output is a flat, serialisable array of `{ path, type, oldValue?, newValue? }` — directly
 * usable for form dirty-checking, audit logs, `PATCH` bodies, state sync and undo/redo
 * (feed it back to {@link patch}).
 *
 * Neither input is mutated. Paths use the same dotted/bracket notation the `object` module
 * accepts, so `get`, `set` and `unset` all understand them.
 *
 * @example
 * diff({ name: 'John', age: 28 }, { name: 'Vishnu', age: 29, city: 'Kochi' });
 * // [
 * //   { path: 'name', type: 'changed', oldValue: 'John', newValue: 'Vishnu' },
 * //   { path: 'age',  type: 'changed', oldValue: 28, newValue: 29 },
 * //   { path: 'city', type: 'added',   newValue: 'Kochi' },
 * // ]
 *
 * @example Ignore server-managed fields
 * diff(before, after, { ignore: (path) => path.endsWith('updatedAt') });
 */
export function diff(oldObject: unknown, newObject: unknown, options: DiffOptions = {}): Change[] {
  const changes: Change[] = [];
  walk(oldObject, newObject, '', 0, options, changes);
  return changes;
}

function equalsAt(a: unknown, b: unknown, path: string, options: DiffOptions): boolean {
  const custom = options.equals?.(a, b, path);
  if (custom !== undefined) return custom;
  return isEqual(a, b);
}

function keyOf(item: unknown, key: DiffOptions['key']): PropertyKey {
  if (typeof key === 'function') return key(item);
  if (typeof key === 'string' && item != null && typeof item === 'object') {
    return (item as Record<string, unknown>)[key] as PropertyKey;
  }
  return item as PropertyKey;
}

function walk(
  a: unknown,
  b: unknown,
  path: string,
  depth: number,
  options: DiffOptions,
  out: Change[],
): void {
  if (path !== '' && options.ignore?.(path)) return;
  if (equalsAt(a, b, path, options)) return;

  const tooDeep = options.maxDepth !== undefined && depth >= options.maxDepth;
  const bothPlain = isPlainObject(a) && isPlainObject(b);
  const bothArrays = Array.isArray(a) && Array.isArray(b);

  if (!tooDeep && bothPlain) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      const childPath = joinPath(path, key);
      const hasA = Object.prototype.hasOwnProperty.call(a, key);
      const hasB = Object.prototype.hasOwnProperty.call(b, key);
      if (hasA && !hasB) {
        if (!options.ignore?.(childPath))
          out.push({ path: childPath, type: 'removed', oldValue: a[key] });
      } else if (!hasA && hasB) {
        if (!options.ignore?.(childPath))
          out.push({ path: childPath, type: 'added', newValue: b[key] });
      } else {
        walk(a[key], b[key], childPath, depth + 1, options, out);
      }
    }
    return;
  }

  if (!tooDeep && bothArrays && options.arrays !== 'whole') {
    if (options.arrays === 'key' && options.key !== undefined) {
      diffArraysByKey(a, b, path, depth, options, out);
      return;
    }
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i += 1) {
      const childPath = `${path}[${i}]`;
      if (i >= b.length) {
        if (!options.ignore?.(childPath))
          out.push({ path: childPath, type: 'removed', oldValue: a[i] });
      } else if (i >= a.length) {
        if (!options.ignore?.(childPath))
          out.push({ path: childPath, type: 'added', newValue: b[i] });
      } else {
        walk(a[i], b[i], childPath, depth + 1, options, out);
      }
    }
    return;
  }

  if (path === '' && a === undefined) {
    out.push({ path, type: 'added', newValue: b });
    return;
  }
  out.push({ path, type: 'changed', oldValue: a, newValue: b });
}

function diffArraysByKey(
  a: readonly unknown[],
  b: readonly unknown[],
  path: string,
  depth: number,
  options: DiffOptions,
  out: Change[],
): void {
  const oldByKey = new Map(a.map((item) => [keyOf(item, options.key), item]));
  const newByKey = new Map(b.map((item) => [keyOf(item, options.key), item]));

  b.forEach((item, index) => {
    const key = keyOf(item, options.key);
    const childPath = `${path}[${index}]`;
    if (!oldByKey.has(key)) {
      if (!options.ignore?.(childPath))
        out.push({ path: childPath, type: 'added', newValue: item });
      return;
    }
    walk(oldByKey.get(key), item, childPath, depth + 1, options, out);
  });

  a.forEach((item, index) => {
    const key = keyOf(item, options.key);
    if (newByKey.has(key)) return;
    const childPath = `${path}[${index}]`;
    if (!options.ignore?.(childPath))
      out.push({ path: childPath, type: 'removed', oldValue: item });
  });
}

export default diff;
