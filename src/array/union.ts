/**
 * Concatenate arrays and de-duplicate, keeping first-seen order.
 *
 * @example
 * union([1, 2], [2, 3], [3, 4]); // [1, 2, 3, 4]
 */
export function union<T>(...arrays: ReadonlyArray<readonly T[] | null | undefined>): T[] {
  const seen = new Set<T>();
  for (const array of arrays) {
    if (!Array.isArray(array)) continue;
    for (const item of array) seen.add(item);
  }
  return Array.from(seen);
}

export default union;
