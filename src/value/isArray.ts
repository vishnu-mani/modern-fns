/** `true` for arrays. A typed alias of `Array.isArray` that narrows to `unknown[]`. */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
export default isArray;
