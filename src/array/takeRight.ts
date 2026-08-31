/**
 * Last `count` elements, in original order.
 *
 * @example
 * takeRight([1, 2, 3], 2); // [2, 3]
 */
export function takeRight<T>(array: readonly T[], count = 1): T[] {
  if (!Array.isArray(array)) return [];
  const n = Math.trunc(count);
  if (!Number.isFinite(n) || n <= 0) return [];
  return n >= array.length ? array.slice() : array.slice(array.length - n);
}

export default takeRight;
