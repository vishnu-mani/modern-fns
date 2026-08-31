import {
  parseQuery,
  stringifyQuery,
  type QueryObject,
  type StringifyOptions,
} from '../internal/query.js';
import { hadPrefix, withPrefix } from './internal.js';

/**
 * Merge an object of values into a query string. Provided keys overwrite; everything else is
 * kept. `undefined` values delete their key, which makes "apply this filter patch" a one-liner.
 *
 * @example
 * merge('page=2&sort=price', { page: 3, q: 'shoes' });
 * // 'page=3&sort=price&q=shoes'
 *
 * @example Clear a filter
 * merge('page=2&sort=price', { sort: undefined }); // 'page=2'
 */
export function merge(
  queryString: string,
  values: Record<string, unknown>,
  options?: StringifyOptions,
): string {
  const parsed = parseQuery(queryString);
  if (values != null && typeof values === 'object') {
    for (const key of Object.keys(values)) {
      const value = values[key];
      if (value === undefined) delete parsed[key];
      else parsed[key] = value as QueryObject[string];
    }
  }
  return withPrefix(stringifyQuery(parsed, options), hadPrefix(queryString));
}
export default merge;
