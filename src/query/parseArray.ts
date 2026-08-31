import { parseQuery, type ParseOptions, type QueryValue } from '../internal/query.js';

/** Options for {@link parseArray}. */
export interface ParseArrayOptions extends ParseOptions {
  /** Also split single values on this separator. Default `','`; pass `null` to disable. */
  separator?: string | null;
}

/**
 * Always read a key as an array, whatever form it arrived in.
 *
 * `?tags=vue&tags=nuxt`, `?tags[]=vue`, `?tags=vue,nuxt` and `?tags=vue` all yield an array,
 * and a missing key yields `[]` — so list rendering never needs a shape check.
 *
 * @example
 * parseArray('?tags=vue&tags=nuxt', 'tags'); // ['vue', 'nuxt']
 * parseArray('?tags=vue', 'tags');           // ['vue']
 * parseArray('?tags=a,b', 'tags');           // ['a', 'b']
 * parseArray('', 'tags');                    // []
 */
export function parseArray(
  queryString: string,
  key: string,
  options: ParseArrayOptions = {},
): QueryValue[] {
  const { separator = ',', ...parseOptions } = options;
  const raw = parseQuery(queryString, parseOptions)[key];
  if (raw === undefined) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && separator !== null && raw.includes(separator)) {
    return raw.split(separator);
  }
  if (raw === '') return [];
  return [raw];
}
export default parseArray;
