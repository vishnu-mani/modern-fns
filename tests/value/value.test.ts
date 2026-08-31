import { describe, expect, it } from 'vitest';
import {
  coalesce,
  defaultTo,
  isArray,
  isBoolean,
  isEmpty,
  isFunction,
  isNil,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
  nullable,
  toArray,
  toBoolean,
  toDate,
  toNumber,
  toObject,
  toString,
} from '../../src/index.js';

describe('toString', () => {
  it('converts common values', () => {
    expect(toString('abc')).toBe('abc');
    expect(toString(123)).toBe('123');
    expect(toString(true)).toBe('true');
    expect(toString(10n)).toBe('10');
    expect(toString([1, 2])).toBe('1,2');
    expect(toString({ a: 1 })).toBe('{"a":1}');
    expect(toString(new Date(0))).toBe('1970-01-01T00:00:00.000Z');
  });
  it('never produces "null", "undefined" or "[object Object]"', () => {
    expect(toString(null)).toBe('');
    expect(toString(undefined)).toBe('');
    expect(toString(undefined, '—')).toBe('—');
    expect(toString(NaN)).toBe('');
    expect(toString(Infinity)).toBe('');
    expect(toString(Symbol('x'))).toBe('');
    expect(toString(() => 1)).toBe('');
    expect(toString(new Date('nope'))).toBe('');
  });
  it('falls back on unserialisable values', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(toString(circular, 'x')).toBe('x');
  });
});

describe('toNumber', () => {
  it('parses plain numbers', () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber('42')).toBe(42);
    expect(toNumber(' 42 ')).toBe(42);
    expect(toNumber('1e3')).toBe(1000);
    expect(toNumber('-3.5')).toBe(-3.5);
    expect(toNumber('.5')).toBe(0.5);
  });
  it('parses currency and grouped values', () => {
    expect(toNumber('1,299.50')).toBe(1299.5);
    expect(toNumber('₹1,299.50')).toBe(1299.5);
    expect(toNumber('$1,299.50')).toBe(1299.5);
    expect(toNumber('1.299,50')).toBe(1299.5);
    expect(toNumber('1,500')).toBe(1500);
    expect(toNumber('1,5')).toBe(1.5);
    expect(toNumber('1,234,567')).toBe(1234567);
    expect(toNumber('50%')).toBe(50);
  });
  it('converts booleans, bigints and dates', () => {
    expect(toNumber(true)).toBe(1);
    expect(toNumber(false)).toBe(0);
    expect(toNumber(5n)).toBe(5);
    expect(toNumber(new Date(1000))).toBe(1000);
    expect(toNumber(new Date('nope'), 0)).toBe(0);
  });
  it('falls back on unusable values', () => {
    expect(toNumber('')).toBeNaN();
    expect(toNumber('abc', 0)).toBe(0);
    expect(toNumber(null, 0)).toBe(0);
    expect(toNumber(undefined, 0)).toBe(0);
    expect(toNumber([], 0)).toBe(0);
    expect(toNumber({}, 0)).toBe(0);
    expect(toNumber(NaN, 0)).toBe(0);
    expect(toNumber(Infinity, 0)).toBe(0);
    expect(toNumber('₹', 0)).toBe(0);
  });
});

describe('toBoolean', () => {
  it('understands string booleans', () => {
    for (const truthy of ['true', 'TRUE', '1', 'yes', 'y', 'on', 'enabled', ' true ']) {
      expect(toBoolean(truthy)).toBe(true);
    }
    for (const falsy of ['false', 'FALSE', '0', 'no', 'n', 'off', 'disabled', '']) {
      expect(toBoolean(falsy)).toBe(false);
    }
  });
  it('handles booleans and numbers', () => {
    expect(toBoolean(true)).toBe(true);
    expect(toBoolean(1)).toBe(true);
    expect(toBoolean(0)).toBe(false);
    expect(toBoolean(-1)).toBe(true);
    expect(toBoolean(NaN, true)).toBe(true);
  });
  it('falls back rather than guessing', () => {
    expect(toBoolean('maybe')).toBe(false);
    expect(toBoolean('maybe', true)).toBe(true);
    expect(toBoolean(null)).toBe(false);
    expect(toBoolean(undefined, true)).toBe(true);
    expect(toBoolean({}, true)).toBe(true);
  });
});

describe('toArray', () => {
  it('normalises one-or-many', () => {
    const list = [1, 2];
    expect(toArray(list)).toBe(list);
    expect(toArray(null)).toEqual([]);
    expect(toArray(undefined)).toEqual([]);
    expect(toArray(42)).toEqual([42]);
    expect(toArray({ a: 1 })).toEqual([{ a: 1 }]);
  });
  it('does not split strings into characters', () => {
    expect(toArray('abc')).toEqual(['abc']);
  });
  it('spreads iterables', () => {
    expect(toArray(new Set([1, 2]))).toEqual([1, 2]);
    expect(toArray(new Map([['a', 1]]))).toEqual([['a', 1]]);
    expect(
      toArray(
        (function* () {
          yield 1;
        })(),
      ),
    ).toEqual([1]);
  });
});

