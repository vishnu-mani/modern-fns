import { parseAny } from '../internal/url.js';
import { parseQuery, type ParseOptions, type QueryObject } from '../internal/query.js';

/** A fully decomposed URL. */
export interface ParsedUrl {
  /** Scheme without the colon, e.g. `'https'`. Empty for relative URLs. */
  protocol: string;
  /** Host without the port. Empty for relative URLs. */
  hostname: string;
  /** Port as a string, or `''` when default/absent. */
  port: string;
  /** `hostname:port`. */
  host: string;
  /** `protocol://host`, or `''` for relative URLs. */
  origin: string;
  /** Always starts with `/`. */
  pathname: string;
  /** Raw query including the leading `?`, or `''`. */
  search: string;
  /** Parsed query parameters. */
  query: QueryObject;
  /** Fragment including the leading `#`, or `''`. */
  hash: string;
  /** Username from the authority, if any. */
  username: string;
  /** Password from the authority, if any. */
  password: string;
  /** `false` when the input had no scheme and no authority. */
  isAbsolute: boolean;
  /** The normalised URL as a string, in the same shape as the input. */
  href: string;
}

/**
 * Decompose any URL — absolute, protocol-relative or relative — into its parts, with the query
 * already parsed. `new URL()` throws on relative input; this does not.
 *
 * @example
 * parseUrl('https://shop.com:8080/p?page=2&tags=a&tags=b#reviews');
 * // {
 * //   protocol: 'https', hostname: 'shop.com', port: '8080',
 * //   pathname: '/p', search: '?page=2&tags=a&tags=b',
 * //   query: { page: 2, tags: ['a', 'b'] }, hash: '#reviews', isAbsolute: true, ...
 * // }
 *
 * @example
 * parseUrl('/products?page=2').isAbsolute; // false
 */
export function parseUrl(url: string, options?: ParseOptions): ParsedUrl {
  const parts = parseAny(url);
  const { url: parsed, isRelative, isProtocolRelative } = parts;
  const absolute = !isRelative;

  return {
    protocol: absolute && !isProtocolRelative ? parsed.protocol.replace(/:$/, '') : '',
    hostname: absolute ? parsed.hostname : '',
    port: absolute ? parsed.port : '',
    host: absolute ? parsed.host : '',
    origin: absolute && !isProtocolRelative ? parsed.origin : '',
    pathname: parsed.pathname,
    search: parsed.search,
    query: parseQuery(parsed.search, options),
    hash: parsed.hash,
    username: absolute ? parsed.username : '',
    password: absolute ? parsed.password : '',
    isAbsolute: absolute,
    href: absolute
      ? isProtocolRelative
        ? parsed.href.replace(/^https?:/, '')
        : parsed.href
      : `${parsed.pathname}${parsed.search}${parsed.hash}`,
  };
}
export default parseUrl;
