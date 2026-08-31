/**
 * Remove duplicate values, keeping the first occurrence and the original order.
 *
 * Uses SameValueZero, so `NaN` de-duplicates correctly (unlike `indexOf`).
 *
 * @example
 * unique([1, 2, 2, 3]);       // [1, 2, 3]
 * unique([NaN, NaN]);         // [NaN]
 */
export function unique<T>(array: readonly T[]): T[] {
  if (!Array.isArray(array)) return [];
  return Array.from(new Set(array));
}

export default unique;
