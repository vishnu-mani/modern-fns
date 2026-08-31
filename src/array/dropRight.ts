/**
 * All elements except the last `count`.
 *
 * @example
 * dropRight([1, 2, 3], 1); // [1, 2]
 */
export function dropRight<T>(array: readonly T[], count = 1): T[] {
  if (!Array.isArray(array)) return [];
  const n = Math.trunc(count);
  if (!Number.isFinite(n) || n <= 0) return array.slice();
  return n >= array.length ? [] : array.slice(0, array.length - n);
}

export default dropRight;
