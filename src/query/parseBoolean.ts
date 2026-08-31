import { parseQuery } from '../internal/query.js';
import { toBoolean } from '../value/toBoolean.js';

/**
 * Read a key as a boolean, understanding `true/false/1/0/yes/no/on/off`.
 *
 * A **bare** key (`?debug`) counts as `true`, matching how feature flags are written by hand.
 *
 * @example
 * parseBoolean('?debug=true', 'debug');   // true
 * parseBoolean('?debug', 'debug');        // true
 * parseBoolean('?debug=0', 'debug');      // false
 * parseBoolean('?x=1', 'debug', false);   // false
 */
export function parseBoolean(queryString: string, key: string, defaultValue = false): boolean {
  const parsed = parseQuery(queryString, { parseNumbers: false, parseBooleans: false });
  if (!Object.prototype.hasOwnProperty.call(parsed, key)) return defaultValue;
  const raw = parsed[key];
  if (raw === '') return true;
  if (Array.isArray(raw) || (raw !== null && typeof raw === 'object')) return defaultValue;
  return toBoolean(raw, defaultValue);
}
export default parseBoolean;
