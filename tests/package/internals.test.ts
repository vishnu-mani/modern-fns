import { describe, expect, it, vi } from 'vitest';
import { formatPath, joinPath, parsePath } from '../../src/internal/path.js';
import { toEntries, fromEntries } from '../../src/internal/collection.js';
import { words } from '../../src/internal/words.js';
import { isPlainObject, tagOf } from '../../src/internal/types.js';
import { parseAny, formatAny } from '../../src/internal/url.js';
import { diff, debounce, map, size } from '../../src/index.js';

describe('path helpers', () => {
  it('parses every path form', () => {
    expect(parsePath('a.b[0].c')).toEqual(['a', 'b', 0, 'c']);
    expect(parsePath(['a', 0])).toEqual(['a', 0]);
    expect(parsePath('')).toEqual([]);
    expect(parsePath('a["b.c"]')).toEqual(['a', 'b.c']);
    expect(parsePath("a['b\\'c']")).toEqual(['a', "b'c"]);
    expect(parsePath('  a  .b')).toEqual(['a', 'b']);
  });
  it('caches repeated parses without sharing the array', () => {
    const first = parsePath('cached.path');
    const second = parsePath('cached.path');
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    for (let i = 0; i < 600; i += 1) parsePath(`k${i}.v`);
    expect(parsePath('cached.path')).toEqual(['cached', 'path']);
  });
  it('formats paths back', () => {
    expect(formatPath(['a', 0, 'b'])).toBe('a[0].b');
    expect(formatPath([0, 'a'])).toBe('[0].a');
    expect(formatPath(['a.b'])).toBe("['a.b']");
    expect(formatPath(["it's"])).toBe("['it\\'s']");
    expect(formatPath([])).toBe('');
  });
  it('joins single segments', () => {
    expect(joinPath('a', 'b')).toBe('a.b');
    expect(joinPath('a', 0)).toBe('a[0]');
    expect(joinPath('', 'a')).toBe('a');
    expect(joinPath('a', 'b.c')).toBe("a['b.c']");
  });
  it('round-trips through parse and format', () => {
    for (const path of ['a.b[0].c', "x['y.z']", '[0].a']) {
      expect(formatPath(parsePath(path))).toBe(path);
    }
  });
});

describe('collection helpers', () => {
  it('handles iterables and exotic objects', () => {
    function* generate(): Generator<number> {
      yield 1;
      yield 2;
    }
    expect(toEntries(generate())).toEqual([
      [0, 1],
      [1, 2],
    ]);
    class Bag {
      a = 1;
      b = 2;
    }
    const bag = new Bag() as unknown as Record<string, unknown>;
    expect(toEntries(bag)).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
    expect(size(bag)).toBe(2);
    // Class instances are not plain objects, so they rebuild as arrays.
    expect(map(bag, (n) => (n as number) * 2)).toEqual([2, 4]);
  });
  it('rebuilds arrays by default', () => {
    expect(fromEntries([1, 2], [[0, 'a']])).toEqual(['a']);
  });
});

describe('word splitting', () => {
  it('handles acronyms, digits and unicode', () => {
    expect(words('XMLHttpRequest')).toEqual(['XML', 'Http', 'Request']);
    expect(words('hello_world-42')).toEqual(['hello', 'world', '42']);
    expect(words('')).toEqual([]);
    expect(words('___')).toEqual([]);
    expect(words('ID42')).toEqual(['ID42']);
  });
});

describe('type helpers', () => {
  it('identifies plain objects only', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(Object.assign({}, { [Symbol.toStringTag]: 'X' }))).toBe(false);
    class Point {}
    expect(isPlainObject(new Point())).toBe(false);
  });
  it('reads tags', () => {
    expect(tagOf(new Date())).toBe('Date');
    expect(tagOf(null)).toBe('Null');
  });
});

describe('url internals', () => {
  it('falls back to a relative parse for malformed schemes', () => {
    expect(parseAny('http://').isRelative).toBe(true);
    expect(parseAny('//').isRelative).toBe(true);
    expect(parseAny(null as never).isRelative).toBe(true);
  });
  it('re-renders the original shape', () => {
    const parts = parseAny('products?a=1');
    expect(formatAny(parts, 'products?a=1')).toBe('products?a=1');
    expect(formatAny(parseAny('/products?a=1'), '/products?a=1')).toBe('/products?a=1');
    expect(formatAny(parseAny('//cdn.com/a'), '//cdn.com/a')).toBe('//cdn.com/a');
  });
});

describe('remaining branches', () => {
  it('diffs keyed arrays of primitives', () => {
    expect(diff({ l: [1, 2] }, { l: [1, 3] }, { arrays: 'key', key: 'id' })).toEqual([
      { path: 'l[1]', type: 'added', newValue: 3 },
      { path: 'l[1]', type: 'removed', oldValue: 2 },
    ]);
  });
  it('clears a pending debounce timer when maxWait fires first', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debounced = debounce(spy, 1000, { maxWait: 50 });
    debounced();
    vi.advanceTimersByTime(60);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(debounced.pending()).toBe(false);
    vi.useRealTimers();
  });
});
