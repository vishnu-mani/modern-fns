const TRUTHY = new Set(['true', '1', 'yes', 'y', 'on', 'enabled']);
const FALSY = new Set(['false', '0', 'no', 'n', 'off', 'disabled', '']);

/**
 * Interpret the string booleans that arrive from query strings, env vars, data attributes and
 * CSV files — without JavaScript's `Boolean('false') === true` trap.
 *
 * | Input | Output |
 * | --- | --- |
 * | `true` / `false` | as-is |
 * | `'true'`, `'1'`, `'yes'`, `'y'`, `'on'`, `'enabled'` (any case) | `true` |
 * | `'false'`, `'0'`, `'no'`, `'n'`, `'off'`, `'disabled'`, `''` | `false` |
 * | `1` / `0` and any other finite number | `true` for non-zero |
 * | `null`, `undefined`, unknown strings, objects | `defaultValue` (default `false`) |
 *
 * Unknown strings deliberately fall back rather than guessing.
 *
 * @example
 * toBoolean('false');          // false
 * toBoolean('maybe', true);    // true  (fallback)
 */
export function toBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value !== 0 : defaultValue;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TRUTHY.has(normalized)) return true;
    if (FALSY.has(normalized)) return false;
    return defaultValue;
  }
  return defaultValue;
}
export default toBoolean;
