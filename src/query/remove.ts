import { parseQuery, stringifyQuery, type StringifyOptions } from '../internal/query.js';
import { hadPrefix, withPrefix } from './internal.js';

/**
 * Remove one or more keys, returning a new query string.
 *
 * @example
 * remove('page=2&sort=price', 'sort');            // 'page=2'
 * remove('a=1&b=2&c=3', ['a', 'c']);              // 'b=2'
 * remove('a=1', 'missing');                        // 'a=1'
 */
export function remove(
  queryString: string,
  key: string | readonly string[],
  options?: StringifyOptions,
): string {
  const parsed = parseQuery(queryString);
  for (const name of Array.isArray(key) ? key : [key as string]) delete parsed[name];
  return withPrefix(stringifyQuery(parsed, options), hadPrefix(queryString));
}
export default remove;
