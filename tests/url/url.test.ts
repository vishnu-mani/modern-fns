import { describe, expect, it } from 'vitest';
import {
  buildUrl,
  getQuery,
  getQueryParams,
  hasQuery,
  isSameUrl,
  joinUrl,
  mergeQuery,
  parseUrl,
  removeHash,
  removeQuery,
  setHash,
  setQuery,
  setQueryParams,
} from '../../src/index.js';

describe('parseUrl', () => {
  it('decomposes absolute URLs', () => {
    const parsed = parseUrl('https://shop.com:8080/p?page=2&tags=a&tags=b#reviews');
    expect(parsed).toMatchObject({
      protocol: 'https',
      hostname: 'shop.com',
      port: '8080',
      host: 'shop.com:8080',
      origin: 'https://shop.com:8080',
      pathname: '/p',
      search: '?page=2&tags=a&tags=b',
      hash: '#reviews',
      isAbsolute: true,
    });
    expect(parsed.query).toEqual({ page: 2, tags: ['a', 'b'] });
  });
  it('handles relative URLs', () => {
    const parsed = parseUrl('/products?page=2');
    expect(parsed.isAbsolute).toBe(false);
    expect(parsed.protocol).toBe('');
    expect(parsed.hostname).toBe('');
    expect(parsed.pathname).toBe('/products');
    expect(parsed.href).toBe('/products?page=2');
  });
  it('handles protocol-relative URLs and credentials', () => {
    expect(parseUrl('//cdn.com/a.js').isAbsolute).toBe(true);
    expect(parseUrl('//cdn.com/a.js').href).toBe('//cdn.com/a.js');
    expect(parseUrl('https://u:p@x.com/').username).toBe('u');
    expect(parseUrl('https://u:p@x.com/').password).toBe('p');
  });
  it('handles empty and malformed input', () => {
    expect(parseUrl('').pathname).toBe('/');
    expect(parseUrl(null as never).isAbsolute).toBe(false);
    expect(parseUrl('http://').isAbsolute).toBe(false);
  });
});

describe('buildUrl', () => {
  it('builds absolute URLs', () => {
    expect(
      buildUrl({
        host: 'api.shop.com',
        path: '/v1/products',
        query: { page: 2, tags: ['a', 'b'] },
      }),
    ).toBe('https://api.shop.com/v1/products?page=2&tags=a&tags=b');
    expect(buildUrl({ protocol: 'http:', host: 'x.com', port: 8080, path: 'a' })).toBe(
      'http://x.com:8080/a',
    );
    expect(buildUrl({ host: 'x.com:1', port: 2 })).toBe('https://x.com:1');
  });
  it('builds relative URLs', () => {
    expect(buildUrl({ path: '/products', query: { page: 2 }, hash: 'top' })).toBe(
      '/products?page=2#top',
    );
    expect(buildUrl({ path: '/p', hash: '#top' })).toBe('/p#top');
    expect(buildUrl({})).toBe('');
  });
  it('resolves against a base', () => {
    expect(
      buildUrl({ base: 'https://api.com/v1', path: 'users', query: { a: 1 }, hash: 'x' }),
    ).toBe('https://api.com/v1/users?a=1#x');
    expect(buildUrl({ base: 'https://api.com/v1/' })).toBe('https://api.com/v1/');
  });
});

