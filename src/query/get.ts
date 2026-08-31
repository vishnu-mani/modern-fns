import { parseQuery, type ParseOptions, type QueryValue } from '../internal/query.js';

/**
 * Read one key from a query string.
 *
 * Returns `undefined` when the key is absent — distinct from `''`, which means "present but
 * empty" (`?q=`).
 *
 * @example
 * get('?page=2', 'page');       // 2
 * get('?q=', 'q');              // ''
 * get('?page=2', 'missing');    // undefined
 */
export function get(
  queryString: string,
  key: string,
  options?: ParseOptions,
): QueryValue | undefined {
  return parseQuery(queryString, options)[key];
}
export default get;
