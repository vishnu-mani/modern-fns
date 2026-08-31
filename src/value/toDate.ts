/**
 * Parse a `Date` from the values APIs actually return, or fall back.
 *
 * | Input | Output |
 * | --- | --- |
 * | `Date` (valid) | a **copy**, so the original cannot be mutated |
 * | `Date` (invalid) | `defaultValue` |
 * | `1700000000000` | epoch **milliseconds** |
 * | `1700000000` (10 digits) | epoch **seconds** — auto-detected |
 * | `'2026-08-31'`, ISO strings | parsed |
 * | `''`, `'not a date'`, `null`, `undefined`, `{}` | `defaultValue` (default `undefined`) |
 *
 * @example
 * toDate('2026-08-31')?.getUTCFullYear(); // 2026
 * toDate(null, new Date(0));              // 1970-01-01
 */
export function toDate(value: unknown): Date | undefined;
export function toDate<D>(value: unknown, defaultValue: D): Date | D;
export function toDate(value: unknown, defaultValue: unknown = undefined): unknown {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? defaultValue : new Date(value.getTime());
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = Math.abs(value) < 1e11 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? defaultValue : date;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return defaultValue;
    const numeric = /^-?\d+$/.test(trimmed) ? Number(trimmed) : NaN;
    const date = Number.isFinite(numeric)
      ? new Date(Math.abs(numeric) < 1e11 ? numeric * 1000 : numeric)
      : new Date(trimmed);
    return Number.isNaN(date.getTime()) ? defaultValue : date;
  }
  return defaultValue;
}
export default toDate;
