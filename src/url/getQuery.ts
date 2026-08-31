import { getQueryParams } from './getQueryParams.js';
import type { ParseOptions, QueryValue } from '../internal/query.js';

/**
 * Read one query parameter from a URL. `undefined` when absent.
 *
 * @example
 * getQuery('/products?page=2', 'page');   // 2
 * getQuery('https://x.com?a=1', 'b');     // undefined
 */
export function getQuery(url: string, key: string, options?: ParseOptions): QueryValue | undefined {
  return getQueryParams(url, options)[key];
}
export default getQuery;
