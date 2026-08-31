/**
 * `true` for finite number primitives.
 *
 * `NaN` and `Infinity` are **not** numbers you can safely do arithmetic with, so they return
 * `false`. Use `typeof x === 'number'` if you genuinely want them.
 *
 * @example
 * isNumber(1);      // true
 * isNumber(NaN);    // false
 * isNumber('1');    // false
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
export default isNumber;
