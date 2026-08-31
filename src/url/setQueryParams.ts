import { withQuery } from './internal.js';
import type { QueryObject, StringifyOptions } from '../internal/query.js';

/**
 * **Replace** the entire query with the given params. Use {@link mergeQuery} to keep existing
 * ones.
 *
 * @example
 * setQueryParams('/products?page=2&sort=price', { page: 1 }); // '/products?page=1'
 * setQueryParams('/products?page=2', {});                     // '/products'
 */
export function setQueryParams(
  url: string,
  params: Record<string, unknown>,
  options?: StringifyOptions,
): string {
  return withQuery(url, () => (params ?? {}) as QueryObject, options);
}
export default setQueryParams;