describe('toDate', () => {
  it('parses dates, ms and seconds', () => {
    expect(toDate('2026-08-31')?.getUTCFullYear()).toBe(2026);
    expect(toDate(1700000000000)?.getTime()).toBe(1700000000000);
    expect(toDate(1700000000)?.getTime()).toBe(1700000000000);
    expect(toDate('1700000000000')?.getTime()).toBe(1700000000000);
  });
  it('copies Date inputs', () => {
    const source = new Date(0);
    const result = toDate(source);
    expect(result).not.toBe(source);
    expect(result?.getTime()).toBe(0);
  });
  it('falls back on unusable values', () => {
    expect(toDate('not a date')).toBeUndefined();
    expect(toDate('')).toBeUndefined();
    expect(toDate(null)).toBeUndefined();
    expect(toDate({})).toBeUndefined();
    expect(toDate(new Date('nope'))).toBeUndefined();
    expect(toDate(Infinity)).toBeUndefined();
    expect(toDate(null, new Date(0))?.getTime()).toBe(0);
  });
});

describe('toObject', () => {
  it('passes through and converts containers', () => {
    const source = { a: 1 };
    expect(toObject(source)).toBe(source);
    expect(toObject(new Map([['a', 1]]))).toEqual({ a: 1 });
    expect(toObject(new URLSearchParams('a=1'))).toEqual({ a: '1' });
    expect(toObject([['a', 1]])).toEqual({ a: 1 });
    expect(toObject([1, 2])).toEqual({ 0: 1, 1: 2 });
  });
  it('parses JSON strings', () => {
    expect(toObject('{"a":1}')).toEqual({ a: 1 });
    expect(toObject('[["a",1]]')).toEqual({ a: 1 });
    expect(toObject('{bad json}')).toEqual({});
    expect(toObject('plain')).toEqual({});
  });
  it('falls back for other values', () => {
    expect(toObject(null)).toEqual({});
    expect(toObject(42, { d: 1 })).toEqual({ d: 1 });
    expect(toObject([])).toEqual({});
  });
});

describe('type guards', () => {
  it('checks nullishness', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null)).toBe(false);
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
    expect(isNil(0)).toBe(false);
    expect(isNil('')).toBe(false);
  });
  it('checks primitive types', () => {
    expect(isString('a')).toBe(true);
    expect(isString(1)).toBe(false);
    expect(isNumber(1)).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber(Infinity)).toBe(false);
    expect(isNumber('1')).toBe(false);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(0)).toBe(false);
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(class {})).toBe(true);
    expect(isFunction({})).toBe(false);
  });
  it('checks containers', () => {
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
    expect(isObject({})).toBe(true);
    expect(isObject(Object.create(null))).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(new Date())).toBe(false);
    expect(isObject(new Map())).toBe(false);
    expect(isObject(() => {})).toBe(false);
    class Point {}
    expect(isObject(new Point())).toBe(false);
  });
});

describe('isEmpty', () => {
  it('reports empty containers and blank strings', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty(new Set())).toBe(true);
    expect(isEmpty(NaN)).toBe(true);
  });
  it('treats 0 and false as values', () => {
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
    expect(isEmpty('a')).toBe(false);
    expect(isEmpty([0])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty(new Date())).toBe(false);
    expect(isEmpty(new Set([1]))).toBe(false);
  });
});

describe('defaultTo / nullable / coalesce', () => {
  it('falls back on nullish and NaN', () => {
    expect(defaultTo(null, 0)).toBe(0);
    expect(defaultTo(undefined, 0)).toBe(0);
    expect(defaultTo(Number('abc'), 0)).toBe(0);
    expect(defaultTo(0, 5)).toBe(0);
    expect(defaultTo('', 'x')).toBe('');
    expect(defaultTo(false, true)).toBe(false);
  });
  it('normalises blanks to null', () => {
    expect(nullable('')).toBeNull();
    expect(nullable('   ')).toBeNull();
    expect(nullable(undefined)).toBeNull();
    expect(nullable(null)).toBeNull();
    expect(nullable(0)).toBe(0);
    expect(nullable(false)).toBe(false);
    expect(nullable('a')).toBe('a');
  });
  it('coalesces', () => {
    expect(coalesce(null, undefined, 0, 1)).toBe(0);
    expect(coalesce(null, undefined)).toBeUndefined();
    expect(coalesce()).toBeUndefined();
  });
});
