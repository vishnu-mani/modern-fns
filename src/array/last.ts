/**
 * Last element, or `undefined` for an empty or non-array input.
 *
 * @example
 * last([1, 2, 3]); // 3
 */
export function last<T>(array: readonly T[]): T | undefined {
  return Array.isArray(array) && array.length > 0 ? array[array.length - 1] : undefined;
}

export default last;
