import { describe, expect, it } from 'vitest';
import * as modernFns from '../../src/index.js';
import chunkDefault, { chunk } from '../../src/array/chunk.js';
import diffDefault, { diff } from '../../src/diff/diff.js';
import setDefault, { set } from '../../src/object/set.js';
import parseDefault, { parse } from '../../src/query/parse.js';

describe('public API surface', () => {
  it('exposes every namespace', () => {
    for (const namespace of [
      'array',
      'object',
      'string',
      'number',
      'url',
      'query',
      'value',
      'functional',
      'collection',
    ] as const) {
      expect(typeof modernFns[namespace]).toBe('object');
    }
  });

  it('flat-exports the documented function names', () => {
    const expected = [
      'chunk',
      'unique',
      'uniqueBy',
      'groupBy',
      'indexBy',
      'partition',
      'sortBy',
      'orderBy',
      'flatten',
      'flattenDeep',
      'compact',
      'difference',
      'intersection',
      'union',
      'zip',
      'unzip',
      'take',
      'takeRight',
      'drop',
      'dropRight',
      'range',
      'window',
      'diffArray',
      'get',
      'set',
      'has',
      'unset',
      'pick',
      'omit',
      'deepClone',
      'deepMerge',
      'mapValues',
      'mapKeys',
      'isEqual',
      'flattenObject',
      'unflattenObject',
      'diff',
      'changed',
      'patch',
      'capitalize',
      'camelCase',
      'pascalCase',
      'kebabCase',
      'snakeCase',
      'constantCase',
      'slugify',
      'truncate',
      'truncateWords',
      'initials',
      'mask',
      'stripHtml',
      'escapeHtml',
      'unescapeHtml',
      'isEmail',
      'isUrl',
      'extractNumbers',
      'extractEmails',
      'clamp',
      'round',
      'floor',
      'ceil',
      'percentage',
      'percentageChange',
      'formatNumber',
      'abbreviate',
      'currency',
      'random',
      'isNumeric',
      'tax',
      'discount',
      'compoundInterest',
      'parseUrl',
      'buildUrl',
      'getQuery',
      'setQuery',
      'removeQuery',
      'mergeQuery',
      'hasQuery',
      'setHash',
      'removeHash',
      'isSameUrl',
      'joinUrl',
      'toString',
      'toNumber',
      'toBoolean',
      'toArray',
      'toDate',
      'toObject',
      'isNil',
      'isString',
      'isNumber',
      'isBoolean',
      'isArray',
      'isObject',
      'isFunction',
      'defaultTo',
      'nullable',
      'coalesce',
      'pipe',
      'compose',
      'identity',
      'noop',
      'once',
      'memoize',
      'debounce',
      'throttle',
      'tryCatch',
      'asyncTryCatch',
      'tap',
      'when',
      'unless',
      'size',
      'first',
      'last',
      'isEmpty',
      'each',
      'map',
      'filter',
      'find',
      'some',
      'every',
    ];
    const missing = expected.filter(
      (name) => typeof (modernFns as Record<string, unknown>)[name] !== 'function',
    );
    expect(missing).toEqual([]);
  });

  it('keeps the query module out of the root barrel to avoid name collisions', () => {
    // `get`/`set`/`has` at the root are the object versions.
    expect(modernFns.get({ a: { b: 1 } }, 'a.b')).toBe(1);
    expect(modernFns.set({ a: 1 }, 'b', 2)).toEqual({ a: 1, b: 2 });
    expect(modernFns.query.get('?a=1', 'a')).toBe(1);
    expect(modernFns.query.set('a=1', 'b', 2)).toBe('a=1&b=2');
  });

  it('exports each function as both a named and a default export', () => {
    expect(chunkDefault).toBe(chunk);
    expect(diffDefault).toBe(diff);
    expect(setDefault).toBe(set);
    expect(parseDefault).toBe(parse);
  });

  it('shares one implementation for re-exported names', async () => {
    const arrayRange = await import('../../src/array/range.js');
    const numberRange = await import('../../src/number/range.js');
    expect(numberRange.range).toBe(arrayRange.range);

    const valueToNumber = await import('../../src/value/toNumber.js');
    const numberToNumber = await import('../../src/number/toNumber.js');
    expect(numberToNumber.toNumber).toBe(valueToNumber.toNumber);

    const valueIsEmpty = await import('../../src/value/isEmpty.js');
    const objectIsEmpty = await import('../../src/object/isEmpty.js');
    const collectionIsEmpty = await import('../../src/collection/isEmpty.js');
    expect(objectIsEmpty.isEmpty).toBe(valueIsEmpty.isEmpty);
    expect(collectionIsEmpty.isEmpty).toBe(valueIsEmpty.isEmpty);
  });
});

