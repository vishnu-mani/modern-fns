/**
 * `true` for `null` or `undefined` — the check you actually want before touching a value.
 *
 * @example
 * isNil(0);    // false
 * isNil('');   // false
 * isNil(null); // true
 */
export function isNil(value: unknown): value is null | undefined {
  return value == null;
}
export default isNil;
