import { stringifyQuery, type StringifyOptions } from '../internal/query.js';

export type { StringifyOptions, ArrayFormat } from '../internal/query.js';

/**
 * Serialise an object into a query string.
 *
 * `undefined` values and empty arrays/objects are dropped, `Date` values become ISO strings,
 * and nested objects become `a[b]=1`. Key order follows the object unless `sort` is set.
 *
 * @example
 * stringify({ page: 2, tags: ['vue', 'nuxt'] });
 * // 'page=2&tags=vue&tags=nuxt'
 *
 * @example
 * stringify({ tags: ['a', 'b'] }, { arrayFormat: 'bracket' }); // 'tags[]=a&tags[]=b'
 * stringify({ tags: ['a', 'b'] }, { arrayFormat: 'comma' });   // 'tags=a,b'
 * stringify({ filter: { status: 'active' } });                 // 'filter[status]=active'
 * stringify({ b: 1, a: 2 }, { sort: true, addQueryPrefix: true }); // '?a=2&b=1'
 */
export function stringify(object: unknown, options?: StringifyOptions): string {
  return stringifyQuery(object, options);
}
export default stringify;