describe('query manipulation', () => {
  it('sets a parameter, preserving everything else', () => {
    expect(setQuery('/products?page=2', 'sort', 'price')).toBe('/products?page=2&sort=price');
    expect(setQuery('/products?page=2', 'page', 3)).toBe('/products?page=3');
    expect(setQuery('/p#top', 'a', 1)).toBe('/p?a=1#top');
    expect(setQuery('https://x.com/p?a=1', 'b', 2)).toBe('https://x.com/p?a=1&b=2');
    expect(setQuery('/p?a=1', 'a', undefined)).toBe('/p');
  });
  it('keeps relative URLs relative and rootless ones rootless', () => {
    expect(setQuery('products?page=2', 'a', 1)).toBe('products?page=2&a=1');
  });
  it('reads parameters', () => {
    expect(getQuery('/products?page=2', 'page')).toBe(2);
    expect(getQuery('https://x.com?a=1', 'b')).toBeUndefined();
    expect(getQueryParams('/products?page=2&tags=a&tags=b')).toEqual({ page: 2, tags: ['a', 'b'] });
    expect(getQueryParams('/products')).toEqual({});
  });
  it('replaces and merges', () => {
    expect(setQueryParams('/products?page=2&sort=price', { page: 1 })).toBe('/products?page=1');
    expect(setQueryParams('/products?page=2', {})).toBe('/products');
    expect(mergeQuery('/p?page=2&sort=price', { page: 3, q: 'shoes' })).toBe(
      '/p?page=3&sort=price&q=shoes',
    );
    expect(mergeQuery('/p?page=2&sort=price', { sort: undefined })).toBe('/p?page=2');
    expect(mergeQuery('/p?a=1', null as never)).toBe('/p?a=1');
  });
  it('removes and checks', () => {
    expect(removeQuery('/p?page=2&sort=price', 'sort')).toBe('/p?page=2');
    expect(removeQuery('/p?a=1&b=2&c=3', ['a', 'c'])).toBe('/p?b=2');
    expect(removeQuery('/p?a=1', 'a')).toBe('/p');
    expect(hasQuery('/p?q=', 'q')).toBe(true);
    expect(hasQuery('/p?a=1', 'q')).toBe(false);
  });
  it('supports nested and array values', () => {
    expect(setQuery('/p', 'filter', { status: 'active' })).toBe('/p?filter[status]=active');
    expect(setQuery('/p', 'tags', ['a', 'b'])).toBe('/p?tags=a&tags=b');
  });
});

describe('hash manipulation', () => {
  it('sets and removes the fragment', () => {
    expect(setHash('/docs?page=2', 'install')).toBe('/docs?page=2#install');
    expect(setHash('/docs#old', '#new')).toBe('/docs#new');
    expect(setHash('/docs#old', '')).toBe('/docs');
    expect(removeHash('/docs?page=2#install')).toBe('/docs?page=2');
    expect(removeHash('https://x.com/a#b')).toBe('https://x.com/a');
    expect(setHash('/a', null as never)).toBe('/a');
  });
});

describe('isSameUrl', () => {
  it('ignores query order and trailing slashes by default', () => {
    expect(isSameUrl('/p?a=1&b=2', '/p/?b=2&a=1')).toBe(true);
    expect(isSameUrl('/p', '/p/')).toBe(true);
    expect(isSameUrl('/p', '/q')).toBe(false);
  });
  it('compares hashes unless told otherwise', () => {
    expect(isSameUrl('/p#a', '/p#b')).toBe(false);
    expect(isSameUrl('/p#a', '/p#b', { ignoreHash: true })).toBe(true);
  });
  it('honours strict options', () => {
    expect(isSameUrl('/p?a=1&b=2', '/p?b=2&a=1', { ignoreQueryOrder: false })).toBe(false);
    expect(isSameUrl('/p', '/p/', { ignoreTrailingSlash: false })).toBe(false);
    expect(isSameUrl('/p?a=1', '/p?a=2', { ignoreQuery: true })).toBe(true);
  });
  it('compares origins and shapes', () => {
    expect(isSameUrl('https://x.com/p', 'https://x.com:443/p')).toBe(true);
    expect(isSameUrl('https://x.com/p', 'http://x.com/p')).toBe(false);
    expect(isSameUrl('https://x.com/p', '/p')).toBe(false);
    expect(isSameUrl(null as never, '/p')).toBe(false);
  });
});

describe('joinUrl', () => {
  it('joins with exactly one slash', () => {
    expect(joinUrl('https://api.com/', '/v1/', 'users')).toBe('https://api.com/v1/users');
    expect(joinUrl('/base', 'a', 'b')).toBe('/base/a/b');
    expect(joinUrl('a', 'b')).toBe('a/b');
  });
  it('preserves a trailing slash on the last part', () => {
    expect(joinUrl('/base', 'a', 'b/')).toBe('/base/a/b/');
  });
  it('moves query and hash to the end', () => {
    expect(joinUrl('https://api.com', 'search?q=1')).toBe('https://api.com/search?q=1');
    expect(joinUrl('/a?x=1', 'b?y=2')).toBe('/a/b?x=1&y=2');
    expect(joinUrl('/a', 'b#top')).toBe('/a/b#top');
  });
  it('skips empty parts', () => {
    expect(joinUrl('/a', '', null, undefined, 'b')).toBe('/a/b');
    expect(joinUrl()).toBe('');
    expect(joinUrl('/a', 0)).toBe('/a/0');
  });
});
