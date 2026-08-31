/**
 * Convert any value to a string without the JavaScript surprises.
 *
 * | Input | Output |
 * | --- | --- |
 * | `'abc'` | `'abc'` |
 * | `123`, `true` | `'123'`, `'true'` |
 * | `null`, `undefined` | `defaultValue` (default `''`) — never `'null'`/`'undefined'` |
 * | `NaN`, `Infinity` | `defaultValue` |
 * | `[1, 2]` | `'1,2'` |
 * | `{ a: 1 }` | `'{"a":1}'` — never `'[object Object]'` |
 * | `Date` | ISO string |
 * | `Symbol`, `Function` | `defaultValue` |
 *
 * @example
 * toString(null);      // ''
 * toString({ a: 1 });  // '{"a":1}'
 * toString(undefined, '—'); // '—'
 */
export function toString(value: unknown, defaultValue = ''): string {
  if (value == null) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : defaultValue;
  if (typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  if (typeof value === 'symbol' || typeof value === 'function') return defaultValue;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? defaultValue : value.toISOString();
  if (Array.isArray(value)) return value.map((item) => toString(item, '')).join(',');
  try {
    const json = JSON.stringify(value);
    return json === undefined ? defaultValue : json;
  } catch {
    return defaultValue;
  }
}
export default toString;