describe('immutability contract', () => {
  const frozenArray = Object.freeze([3, 1, 2]);
  const frozenObject = Object.freeze({ a: Object.freeze({ b: 1 }) });

  it('array transforms never mutate their input', () => {
    const {
      chunk: c,
      unique: u,
      sortBy: sb,
      orderBy: ob,
      compact: cp,
      flatten: f,
      flattenDeep: fd,
      take: t,
      drop: d,
      takeRight: tr,
      dropRight: dr,
      union: un,
      difference: df,
      intersection: it_,
      zip: z,
      unzip: uz,
      window: w,
      partition: p,
      groupBy: gb,
    } = modernFns;
    const snapshot = [...frozenArray];
    c(frozenArray, 2);
    u(frozenArray);
    sb(frozenArray, (n) => n);
    ob(frozenArray, [(n) => n], ['desc']);
    cp(frozenArray);
    f(frozenArray);
    fd(frozenArray);
    t(frozenArray, 1);
    d(frozenArray, 1);
    tr(frozenArray, 1);
    dr(frozenArray, 1);
    un(frozenArray, [4]);
    df(frozenArray, [1]);
    it_(frozenArray, [1]);
    z(frozenArray);
    uz([frozenArray]);
    w(frozenArray, 2);
    p(frozenArray, (n) => n > 1);
    gb(frozenArray, (n) => n);
    expect([...frozenArray]).toEqual(snapshot);
  });

  it('object transforms never mutate their input', () => {
    const next = modernFns.set(frozenObject, 'a.b', 2);
    expect(next).not.toBe(frozenObject);
    expect(frozenObject.a.b).toBe(1);
    expect(modernFns.unset(frozenObject, 'a.b').a).toEqual({});
    expect(frozenObject.a.b).toBe(1);
    modernFns.deepMerge(frozenObject, { a: { c: 2 } });
    modernFns.mapValues(frozenObject, (v) => v);
    modernFns.omit(frozenObject, ['a']);
    modernFns.pick(frozenObject, ['a']);
    expect(frozenObject).toEqual({ a: { b: 1 } });
  });

  it('diff and patch never mutate their inputs', () => {
    const before = Object.freeze({ a: 1, list: Object.freeze([1, 2]) });
    const after = { a: 2, list: [1] };
    const changes = modernFns.diff(before, after);
    expect(modernFns.patch(before, changes)).toEqual(after);
    expect(before).toEqual({ a: 1, list: [1, 2] });
  });
});

describe('phase 4 API review outcomes', () => {
  it('offers a non-shadowing alias for window', async () => {
    const mod = await import('../../src/array/window.js');
    expect(modernFns.slidingWindow).toBe(mod.window);
    expect(modernFns.slidingWindow([1, 2, 3], 2)).toEqual([
      [1, 2],
      [2, 3],
    ]);
  });

  it('does not expose a diff namespace, only the three flat functions', () => {
    expect((modernFns as Record<string, unknown>).diffModule).toBeUndefined();
    expect(typeof modernFns.diff).toBe('function');
    expect(typeof modernFns.changed).toBe('function');
    expect(typeof modernFns.patch).toBe('function');
  });

  it('keeps every root export name unique', () => {
    const names = Object.keys(modernFns);
    expect(new Set(names).size).toBe(names.length);
  });
});
