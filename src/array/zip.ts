/** Element type produced by {@link zip} for a tuple of input arrays. */
export type Zipped<T extends ReadonlyArray<readonly unknown[]>> = {
  [K in keyof T]: T[K] extends readonly (infer U)[] ? U | undefined : never;
};

/**
 * Combine arrays position-wise. The result length is the **longest** input; missing positions
 * are `undefined`, so no data is silently dropped.
 *
 * @example
 * zip([1, 2], ['a', 'b']);  // [[1, 'a'], [2, 'b']]
 * zip([1, 2, 3], ['a']);    // [[1, 'a'], [2, undefined], [3, undefined]]
 */
export function zip<T extends ReadonlyArray<readonly unknown[]>>(...arrays: T): Zipped<T>[] {
  const lists = arrays.filter((array): array is readonly unknown[] => Array.isArray(array));
  if (lists.length === 0) return [];
  const length = Math.max(...lists.map((array) => array.length));
  const result: Zipped<T>[] = new Array(length);
  for (let i = 0; i < length; i += 1) {
    result[i] = lists.map((array) => array[i]) as Zipped<T>;
  }
  return result;
}

export default zip;
