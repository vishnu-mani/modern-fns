/** `true` for string primitives. Boxed `new String()` objects are intentionally excluded. */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
export default isString;
