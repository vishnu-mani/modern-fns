import { isPlainObject } from '../internal/types.js';

/**
 * Coerce a value into a plain object.
 *
 * | Input | Output |
 * | --- | --- |
 * | `{ a: 1 }` | the same object |
 * | `'{"a":1}'` | parsed JSON, when it parses to an object |
 * | `Map` | `Object.fromEntries(map)` |
 * | `[['a', 1]]` (entry pairs) | `{ a: 1 }` |
 * | `[1, 2]` | `{ '0': 1, '1': 2 }` |
 * | `URLSearchParams` | `{ key: value }` |
 * | anything else | `defaultValue` (default `{}`) |
 *
 * @example
 * toObject(localStorage.getItem('prefs')); // {} when absent or malformed
 */
export function toObject(
  value: unknown,
  defaultValue: Record<string, unknown> = {},
): Record<string, unknown> {
  if (isPlainObject(value)) return value;
  if (value instanceof Map) return Object.fromEntries(value as Map<PropertyKey, unknown>);
  if (typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams) {
    return Object.fromEntries(value.entries());
  }
  if (Array.isArray(value)) {
    const isPairs =
      value.length > 0 && value.every((item) => Array.isArray(item) && item.length === 2);
    if (isPairs) return Object.fromEntries(value as Array<[PropertyKey, unknown]>);
    return { ...(value as unknown[]) };
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (isPlainObject(parsed)) return parsed;
        if (Array.isArray(parsed)) return toObject(parsed, defaultValue);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }
  return defaultValue;
}
export default toObject;
