import { parseAny } from '../internal/url.js';
import { parseQuery } from '../internal/query.js';
import { isEqual } from '../object/isEqual.js';

/** Options for {@link isSameUrl}. */
export interface IsSameUrlOptions {
  /** Ignore query parameter order. Default `true`. */
  ignoreQueryOrder?: boolean;
  /** Ignore a trailing slash on the path. Default `true`. */
  ignoreTrailingSlash?: boolean;
  /** Ignore the fragment. Default `false`. */
  ignoreHash?: boolean;
  /** Ignore the query entirely. Default `false`. */
  ignoreQuery?: boolean;
}

/**
 * Compare two URLs semantically rather than as strings.
 *
 * `'/p?a=1&b=2'` and `'/p/?b=2&a=1'` are the same page; a plain `===` says otherwise. This is
 * the check behind "is this nav link active?" and "did the route really change?".
 *
 * @example
 * isSameUrl('/p?a=1&b=2', '/p/?b=2&a=1');              // true
 * isSameUrl('/p#a', '/p#b');                           // false
 * isSameUrl('/p#a', '/p#b', { ignoreHash: true });     // true
 * isSameUrl('https://x.com/p', 'https://x.com:443/p'); // true
 */
export function isSameUrl(urlA: string, urlB: string, options: IsSameUrlOptions = {}): boolean {
  const {
    ignoreQueryOrder = true,
    ignoreTrailingSlash = true,
    ignoreHash = false,
    ignoreQuery = false,
  } = options;

  if (typeof urlA !== 'string' || typeof urlB !== 'string') return false;
  const a = parseAny(urlA);
  const b = parseAny(urlB);
  if (a.isRelative !== b.isRelative) return false;
  if (!a.isRelative && a.url.origin !== b.url.origin) return false;

  const pathA = ignoreTrailingSlash ? a.url.pathname.replace(/\/+$/, '') : a.url.pathname;
  const pathB = ignoreTrailingSlash ? b.url.pathname.replace(/\/+$/, '') : b.url.pathname;
  if (pathA !== pathB) return false;

  if (!ignoreQuery) {
    if (ignoreQueryOrder) {
      if (!isEqual(parseQuery(a.url.search), parseQuery(b.url.search))) return false;
    } else if (a.url.search !== b.url.search) return false;
  }

  if (!ignoreHash && a.url.hash !== b.url.hash) return false;
  return true;
}
export default isSameUrl;
