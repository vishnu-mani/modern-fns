/**
 * Sliding windows of `size` consecutive elements (step 1).
 *
 * Returns `[]` when the array is shorter than the window — the honest answer for
 * "compare each item with its neighbour" problems.
 *
 * @example
 * window([1, 2, 3, 4], 2); // [[1, 2], [2, 3], [3, 4]]
 * window([1], 2);          // []
 */
export function window<T>(array: readonly T[], size: number): T[][] {
  if (!Array.isArray(array)) return [];
  const width = Math.trunc(size);
  if (!Number.isFinite(width) || width < 1 || array.length < width) return [];
  const result: T[][] = new Array(array.length - width + 1);
  for (let i = 0; i <= array.length - width; i += 1) result[i] = array.slice(i, i + width);
  return result;
}

/**
 * Alias for {@link window}. Prefer this in browser code: a named import called `window`
 * shadows the DOM global for the whole module, which is a confusing thing to debug.
 *
 * @example
 * import { slidingWindow } from 'modern-fns';
 * slidingWindow(prices, 7).map(average); // 7-point moving average
 */
export const slidingWindow = window;

export default window;
