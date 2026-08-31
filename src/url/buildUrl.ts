import { stringifyQuery, type StringifyOptions } from '../internal/query.js';

/** Input for {@link buildUrl}. Every field is optional. */
export interface BuildUrlOptions {
  /** Scheme, with or without the trailing colon. Default `'https'` when a host is given. */
  protocol?: string;
  /** Host name, optionally including a port. */
  host?: string;
  /** Port; ignored when `host` already contains one. */
  port?: string | number;
  /** Path; a leading slash is added when a host is present. */
  path?: string;
  /** Query parameters. Nested objects and arrays are supported. */
  query?: Record<string, unknown>;
  /** Fragment, with or without the leading `#`. */
  hash?: string;
  /** Base URL to resolve `path` against. Takes precedence over `protocol`/`host`. */
  base?: string;
  /** Query serialisation options. */
  queryOptions?: StringifyOptions;
}

/**
 * Assemble a URL from parts, so no code has to concatenate strings and guess about slashes,
 * `?` versus `&`, or encoding.
 *
 * @example
 * buildUrl({ host: 'api.shop.com', path: '/v1/products', query: { page: 2, tags: ['a', 'b'] } });
 * // 'https://api.shop.com/v1/products?page=2&tags=a&tags=b'
 *
 * @example Relative output
 * buildUrl({ path: '/products', query: { page: 2 }, hash: 'top' }); // '/products?page=2#top'
 */
export function buildUrl(options: BuildUrlOptions = {}): string {
  const { protocol, host, port, path = '', query, hash, base, queryOptions } = options;

  const search = query ? stringifyQuery(query, queryOptions) : '';
  const fragment = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';

  if (base !== undefined && base !== '') {
    const resolved = new URL(path === '' ? '.' : path, base.endsWith('/') ? base : `${base}/`);
    if (search !== '') resolved.search = search;
    if (fragment !== '') resolved.hash = fragment;
    return resolved.href;
  }

  if (host === undefined || host === '') {
    const normalizedPath = path === '' ? '' : path;
    return `${normalizedPath}${search === '' ? '' : `?${search}`}${fragment}`;
  }

  const scheme = (protocol ?? 'https').replace(/:$/, '');
  const authority =
    host.includes(':') || port === undefined || port === '' ? host : `${host}:${port}`;
  const normalizedPath = path === '' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${scheme}://${authority}${normalizedPath}${search === '' ? '' : `?${search}`}${fragment}`;
}
export default buildUrl;
