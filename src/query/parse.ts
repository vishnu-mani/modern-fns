import { parseQuery, type ParseOptions, type QueryObject } from '../internal/query.js';

export type { ParseOptions, QueryObject, QueryValue } from '../internal/query.js';

/**
 * Parse a query string into a typed object.
 *
 * Accepts a bare query (`'a=1'`), a prefixed one (`'?a=1'`) or a whole URL — the query part is
 * extracted either way. Repeated keys become arrays, `a[b]=1` becomes a nested object, and
 * clean numeric/boolean strings are coerced (both switchable).
 *
 * @example
 * parse('?page=2&tags=vue&tags=nuxt');
 * // { page: 2, tags: ['vue', 'nuxt'] }
 *
 * @example Nested and bracketed
 * parse('filter[status]=active&ids[]=1&ids[]=2');
 * // { filter: { status: 'active' }, ids: [1, 2] }
 *
 * @example Keep everything as strings
 * parse('page=2', { parseNumbers: false }); // { page: '2' }
 */
export function parse(queryString: string, options?: ParseOptions): QueryObject {
  return parseQuery(queryString, options);
}
export default parse;
