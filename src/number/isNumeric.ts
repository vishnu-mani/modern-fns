/**
 * Can this value be used as a number? `true` for finite numbers and for strings that parse
 * cleanly (`'42'`, `' 3.14 '`, `'-1e3'`).
 *
 * Deliberately `false` for `''`, `'  '`, `null`, `[]`, `true`, `NaN` and `Infinity` — all of
 * which `Number()` happily coerces, which is the source of countless form-validation bugs.
 *
 * @example
 * isNumeric('42');    // true
 * isNumeric('');      // false  (Number('') is 0)
 * isNumeric(null);    // false  (Number(null) is 0)
 * isNumeric([]);      // false  (Number([]) is 0)
 * isNumeric('1,000'); // false  (use toNumber for formatted input)
 */
export function isNumeric(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed === '') return false;
  return Number.isFinite(Number(trimmed));
}
export default isNumeric;
