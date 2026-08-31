/**
 * Normalise "one or many or nothing" into an array — the shape every list renderer wants.
 *
 * | Input | Output |
 * | --- | --- |
 * | `[1, 2]` | the same array (returned as-is; nothing is mutated) |
 * | `null`, `undefined` | `[]` |
 * | `'abc'` | `['abc']` — **not** split into characters |
 * | `Set`, `Map`, generators, `NodeList` | spread into an array (`Map` yields entries) |
 * | `{ a: 1 }`, `42`, `true` | `[value]` |
 *
 * @example
 * toArray(response.data ?? null); // always safe to .map()
 */
export function toArray<T>(value: T | readonly T[] | null | undefined): T[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') return [value];
  if (typeof value === 'object' && Symbol.iterator in (value as object)) {
    return Array.from(value as Iterable<T>);
  }
  return [value as T];
}
export default toArray;
