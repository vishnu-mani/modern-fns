import { parseAny } from '../internal/url.js';
import { parseQuery, type ParseOptions, type QueryObject } from '../internal/query.js';

/**
 * All query parameters of a URL, parsed.
 *
 * @example
 * getQueryParams('/products?page=2&tags=a&tags=b');
 * // { page: 2, tags: ['a', 'b'] }
 */
export function getQueryParams(url: string, options?: ParseOptions): QueryObject {
  return parseQuery(parseAny(url).url.search, options);
}
export default getQueryParams;
