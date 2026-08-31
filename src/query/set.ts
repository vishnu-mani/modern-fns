import {
  parseQuery,
  stringifyQuery,
  type QueryValue,
  type StringifyOptions,
} from '../internal/query.js';
import { hadPrefix, withPrefix } from './internal.js';

/**
 * Set (or replace) one key, returning a new query string. Existing keys keep their position;
 * new keys are appended.
 *
 * A `?` prefix on the input is preserved on the output. Setting `undefined` removes the key.
 *
 * @example
 * set('page=2', 'sort', 'price');        // 'page=2&sort=price'
 * set('?page=2', 'page', 3);             // '?page=3'
 * set('page=2', 'tags', ['vue', 'nuxt']); // 'page=2&tags=vue&tags=nuxt'
 */
export function set(
  queryString: string,
  key: string,
  value: QueryValue | undefined,
  options?: StringifyOptions,
): string {
  const parsed = parseQuery(queryString);
  if (value === undefined) delete parsed[key];
  else parsed[key] = value;
  return withPrefix(stringifyQuery(parsed, options), hadPrefix(queryString));
}
export default set;
