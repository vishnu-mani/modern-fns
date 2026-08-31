import { withQuery } from './internal.js';
import type { QueryObject, StringifyOptions } from '../internal/query.js';

/**
 * Merge params into a URL's existing query. `undefined` values remove their key, which makes
 * "apply this filter patch to the current URL" a single call.
 *
 * @example
 * mergeQuery('/p?page=2&sort=price', { page: 3, q: 'shoes' });
 * // '/p?page=3&sort=price&q=shoes'
 *
 * mergeQuery('/p?page=2&sort=price', { sort: undefined }); // '/p?page=2'
 */
export function mergeQuery(
  url: string,
  params: Record<string, unknown>,
  options?: StringifyOptions,
): string {
  return withQuery(
    url,
    (query) => {
      if (params == null || typeof params !== 'object') return;
      for (const key of Object.keys(params)) {
        const value = params[key];
        if (value === undefined) delete query[key];
        else query[key] = value as QueryObject[string];
      }
    },
    options,
  );
}
export default mergeQuery;
