/**
 * All elements except the first `count`.
 *
 * @example
 * drop([1, 2, 3], 1); // [2, 3]
 */
export function drop<T>(array: readonly T[], count = 1): T[] {
  if (!Array.isArray(array)) return [];
  const n = Math.trunc(count);
  if (!Number.isFinite(n) || n <= 0) return array.slice();
  return array.slice(n);
}

export default drop;
