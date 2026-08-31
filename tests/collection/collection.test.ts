import { describe, expect, it, vi } from 'vitest';
import {
  each,
  every,
  filter,
  find,
  first,
  isEmpty,
  last,
  map,
  size,
  some,
} from '../../src/index.js';

const object = { a: 1, b: 2, c: 3 };
const set = new Set([1, 2, 3]);
const entryMap = new Map([
  ['a', 1],
  ['b', 2],
]);

describe('size', () => {
  it('counts every container type', () => {
    expect(size([1, 2, 3])).toBe(3);
    expect(size(object)).toBe(3);
    expect(size(set)).toBe(3);
    expect(size(entryMap)).toBe(2);
    expect(size('héllo')).toBe(5);
    expect(size('😀😀')).toBe(2);
    expect(size(null)).toBe(0);
    expect(size(undefined)).toBe(0);
    expect(size([])).toBe(0);
  });
});

describe('first / last', () => {
  it('reads the ends of any container', () => {
    expect(first([1, 2])).toBe(1);
    expect(last([1, 2])).toBe(2);
    expect(first(object)).toBe(1);
    expect(last(object)).toBe(3);
    expect(first(set)).toBe(1);
    expect(last(entryMap)).toBe(2);
    expect(first('ab')).toBe('a');
    expect(first([])).toBeUndefined();
    expect(last([])).toBeUndefined();
    expect(first({})).toBeUndefined();
    expect(last({})).toBeUndefined();
    expect(first(null)).toBeUndefined();
    expect(last(null)).toBeUndefined();
  });
});

describe('isEmpty', () => {
  it('is shared with the value module', () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty([1])).toBe(false);
  });
});

describe('each', () => {
  it('iterates arrays and objects with keys', () => {
    const seen: Array<[unknown, unknown]> = [];
    each(object, (value, key) => void seen.push([key, value]));
    expect(seen).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });
  it('stops early when the iteratee returns false', () => {
    const spy = vi.fn((value: number) => (value === 2 ? false : undefined));
    each([1, 2, 3], spy);
    expect(spy).toHaveBeenCalledTimes(2);
  });
  it('handles nullish input', () => {
    const spy = vi.fn();
    each(null, spy);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('map / filter', () => {
  it('preserves the container type', () => {
    expect(map([1, 2], (n) => n * 2)).toEqual([2, 4]);
    expect(map(object, (n) => n * 2)).toEqual({ a: 2, b: 4, c: 6 });
    expect(map(new Set([1, 2]), (n) => n + 1)).toEqual(new Set([2, 3]));
    expect(map(new Map([['a', 1]]), (n) => n + 1)).toEqual(new Map([['a', 2]]));
  });
  it('filters, preserving the container type', () => {
    expect(filter([1, 2, 3], (n) => n > 1)).toEqual([2, 3]);
    expect(filter(object, (n) => n > 1)).toEqual({ b: 2, c: 3 });
    expect(filter(new Set([1, 2]), (n) => n > 1)).toEqual(new Set([2]));
    expect(
      filter(
        new Map([
          ['a', 1],
          ['b', 2],
        ]),
        (n) => n > 1,
      ),
    ).toEqual(new Map([['b', 2]]));
  });
  it('passes keys to the iteratee', () => {
    expect(map(object, (value, key) => `${key}${value}`)).toEqual({ a: 'a1', b: 'b2', c: 'c3' });
  });
  it('turns strings and iterables into arrays', () => {
    expect(map('ab', (c) => c.toUpperCase())).toEqual(['A', 'B']);
  });
  it('does not mutate the source', () => {
    const source = { a: 1 };
    map(source, (n) => n + 1);
    filter(source, () => false);
    expect(source).toEqual({ a: 1 });
  });
  it('handles nullish input', () => {
    expect(map(null, (n) => n)).toEqual([]);
    expect(filter(null, () => true)).toEqual([]);
  });
});

describe('find / some / every', () => {
  it('finds across container types', () => {
    expect(find([1, 2, 3], (n) => n > 1)).toBe(2);
    expect(find(object, (n) => n > 2)).toBe(3);
    expect(find(set, (n) => n === 2)).toBe(2);
    expect(find([1], (n) => n > 5)).toBeUndefined();
  });
  it('short-circuits some and every', () => {
    expect(some(object, (n) => n > 2)).toBe(true);
    expect(some([], () => true)).toBe(false);
    expect(every(object, (n) => n > 0)).toBe(true);
    expect(every([], () => false)).toBe(true);
    expect(every(object, (n) => n > 2)).toBe(false);
  });
  it('receives keys', () => {
    expect(find(object, (_, key) => key === 'b')).toBe(2);
  });
});
