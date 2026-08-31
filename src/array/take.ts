/**
 * First `count` elements. Negative or non-finite counts yield `[]`.
 *
 * @example
 * take([1, 2, 3], 2); // [1, 2]
 */
export function take<T>(array: readonly T[], count = 1): T[] {
  if (!Array.isArray(array)) return [];
  const n = Math.trunc(count);
  if (!Number.isFinite(n) || n <= 0) return [];
  return array.slice(0, n);
}

export default take;
