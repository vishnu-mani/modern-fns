import { parseQuery } from '../internal/query.js';
import { toNumber } from '../value/toNumber.js';

/**
 * Read a key as a number, with a fallback for missing or malformed values. The safe way to
 * read `?page=`, `?page=abc` or `?page=2` from a URL you do not control.
 *
 * @example
 * parseNumber('?page=2', 'page');           // 2
 * parseNumber('?page=abc', 'page', 1);      // 1
 * parseNumber('?x=1', 'page', 1);           // 1
 */
export function parseNumber(queryString: string, key: string): number | undefined;
export function parseNumber<D>(queryString: string, key: string, defaultValue: D): number | D;
export function parseNumber(queryString: string, key: string, defaultValue?: unknown): unknown {
  const raw = parseQuery(queryString, { parseNumbers: false, parseBooleans: false })[key];
  if (raw === undefined || Array.isArray(raw) || (raw !== null && typeof raw === 'object')) {
    return defaultValue;
  }
  return toNumber(raw, defaultValue);
}
export default parseNumber;
