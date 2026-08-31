import { describe, expect, it } from 'vitest';
import * as query from '../../src/query/index.js';

describe('parse', () => {
  it('parses the documented example', () => {
    expect(query.parse('?page=2&tags=vue&tags=nuxt')).toEqual({ page: 2, tags: ['vue', 'nuxt'] });
  });
  it('accepts bare, prefixed and full-URL input', () => {
    expect(query.parse('a=1')).toEqual({ a: 1 });
    expect(query.parse('?a=1')).toEqual({ a: 1 });
    expect(query.parse('https://x.com/p?a=1#hash')).toEqual({ a: 1 });
    expect(query.parse('')).toEqual({});
    expect(query.parse('?')).toEqual({});
    expect(query.parse(null as never)).toEqual({});
    expect(query.parse('/products')).toEqual({});
  });
  it('coerces numbers and booleans, switchably', () => {
    expect(query.parse('a=1&b=true&c=false')).toEqual({ a: 1, b: true, c: false });
    expect(query.parse('a=1', { parseNumbers: false })).toEqual({ a: '1' });
    expect(query.parse('b=true', { parseBooleans: false })).toEqual({ b: 'true' });
  });
  it('keeps ids that must not become numbers', () => {
    expect(query.parse('id=007')).toEqual({ id: '007' });
    expect(query.parse('phone=+919876543210')).toEqual({ phone: ' 919876543210' });
    expect(query.parse('big=12345678901234567890').big).toBe('12345678901234567890');
  });
  it('parses nested and bracketed keys', () => {
    expect(query.parse('filter[status]=active&filter[min]=5')).toEqual({
      filter: { status: 'active', min: 5 },
    });
    expect(query.parse('ids[]=1&ids[]=2')).toEqual({ ids: [1, 2] });
    expect(query.parse('ids[0]=a&ids[1]=b')).toEqual({ ids: ['a', 'b'] });
    expect(query.parse('a[b][c]=1')).toEqual({ a: { b: { c: 1 } } });
  });
  it('can disable nesting', () => {
    expect(query.parse('a[b]=1', { nested: false })).toEqual({ 'a[b]': 1 });
    expect(query.parse('a=1&a=2', { nested: false })).toEqual({ a: [1, 2] });
    expect(query.parse('a=1&a=2&a=3', { nested: false })).toEqual({ a: [1, 2, 3] });
  });
  it('decodes values and handles malformed encoding', () => {
    expect(query.parse('q=hello%20world')).toEqual({ q: 'hello world' });
    expect(query.parse('q=hello+world')).toEqual({ q: 'hello world' });
    expect(query.parse('q=%E2%9C%93')).toEqual({ q: '✓' });
    expect(query.parse('q=%zz')).toEqual({ q: '%zz' });
    expect(query.parse('q=x', { decode: false })).toEqual({ q: 'x' });
  });
  it('handles empty and bare keys', () => {
    expect(query.parse('q=')).toEqual({ q: '' });
    expect(query.parse('debug')).toEqual({ debug: '' });
    expect(query.parse('=novalue')).toEqual({});
    expect(query.parse('a=1&&b=2')).toEqual({ a: 1, b: 2 });
  });
  it('splits commas on request', () => {
    expect(query.parse('tags=a,b', { comma: true })).toEqual({ tags: ['a', 'b'] });
    expect(query.parse('tags=a,b')).toEqual({ tags: 'a,b' });
  });
});

describe('stringify', () => {
  it('serialises objects', () => {
    expect(query.stringify({ page: 2, tags: ['vue', 'nuxt'] })).toBe('page=2&tags=vue&tags=nuxt');
    expect(query.stringify({})).toBe('');
    expect(query.stringify(null)).toBe('');
  });
  it('supports array formats', () => {
    expect(query.stringify({ t: ['a', 'b'] }, { arrayFormat: 'bracket' })).toBe('t[]=a&t[]=b');
    expect(query.stringify({ t: ['a', 'b'] }, { arrayFormat: 'comma' })).toBe('t=a,b');
    expect(query.stringify({ t: ['a', 'b'] }, { arrayFormat: 'index' })).toBe('t[0]=a&t[1]=b');
    expect(query.stringify({ t: [] })).toBe('');
    expect(query.stringify({ t: [null] }, { arrayFormat: 'comma' })).toBe('');
  });
  it('serialises nested objects and dates', () => {
    expect(query.stringify({ filter: { status: 'active' } })).toBe('filter[status]=active');
    expect(query.stringify({ a: { b: 1 } }, { nested: false })).toBe('a=%7B%22b%22%3A1%7D');
    expect(query.stringify({ d: new Date(0) })).toBe('d=1970-01-01T00%3A00%3A00.000Z');
  });
  it('skips undefined and honours skip options', () => {
    expect(query.stringify({ a: undefined, b: 1 })).toBe('b=1');
    expect(query.stringify({ a: null, b: 1 })).toBe('a=&b=1');
    expect(query.stringify({ a: null, b: 1 }, { skipNull: true })).toBe('b=1');
    expect(query.stringify({ a: '', b: 1 }, { skipEmpty: true })).toBe('b=1');
  });
  it('supports sorting, prefixing and disabling encoding', () => {
    expect(query.stringify({ b: 1, a: 2 }, { sort: true, addQueryPrefix: true })).toBe('?a=2&b=1');
    expect(query.stringify({}, { addQueryPrefix: true })).toBe('');
    expect(query.stringify({ q: 'a b' })).toBe('q=a%20b');
    expect(query.stringify({ q: 'a b' }, { encode: false })).toBe('q=a b');
  });
  it('round-trips with parse', () => {
    const source = { page: 2, tags: ['vue', 'nuxt'], filter: { status: 'active' }, ok: true };
    expect(query.parse(query.stringify(source))).toEqual(source);
  });
});

