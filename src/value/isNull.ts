/** `true` only for `null` (never for `undefined`). */
export function isNull(value: unknown): value is null {
  return value === null;
}
export default isNull;
