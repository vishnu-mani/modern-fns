import { describe, expect, it } from 'vitest';
import {
  deepClone,
  deepMerge,
  flattenObject,
  isEqual,
  mapKeys,
  mapValues,
  unflattenObject,
} from '../../src/index.js';
import { deepMergeWith } from '../../src/object/deepMerge.js';
import { camelCase } from '../../src/string/camelCase.js';

describe('deepClone', () => {
  it('clones nested structures', () => {
    const source = { a: { b: [1, { c: 2 }] } };
    const copy = deepClone(source);
    copy.a.b[1] = { c: 99 };
    expect(source.a.b[1]).toEqual({ c: 2 });
  });
  it('clones dates, regexps, maps, sets and typed arrays', () => {
    const source = {
      date: new Date(1000),
      re: /ab+c/gi,
      map: new Map([['k', { v: 1 }]]),
      set: new Set([{ v: 1 }]),
      bytes: new Uint8Array([1, 2, 3]),
      buffer: new ArrayBuffer(4),
    };
    const copy = deepClone(source);
    expect(copy).toEqual(source);
    expect(copy.date).not.toBe(source.date);
    expect(copy.map.get('k')).not.toBe(source.map.get('k'));
    expect([...copy.set][0]).not.toBe([...source.set][0]);
    expect(copy.bytes).not.toBe(source.bytes);
    expect(copy.re.source).toBe('ab+c');
    expect(copy.buffer.byteLength).toBe(4);
  });
  it('handles circular references', () => {
    const source: Record<string, unknown> = { a: 1 };
    source.self = source;
    const copy = deepClone(source);
    expect(copy.self).toBe(copy);
  });
  it('returns primitives and functions as-is', () => {
    const fn = (): number => 1;
    expect(deepClone(1)).toBe(1);
    expect(deepClone(null)).toBeNull();
    expect(deepClone(fn)).toBe(fn);
  });
  it('preserves class prototypes', () => {
    class Point {
      constructor(public x: number) {}
    }
    const copy = deepClone(new Point(1));
    expect(copy).toBeInstanceOf(Point);
    expect(copy.x).toBe(1);
  });
  it('clones objects with a null prototype', () => {
    const source = Object.create(null) as Record<string, number>;
    source.a = 1;
    expect(deepClone(source)).toEqual({ a: 1 });
  });
});

describe('deepMerge', () => {
  it('merges nested plain objects', () => {
    expect(deepMerge({ a: { b: 1, c: 2 } }, { a: { c: 3 } })).toEqual({ a: { b: 1, c: 3 } });
  });
  it('does not mutate the sources', () => {
    const a = { x: { y: 1 } };
    const b = { x: { z: 2 } };
    const merged = deepMerge(a, b);
    expect(a).toEqual({ x: { y: 1 } });
    expect(merged.x).not.toBe(a.x);
  });
  it('replaces arrays by default', () => {
    expect(deepMerge({ list: [1, 2] }, { list: [3] })).toEqual({ list: [3] });
  });
  it('supports concat and index merging', () => {
    expect(deepMergeWith({ arrays: 'concat' }, { l: [1] }, { l: [2] })).toEqual({ l: [1, 2] });
    expect(deepMergeWith({ arrays: 'merge' }, { l: [{ a: 1 }] }, { l: [{ b: 2 }] })).toEqual({
      l: [{ a: 1, b: 2 }],
    });
    expect(deepMergeWith({ arrays: 'merge' }, { l: [1, 2] }, { l: [9] })).toEqual({ l: [9, 2] });
  });
  it('treats dates and class instances as atomic', () => {
    const date = new Date(0);
    expect(deepMerge({ d: new Date(1) }, { d: date }).d).toBe(date);
  });
  it('skips undefined source values', () => {
    expect(deepMerge({ a: 1 }, { a: undefined })).toEqual({ a: 1 });
    expect(deepMergeWith({ skipUndefined: false }, { a: 1 }, { a: undefined })).toEqual({
      a: undefined,
    });
  });
  it('ignores nullish and non-object sources', () => {
    expect(deepMerge({ a: 1 }, null as never)).toEqual({ a: 1 });
    expect(deepMerge({ a: 1 }, 5 as never)).toEqual({ a: 1 });
    expect(deepMerge()).toEqual({});
  });
  it('refuses prototype-polluting keys', () => {
    const polluted = deepMerge({}, JSON.parse('{"__proto__":{"bad":true}}') as object);
    expect((polluted as Record<string, unknown>).bad).toBeUndefined();
    expect(({} as Record<string, unknown>).bad).toBeUndefined();
  });
});

