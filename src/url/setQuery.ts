import { withQuery } from './internal.js';
import type { QueryValue, StringifyOptions } from '../internal/query.js';

/**
 * Set one query parameter, keeping everything else — including the path, the other params,
 * their order, and the hash. Relative URLs stay relative.
 *
 * Passing `undefined` removes the key.
 *
 * @example
 * setQuery('/products?page=2', 'sort', 'price'); // '/products?page=2&sort=price'
 * setQuery('/products?page=2', 'page', 3);       // '/products?page=3'
 * setQuery('/p#top', 'a', 1);                    // '/p?a=1#top'
 */
export function setQuery(
  url: string,
  key: string,
  value: QueryValue | undefined,
  options?: StringifyOptions,
): string {
  return withQuery(
    url,
    (query) => {
      if (value === undefined) delete query[key];
      else query[key] = value;
    },
    options,
  );
}
export default setQuery;
