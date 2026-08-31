/**
 * First element, or `undefined` for an empty or non-array input.
 *
 * @example
 * first([1, 2, 3]); // 1
 * first([]);        // undefined
 */
export function first<T>(array: readonly T[]): T | undefined {
  return Array.isArray(array) ? array[0] : undefined;
}

export default first;
