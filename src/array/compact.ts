/**
 * Remove all falsy values (`false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`).
 *
 * The return type narrows accordingly, so `compact(list)` on `(string | null)[]` yields `string[]`.
 *
 * @example
 * compact([0, 1, false, 2, '', 3, null]); // [1, 2, 3]
 */
export function compact<T>(array: readonly T[]): Exclude<T, null | undefined | false | 0 | ''>[] {
  if (!Array.isArray(array)) return [];
  return array.filter(Boolean) as Exclude<T, null | undefined | false | 0 | ''>[];
}

export default compact;
