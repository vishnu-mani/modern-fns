/**
 * Normalise "no value" to `null` before sending data to an API.
 *
 * `undefined`, `''` and whitespace-only strings become `null`; everything else (including `0`
 * and `false`) is preserved. JSON drops `undefined` keys entirely, which silently turns a
 * "clear this field" edit into a no-op — this is the fix.
 *
 * @example
 * nullable(form.middleName); // '' -> null
 * nullable(0);               // 0
 */
export function nullable<T>(value: T): NonNullable<T> | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}
export default nullable;
