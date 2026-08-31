import { describe, expect, it } from 'vitest';
import {
  chunk,
  compact,
  difference,
  drop,
  dropRight,
  flatten,
  flattenDeep,
  groupBy,
  indexBy,
  intersection,
  orderBy,
  partition,
  range,
  sortBy,
  take,
  takeRight,
  union,
  unique,
  uniqueBy,
  unzip,
  window,
  zip,
} from '../../src/index.js';
import first from '../../src/array/first.js';
import last from '../../src/array/last.js';

const users = [
  { id: 1, name: 'Ann', role: 'admin', age: 30 },
  { id: 2, name: 'Bob', role: 'editor', age: 25 },
  { id: 3, name: 'Cid', role: 'admin', age: 25 },
];

describe('chunk', () => {
  it('splits into groups of size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it('handles exact multiples', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
  it('returns [] for empty, invalid size or non-array', () => {
    expect(chunk([], 2)).toEqual([]);
    expect(chunk([1, 2], 0)).toEqual([]);
    expect(chunk([1, 2], -1)).toEqual([]);
    expect(chunk([1, 2], NaN)).toEqual([]);
    expect(chunk(null as never, 2)).toEqual([]);
  });
  it('truncates fractional sizes', () => {
    expect(chunk([1, 2, 3], 2.9)).toEqual([[1, 2], [3]]);
  });
  it('does not mutate the input', () => {
    const input = [1, 2, 3];
    chunk(input, 2);
    expect(input).toEqual([1, 2, 3]);
  });
});

describe('unique / uniqueBy', () => {
  it('removes duplicates keeping order', () => {
    expect(unique([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
  });
  it('treats NaN as equal to NaN', () => {
    expect(unique([NaN, NaN, 1])).toEqual([NaN, 1]);
  });
  it('keeps distinct object references', () => {
    const a = { x: 1 };
    expect(unique([a, a, { x: 1 }])).toHaveLength(2);
  });
  it('handles empty and non-array input', () => {
    expect(unique([])).toEqual([]);
    expect(unique(undefined as never)).toEqual([]);
  });
  it('de-duplicates by key or function', () => {
    expect(uniqueBy(users, 'role')).toHaveLength(2);
    expect(uniqueBy(users, (u) => u.age)).toHaveLength(2);
    expect(uniqueBy([], 'id' as never)).toEqual([]);
    expect(uniqueBy(null as never, 'id' as never)).toEqual([]);
  });
  it('keeps the first occurrence', () => {
    expect(uniqueBy(users, 'age')[1]).toEqual(users[1]);
  });
  it('tolerates nullish items with a key selector', () => {
    expect(uniqueBy([null, null, { id: 1 }] as never, 'id' as never)).toHaveLength(2);
  });
});

describe('groupBy / indexBy', () => {
  it('groups by key name', () => {
    expect(groupBy(users, 'role')).toEqual({
      admin: [users[0], users[2]],
      editor: [users[1]],
    });
  });
  it('groups by function and stringifies keys', () => {
    expect(Object.keys(groupBy(users, (u) => u.age))).toEqual(['25', '30']);
    expect(groupBy(users, (u) => u.age)['25']).toHaveLength(2);
  });
  it('is prototype-safe', () => {
    const grouped = groupBy([{ k: '__proto__' }], 'k');
    expect(Object.keys(grouped)).toEqual(['__proto__']);
  });
  it('indexes with last-wins', () => {
    expect(indexBy(users, 'role').admin).toEqual(users[2]);
    expect(indexBy(users, 'id')['2']).toEqual(users[1]);
  });
  it('handles empty and invalid input', () => {
    expect(groupBy([], 'role' as never)).toEqual({});
    expect(groupBy(null as never, 'x' as never)).toEqual({});
    expect(indexBy(null as never, 'x' as never)).toEqual({});
  });
});

describe('partition', () => {
  it('splits by predicate', () => {
    expect(partition([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([
      [2, 4],
      [1, 3],
    ]);
  });
  it('passes the index', () => {
    expect(partition(['a', 'b'], (_, i) => i === 0)).toEqual([['a'], ['b']]);
  });
  it('handles empty and invalid input', () => {
    expect(partition([], () => true)).toEqual([[], []]);
    expect(partition(undefined as never, () => true)).toEqual([[], []]);
  });
});

describe('sortBy / orderBy', () => {
  it('sorts ascending without mutating', () => {
    const input = [3, 1, 2];
    expect(sortBy(input, (n) => n)).toEqual([1, 2, 3]);
    expect(input).toEqual([3, 1, 2]);
  });
  it('sorts by key name', () => {
    expect(sortBy(users, 'name').map((u) => u.name)).toEqual(['Ann', 'Bob', 'Cid']);
  });
  it('is stable for equal keys', () => {
    expect(sortBy(users, 'age').map((u) => u.id)).toEqual([2, 3, 1]);
  });
  it('puts nullish values last', () => {
    expect(sortBy([{ a: 2 }, { a: null }, { a: 1 }], 'a').map((o) => o.a)).toEqual([1, 2, null]);
  });
  it('compares dates, booleans and mixed types', () => {
    expect(sortBy([new Date(10), new Date(1)], (d) => d)[0]).toEqual(new Date(1));
    expect(sortBy([true, false], (b) => b)).toEqual([false, true]);
    expect(sortBy([{ a: 'b' }, { a: 1 }], 'a')).toHaveLength(2);
  });
  it('puts NaN last', () => {
    expect(sortBy([NaN, 2, 1], (n) => n)).toEqual([1, 2, NaN]);
  });
  it('orders by several keys and directions', () => {
    expect(orderBy(users, ['role', 'age'], ['asc', 'desc']).map((u) => u.id)).toEqual([1, 3, 2]);
    expect(orderBy(users, ['age'], ['desc']).map((u) => u.id)).toEqual([1, 2, 3]);
  });
  it('defaults missing directions to asc and copies when no selectors', () => {
    expect(orderBy(users, ['age']).map((u) => u.id)).toEqual([2, 3, 1]);
    expect(orderBy(users, [])).toEqual(users);
    expect(orderBy(null as never, [])).toEqual([]);
  });
});

describe('flatten / flattenDeep / compact', () => {
  it('flattens one level', () => {
    expect(flatten([1, [2, 3], [4]])).toEqual([1, 2, 3, 4]);
    expect(flatten<number[] | number[][]>([[[1]], [2]])).toEqual([[1], 2]);
    expect(flatten(null as never)).toEqual([]);
  });
  it('flattens deeply without recursion limits', () => {
    expect(flattenDeep([1, [2, [3, [4, [5]]]]])).toEqual([1, 2, 3, 4, 5]);
    expect(flattenDeep([])).toEqual([]);
    expect(flattenDeep(null as never)).toEqual([]);
    let deep: unknown = [1];
    for (let i = 0; i < 5000; i += 1) deep = [deep];
    expect(flattenDeep(deep as never)).toEqual([1]);
  });
  it('removes falsy values', () => {
    expect(compact([0, 1, false, 2, '', 3, null, undefined, NaN])).toEqual([1, 2, 3]);
    expect(compact(null as never)).toEqual([]);
  });
});

describe('difference / intersection / union', () => {
  it('computes difference', () => {
    expect(difference([1, 2, 3], [2])).toEqual([1, 3]);
    expect(difference([1, 1, 2], [2])).toEqual([1, 1]);
    expect(difference([1], null as never)).toEqual([1]);
    expect(difference(null as never, [1])).toEqual([]);
  });
  it('computes difference by selector', () => {
    expect(difference(users, [{ id: 2 }] as never, 'id')).toHaveLength(2);
  });
  it('computes intersection, de-duplicated', () => {
    expect(intersection([1, 2, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    expect(intersection([1], [])).toEqual([]);
    expect(intersection(null as never, [1])).toEqual([]);
    expect(intersection(users, [{ id: 3 }] as never, 'id')).toEqual([users[2]]);
  });
  it('computes union', () => {
    expect(union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4]);
    expect(union()).toEqual([]);
    expect(union([1], null, undefined)).toEqual([1]);
  });
});

describe('zip / unzip', () => {
  it('zips to the longest array', () => {
    expect(zip([1, 2], ['a', 'b'])).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
    expect(zip([1, 2, 3], ['a'])).toEqual([
      [1, 'a'],
      [2, undefined],
      [3, undefined],
    ]);
  });
  it('handles no input', () => {
    expect(zip()).toEqual([]);
    expect(zip(null as never)).toEqual([]);
  });
  it('unzips rows into columns', () => {
    expect(
      unzip([
        [1, 'a'],
        [2, 'b'],
      ]),
    ).toEqual([
      [1, 2],
      ['a', 'b'],
    ]);
    expect(unzip([])).toEqual([]);
    expect(unzip(null as never)).toEqual([]);
    expect(unzip([null] as never)).toEqual([]);
  });
  it('round-trips', () => {
    const rows = [
      [1, 'a'],
      [2, 'b'],
    ];
    expect(zip(...unzip(rows))).toEqual(rows);
  });
});

describe('first / last / take / drop', () => {
  it('reads ends', () => {
    expect(first([1, 2])).toBe(1);
    expect(last([1, 2])).toBe(2);
    expect(first([])).toBeUndefined();
    expect(last([])).toBeUndefined();
    expect(first(null as never)).toBeUndefined();
    expect(last(null as never)).toBeUndefined();
  });
  it('takes and drops from both ends', () => {
    expect(take([1, 2, 3], 2)).toEqual([1, 2]);
    expect(takeRight([1, 2, 3], 2)).toEqual([2, 3]);
    expect(drop([1, 2, 3], 1)).toEqual([2, 3]);
    expect(dropRight([1, 2, 3], 1)).toEqual([1, 2]);
  });
  it('defaults to one element', () => {
    expect(take([1, 2])).toEqual([1]);
    expect(takeRight([1, 2])).toEqual([2]);
    expect(drop([1, 2])).toEqual([2]);
    expect(dropRight([1, 2])).toEqual([1]);
  });
  it('clamps out-of-range counts', () => {
    expect(take([1], 99)).toEqual([1]);
    expect(takeRight([1], 99)).toEqual([1]);
    expect(drop([1], 99)).toEqual([]);
    expect(dropRight([1], 99)).toEqual([]);
    expect(take([1], -1)).toEqual([]);
    expect(takeRight([1], -1)).toEqual([]);
    expect(drop([1], -1)).toEqual([1]);
    expect(dropRight([1], -1)).toEqual([1]);
  });
  it('handles non-arrays', () => {
    expect(take(null as never, 1)).toEqual([]);
    expect(takeRight(null as never, 1)).toEqual([]);
    expect(drop(null as never, 1)).toEqual([]);
    expect(dropRight(null as never, 1)).toEqual([]);
  });
});

describe('range', () => {
  it('builds ranges', () => {
    expect(range(4)).toEqual([0, 1, 2, 3]);
    expect(range(1, 4)).toEqual([1, 2, 3]);
    expect(range(0, 10, 2.5)).toEqual([0, 2.5, 5, 7.5]);
    expect(range(3, 0, -1)).toEqual([3, 2, 1]);
    expect(range(3, 0)).toEqual([3, 2, 1]);
  });
  it('returns [] for impossible ranges', () => {
    expect(range(0)).toEqual([]);
    expect(range(0, 5, 0)).toEqual([]);
    expect(range(0, 5, -1)).toEqual([]);
    expect(range(5, 0, 1)).toEqual([]);
    expect(range(NaN, 5)).toEqual([]);
    expect(range(0, Infinity)).toEqual([]);
    expect(range(0, 5, NaN)).toEqual([]);
  });
});

describe('window', () => {
  it('produces sliding windows', () => {
    expect(window([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
    expect(window([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });
  it('returns [] when too short or invalid', () => {
    expect(window([1], 2)).toEqual([]);
    expect(window([1, 2], 0)).toEqual([]);
    expect(window([1, 2], NaN)).toEqual([]);
    expect(window(null as never, 2)).toEqual([]);
  });
});
