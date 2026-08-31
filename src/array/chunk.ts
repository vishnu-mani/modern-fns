/**
 * Split an array into consecutive groups of `size`.
 *
 * The final chunk contains the remainder and may be shorter. The input is never mutated.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 * chunk([], 3);              // []
 */
export function chunk<T>(array: readonly T[], size: number): T[][] {
  if (!Array.isArray(array) || array.length === 0) return [];
  const step = Math.trunc(size);
  if (!Number.isFinite(step) || step < 1) return [];

  const result: T[][] = new Array(Math.ceil(array.length / step));
  for (let i = 0, j = 0; i < array.length; i += step, j += 1) {
    result[j] = array.slice(i, i + step);
  }
  return result;
}

export default chunk;
