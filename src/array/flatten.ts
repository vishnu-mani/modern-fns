/**
 * Flatten one level of nesting.
 *
 * @example
 * flatten([1, [2, 3], [4]]); // [1, 2, 3, 4]
 * flatten([[[1]], [2]]);     // [[1], 2]
 */
export function flatten<T>(array: readonly (T | readonly T[])[]): T[] {
  if (!Array.isArray(array)) return [];
  return array.flat(1) as T[];
}

export default flatten;