describe('mutations', () => {
  it('reads keys', () => {
    expect(query.get('?page=2', 'page')).toBe(2);
    expect(query.get('?q=', 'q')).toBe('');
    expect(query.get('?page=2', 'missing')).toBeUndefined();
  });
  it('sets keys, preserving position and prefix', () => {
    expect(query.set('page=2', 'sort', 'price')).toBe('page=2&sort=price');
    expect(query.set('?page=2', 'page', 3)).toBe('?page=3');
    expect(query.set('page=2', 'tags', ['vue', 'nuxt'])).toBe('page=2&tags=vue&tags=nuxt');
    expect(query.set('page=2&sort=a', 'page', undefined)).toBe('sort=a');
    expect(query.set('', 'a', 1)).toBe('a=1');
  });
  it('removes keys', () => {
    expect(query.remove('page=2&sort=price', 'sort')).toBe('page=2');
    expect(query.remove('a=1&b=2&c=3', ['a', 'c'])).toBe('b=2');
    expect(query.remove('a=1', 'missing')).toBe('a=1');
    expect(query.remove('?a=1', 'a')).toBe('');
  });
  it('merges values', () => {
    expect(query.merge('page=2&sort=price', { page: 3, q: 'shoes' })).toBe(
      'page=3&sort=price&q=shoes',
    );
    expect(query.merge('page=2&sort=price', { sort: undefined })).toBe('page=2');
    expect(query.merge('a=1', null as never)).toBe('a=1');
  });
  it('checks presence', () => {
    expect(query.has('?q=&page=2', 'q')).toBe(true);
    expect(query.has('?page=2', 'q')).toBe(false);
  });
  it('toggles keys', () => {
    expect(query.toggle('?page=2', 'inStock')).toBe('?page=2&inStock=true');
    expect(query.toggle('?page=2&inStock=true', 'inStock')).toBe('?page=2');
    expect(query.toggle('', 'dark', { value: 1 })).toBe('dark=1');
  });
});

describe('typed readers', () => {
  it('reads numbers', () => {
    expect(query.parseNumber('?page=2', 'page')).toBe(2);
    expect(query.parseNumber('?page=abc', 'page', 1)).toBe(1);
    expect(query.parseNumber('?page=', 'page', 1)).toBe(1);
    expect(query.parseNumber('?x=1', 'page', 1)).toBe(1);
    expect(query.parseNumber('?p=1,299.50', 'p')).toBe(1299.5);
    expect(query.parseNumber('?p=1&p=2', 'p', 0)).toBe(0);
    expect(query.parseNumber('?a[b]=1', 'a', 0)).toBe(0);
  });
  it('reads booleans', () => {
    expect(query.parseBoolean('?debug=true', 'debug')).toBe(true);
    expect(query.parseBoolean('?debug', 'debug')).toBe(true);
    expect(query.parseBoolean('?debug=0', 'debug')).toBe(false);
    expect(query.parseBoolean('?debug=yes', 'debug')).toBe(true);
    expect(query.parseBoolean('?x=1', 'debug')).toBe(false);
    expect(query.parseBoolean('?x=1', 'debug', true)).toBe(true);
    expect(query.parseBoolean('?d=1&d=2', 'd', false)).toBe(false);
  });
  it('always reads arrays', () => {
    expect(query.parseArray('?tags=vue&tags=nuxt', 'tags')).toEqual(['vue', 'nuxt']);
    expect(query.parseArray('?tags[]=vue', 'tags')).toEqual(['vue']);
    expect(query.parseArray('?tags=vue', 'tags')).toEqual(['vue']);
    expect(query.parseArray('?tags=a,b', 'tags')).toEqual(['a', 'b']);
    expect(query.parseArray('?tags=a,b', 'tags', { separator: null })).toEqual(['a,b']);
    expect(query.parseArray('', 'tags')).toEqual([]);
    expect(query.parseArray('?tags=', 'tags')).toEqual([]);
  });
});
