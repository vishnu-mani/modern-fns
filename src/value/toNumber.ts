/**
 * Parse a number out of the messy values real forms and APIs produce.
 *
 * Handles currency symbols, thousands separators and surrounding whitespace:
 *
 * | Input | Output |
 * | --- | --- |
 * | `42`, `'42'`, `' 42 '` | `42` |
 * | `'1,299.50'`, `'₹1,299.50'`, `'$1,299.50'` | `1299.5` |
 * | `'1.299,50'` (European) | `1299.5` |
 * | `'50%'` | `50` |
 * | `'1e3'` | `1000` |
 * | `true` / `false` | `1` / `0` |
 * | `''`, `'abc'`, `null`, `undefined`, `[]`, `{}`, `NaN` | `defaultValue` (default `NaN`) |
 *
 * Separator rule: when both `.` and `,` appear, the **last** one is the decimal separator.
 * When only `,` appears it is a thousands separator if followed by exactly three digits
 * (`'1,500'` -> `1500`), otherwise a decimal separator (`'1,5'` -> `1.5`).
 *
 * @example
 * toNumber('₹1,299.50');   // 1299.5
 * toNumber('abc', 0);      // 0
 */
export function toNumber(value: unknown): number;
export function toNumber<D>(value: unknown, defaultValue: D): number | D;
export function toNumber(value: unknown, defaultValue: unknown = NaN): unknown {
  if (typeof value === 'number') return Number.isFinite(value) ? value : defaultValue;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'bigint') return Number(value);
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? defaultValue : time;
  }
  if (typeof value !== 'string') return defaultValue;

  const trimmed = value.trim();
  if (trimmed === '') return defaultValue;

  // Fast path: already a clean numeric literal (covers 1e3, 0x10, .5, -3).
  const direct = Number(trimmed);
  if (Number.isFinite(direct)) return direct;

  const cleaned = trimmed.replace(/[^\d.,\-+eE]/g, '');
  if (cleaned === '' || !/\d/.test(cleaned)) return defaultValue;

  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');
  let normalized: string;

  if (lastDot !== -1 && lastComma !== -1) {
    const decimalSep = lastDot > lastComma ? '.' : ',';
    const groupSep = decimalSep === '.' ? ',' : '.';
    normalized = cleaned.split(groupSep).join('').replace(decimalSep, '.');
  } else if (lastComma !== -1) {
    const isGrouping = /,\d{3}(?:\D|$)/.test(cleaned) || cleaned.split(',').length > 2;
    normalized = isGrouping ? cleaned.split(',').join('') : cleaned.replace(',', '.');
  } else {
    normalized = cleaned;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}
export default toNumber;
