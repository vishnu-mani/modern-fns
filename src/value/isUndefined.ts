/** `true` only for `undefined` (never for `null`). */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}
export default isUndefined;
