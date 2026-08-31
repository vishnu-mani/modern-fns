/**
 * Split an array into `[matching, notMatching]` in a single pass.
 *
 * @example
 * const [active, inactive] = partition(users, (u) => u.isActive);
 */
export function partition<T>(
  array: readonly T[],
  predicate: (item: T, index: number) => boolean,
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  if (!Array.isArray(array)) return [pass, fail];
  for (let i = 0; i < array.length; i += 1) {
    (predicate(array[i], i) ? pass : fail).push(array[i]);
  }
  return [pass, fail];
}

export default partition;
