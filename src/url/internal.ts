/** Shared plumbing for the URL helpers: parse, mutate the query, re-render the same shape. */

import { formatAny, parseAny } from '../internal/url.js';
import {
  parseQuery,
  stringifyQuery,
  type QueryObject,
  type StringifyOptions,
} from '../internal/query.js';

/** Apply a transformation to a URL's query object and return the rebuilt URL. */
export function withQuery(
  url: string,
  update: (query: QueryObject) => QueryObject | void,
  options?: StringifyOptions,
): string {
  const parts = parseAny(url);
  const query = parseQuery(parts.url.search);
  const next = update(query) ?? query;
  const search = stringifyQuery(next, options);
  parts.url.search = search === '' ? '' : `?${search}`;
  return formatAny(parts, url);
}
