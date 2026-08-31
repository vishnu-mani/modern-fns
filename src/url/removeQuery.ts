import { withQuery } from './internal.js';
import type { StringifyOptions } from '../internal/query.js';

/**
 * Remove one or more query parameters from a URL.
 *
 * @example
 * removeQuery('/p?page=2&sort=price', 'sort');        // '/p?page=2'
 * removeQuery('/p?a=1&b=2&c=3', ['a', 'c']);          // '/p?b=2'
 * removeQuery('/p?a=1', 'a');                         // '/p'
 */
export function removeQuery(
  url: string,
  key: string | readonly string[],
  options?: StringifyOptions,
): string {
  return withQuery(
    url,
    (query) => {
      for (const name of Array.isArray(key) ? key : [key as string]) delete query[name];
    },
    options,
  );
}
export default removeQuery;