describe('mapValues / mapKeys', () => {
  it('maps values keeping keys', () => {
    expect(mapValues({ a: 1, b: 2 }, (n) => n * 2)).toEqual({ a: 2, b: 4 });
  });
  it('passes key and object', () => {
    expect(mapValues({ a: 1 }, (v, k, o) => `${k}${v}${Object.keys(o).length}`)).toEqual({
      a: 'a11',
    });
  });
  it('maps keys keeping values', () => {
    expect(mapKeys({ first_name: 'V', last_name: 'M' }, camelCase)).toEqual({
      firstName: 'V',
      lastName: 'M',
    });
  });
  it('handles nullish input', () => {
    expect(mapValues(null as never, (v) => v)).toEqual({});
    expect(mapKeys(null as never, (k) => k)).toEqual({});
  });
  it('does not mutate', () => {
    const source = { a: 1 };
    mapValues(source, (n) => n + 1);
    expect(source).toEqual({ a: 1 });
  });
});

describe('isEqual', () => {
  it('compares deeply', () => {
    expect(isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
  });
  it('uses SameValueZero', () => {
    expect(isEqual(NaN, NaN)).toBe(true);
    expect(isEqual(0, -0)).toBe(true);
  });
  it('compares dates, regexps and errors', () => {
    expect(isEqual(new Date(0), new Date(0))).toBe(true);
    expect(isEqual(new Date(0), new Date(1))).toBe(false);
    expect(isEqual(/a/g, /a/g)).toBe(true);
    expect(isEqual(/a/g, /a/i)).toBe(false);
    expect(isEqual(new Error('x'), new Error('x'))).toBe(true);
    expect(isEqual(new Error('x'), new Error('y'))).toBe(false);
  });
  it('compares maps and sets by content', () => {
    expect(isEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true);
    expect(isEqual(new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false);
    expect(isEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(isEqual(new Set([1]), new Set([2]))).toBe(false);
    expect(isEqual(new Map([[{ k: 1 }, 'v']]), new Map([[{ k: 1 }, 'v']]))).toBe(true);
    expect(isEqual(new Map([[{ k: 1 }, 'v']]), new Map([[{ k: 2 }, 'v']]))).toBe(false);
    expect(isEqual(new Map([['a', 1]]), new Map())).toBe(false);
  });
  it('compares typed arrays', () => {
    expect(isEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true);
    expect(isEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false);
  });
  it('distinguishes different types and prototypes', () => {
    class A {
      a = 1;
    }
    expect(isEqual(new A(), { a: 1 })).toBe(false);
    expect(isEqual([1], { 0: 1 })).toBe(false);
    expect(isEqual(null, undefined)).toBe(false);
    expect(isEqual(1, '1')).toBe(false);
  });
  it('handles circular structures', () => {
    const a: Record<string, unknown> = {};
    const b: Record<string, unknown> = {};
    a.self = a;
    b.self = b;
    expect(isEqual(a, b)).toBe(true);
  });
  it('compares functions by reference', () => {
    const fn = (): void => {};
    expect(isEqual({ fn }, { fn })).toBe(true);
    expect(isEqual({ fn }, { fn: () => {} })).toBe(false);
  });
  it('detects extra keys', () => {
    expect(isEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });
});

describe('flattenObject / unflattenObject', () => {
  it('flattens nested objects and arrays', () => {
    expect(flattenObject({ user: { name: 'V', tags: ['a', 'b'] } })).toEqual({
      'user.name': 'V',
      'user.tags[0]': 'a',
      'user.tags[1]': 'b',
    });
  });
  it('preserves empty containers as leaves', () => {
    expect(flattenObject({ a: {}, b: [] })).toEqual({ a: {}, b: [] });
  });
  it('supports a custom delimiter and keeping arrays whole', () => {
    expect(flattenObject({ a: { b: 1 } }, { delimiter: '/' })).toEqual({ 'a/b': 1 });
    expect(flattenObject({ a: [1] }, { arrays: false })).toEqual({ a: [1] });
  });
  it('round-trips', () => {
    const source = { user: { name: 'V', tags: ['a'], meta: { deep: { n: 1 } } }, ok: true };
    expect(unflattenObject(flattenObject(source))).toEqual(source);
  });
  it('handles nullish input', () => {
    expect(flattenObject(null as never)).toEqual({});
    expect(unflattenObject(null as never)).toEqual({});
  });
  it('unflattens with a custom delimiter', () => {
    expect(unflattenObject({ 'a/b': 1 }, { delimiter: '/' })).toEqual({ a: { b: 1 } });
  });
  it('keeps null values', () => {
    expect(flattenObject({ a: { b: null } })).toEqual({ 'a.b': null });
  });
});
