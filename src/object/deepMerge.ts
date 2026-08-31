import { isPlainObject } from '../internal/types.js';

/** Options for {@link deepMerge}. */
export interface DeepMergeOptions {
  /**
   * How to combine arrays.
   * - `'replace'` (default) — the later array wins outright.
   * - `'concat'` — arrays are appended.
   * - `'merge'` — arrays are merged index by index.
   */
  arrays?: 'replace' | 'concat' | 'merge';
  /** When `true` (default) a source value of `undefined` does not overwrite an existing value. */
  skipUndefined?: boolean;
}

type Merge<A, B> = Omit<A, keyof B> & B;

/**
 * Recursively merge plain objects into a brand-new object. Later sources win.
 *
 * Only plain objects are merged recursively — `Date`, `Map`, class instances and (by default)
 * arrays are treated as atomic values, which is what configuration merging almost always wants.
 * None of the inputs are mutated.
 *
 * @example
 * deepMerge({ a: { b: 1, c: 2 } }, { a: { c: 3 } }); // { a: { b: 1, c: 3 } }
 * deepMerge(defaults, userConfig, { arrays: 'concat' } as never);
 */
export function deepMerge<A extends object, B extends object>(a: A, b: B): Merge<A, B>;
export function deepMerge<A extends object, B extends object, C extends object>(
  a: A,
  b: B,
  c: C,
): Merge<Merge<A, B>, C>;
export function deepMerge<A extends object, B extends object, C extends object, D extends object>(
  a: A,
  b: B,
  c: C,
  d: D,
): Merge<Merge<Merge<A, B>, C>, D>;
export function deepMerge(...objects: Array<object | null | undefined>): Record<string, unknown>;
export function deepMerge(...objects: Array<object | null | undefined>): Record<string, unknown> {
  return objects.reduce<Record<string, unknown>>((acc, source) => mergeTwo(acc, source, {}), {});
}

/** {@link deepMerge} with explicit options. */
export function deepMergeWith(
  options: DeepMergeOptions,
  ...objects: Array<object | null | undefined>
): Record<string, unknown> {
  return objects.reduce<Record<string, unknown>>(
    (acc, source) => mergeTwo(acc, source, options),
    {},
  );
}

function mergeTwo(
  target: Record<string, unknown>,
  source: object | null | undefined,
  options: DeepMergeOptions,
): Record<string, unknown> {
  if (source == null) return target;
  if (!isPlainObject(source)) return target;

  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor') continue;
    const next = source[key];
    if (next === undefined && options.skipUndefined !== false) continue;

    const current = result[key];
    if (isPlainObject(current) && isPlainObject(next)) {
      result[key] = mergeTwo(current, next, options);
    } else if (Array.isArray(current) && Array.isArray(next)) {
      result[key] = mergeArrays(current, next, options);
    } else {
      result[key] = next;
    }
  }
  return result;
}

function mergeArrays(a: unknown[], b: unknown[], options: DeepMergeOptions): unknown[] {
  if (options.arrays === 'concat') return [...a, ...b];
  if (options.arrays === 'merge') {
    return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => {
      const left = a[i];
      const right = b[i];
      if (isPlainObject(left) && isPlainObject(right)) return mergeTwo(left, right, options);
      return i < b.length ? right : left;
    });
  }
  return [...b];
}

export default deepMerge;
