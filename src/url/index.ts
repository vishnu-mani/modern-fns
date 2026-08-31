/**
 * URL utilities. Every function accepts absolute, protocol-relative and relative URLs, and
 * returns the same shape it received.
 *
 * @module url
 */
export { parseUrl, type ParsedUrl } from './parseUrl.js';
export { buildUrl, type BuildUrlOptions } from './buildUrl.js';
export { getQuery } from './getQuery.js';
export { getQueryParams } from './getQueryParams.js';
export { setQuery } from './setQuery.js';
export { setQueryParams } from './setQueryParams.js';
export { removeQuery } from './removeQuery.js';
export { mergeQuery } from './mergeQuery.js';
export { hasQuery } from './hasQuery.js';
export { setHash } from './setHash.js';
export { removeHash } from './removeHash.js';
export { isSameUrl, type IsSameUrlOptions } from './isSameUrl.js';
export { joinUrl } from './joinUrl.js';
