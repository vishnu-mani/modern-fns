import { describe, expect, it } from 'vitest';
import { get, has, set, unset, pick, omit } from '../../src/index.js';

const user = {
  id: 1,
  name: 'Vishnu',
  company: { address: { city: 'Kochi', zip: null } },
  users: [{ address: { city: 'Delhi' } }, { address: { city: 'Pune' } }],
  'dotted.key': 'literal',
};

describe('get', () => {
  it('reads dotted paths', () => {
    expect(get(user, 'company.address.city')).toBe('Kochi');
  });
  it('reads bracketed paths', () => {
    expect(get(user, 'users[0].address.city')).toBe('Delhi');
    expect(get(user, 'users[1].address.city')).toBe('Pune');
  });
  it('reads array-form paths', () => {
    expect(get(user, ['users', 0, 'address', 'city'])).toBe('Delhi');
  });
  it('reads quoted keys containing dots', () => {
    expect(get(user, "['dotted.key']")).toBe('literal');
  });
  it('returns the default for missing paths', () => {
    expect(get(user, 'company.address.country')).toBeUndefined();
    expect(get(user, 'company.address.country', 'IN')).toBe('IN');
    expect(get(user, 'a.b.c.d.e', 'x')).toBe('x');
  });
  it('returns null values as null, not the default', () => {
    expect(get(user, 'company.address.zip', 'fallback')).toBeNull();
  });
  it('handles nullish and primitive roots', () => {
    expect(get(null, 'a.b', 'd')).toBe('d');
    expect(get(undefined, 'a', 'd')).toBe('d');
    expect(get(42, 'a', 'd')).toBe('d');
    expect(get('abc', 'length')).toBe(3);
  });
  it('reads Map entries', () => {
    expect(get(new Map([['a', 1]]), 'a')).toBe(1);
    expect(get({ m: new Map([['a', { b: 2 }]]) }, 'm.a.b')).toBe(2);
  });
  it('returns the root for an empty path', () => {
    expect(get(user, '')).toBe(user);
  });
  it('does not mutate', () => {
    const snapshot = JSON.stringify(user);
    get(user, 'a.b.c');
    expect(JSON.stringify(user)).toBe(snapshot);
  });
});

describe('has', () => {
  it('distinguishes absent from undefined', () => {
    expect(has({ a: { b: undefined } }, 'a.b')).toBe(true);
    expect(has({ a: {} }, 'a.b')).toBe(false);
  });
  it('checks array indices', () => {
    expect(has({ list: [1] }, 'list[0]')).toBe(true);
    expect(has({ list: [1] }, 'list[1]')).toBe(false);
    expect(has({ list: [1] }, 'list[-1]')).toBe(false);
  });
  it('checks Maps and nullish roots', () => {
    expect(has(new Map([['a', 1]]), 'a')).toBe(true);
    expect(has(new Map(), 'a')).toBe(false);
    expect(has(null, 'a')).toBe(false);
    expect(has({ a: 1 }, '')).toBe(true);
    expect(has(undefined, '')).toBe(false);
  });
  it('ignores inherited properties', () => {
    expect(has({}, 'toString')).toBe(false);
  });
  it('returns false when walking through a primitive', () => {
    expect(has({ a: 5 }, 'a.b')).toBe(false);
  });
});

describe('set', () => {
  it('writes immutably', () => {
    const original = { user: { name: 'John' } };
    const updated = set(original, 'user.name', 'Vishnu');
    expect(updated.user.name).toBe('Vishnu');
    expect(original.user.name).toBe('John');
    expect(updated).not.toBe(original);
    expect(updated.user).not.toBe(original.user);
  });
  it('keeps untouched branches by reference', () => {
    const original = { a: { deep: 1 }, b: { keep: 2 } };
    const updated = set(original, 'a.deep', 9);
    expect(updated.b).toBe(original.b);
  });
  it('creates missing containers', () => {
    expect(set({}, 'a.b.c', 1)).toEqual({ a: { b: { c: 1 } } });
    expect(set({}, 'list[0].x', 1)).toEqual({ list: [{ x: 1 }] });
  });
  it('writes into arrays without mutating them', () => {
    const original = { list: [1, 2, 3] };
    const updated = set(original, 'list[1]', 9);
    expect(updated.list).toEqual([1, 9, 3]);
    expect(original.list).toEqual([1, 2, 3]);
  });
  it('replaces the root for an empty path', () => {
    expect(set({ a: 1 }, '', 5)).toBe(5);
  });
  it('refuses prototype-polluting paths', () => {
    const target = {};
    expect(set(target, '__proto__.polluted', true)).toBe(target);
    expect(set(target, 'constructor.prototype.x', true)).toBe(target);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
  it('replaces primitives along the path', () => {
    expect(set({ a: 5 }, 'a.b', 1)).toEqual({ a: { b: 1 } });
  });
});

describe('unset', () => {
  it('removes immutably', () => {
    const original = { a: { b: 1, c: 2 } };
    const updated = unset(original, 'a.b');
    expect(updated).toEqual({ a: { c: 2 } });
    expect(original).toEqual({ a: { b: 1, c: 2 } });
  });
  it('splices array indices', () => {
    expect(unset({ list: [1, 2, 3] }, 'list[1]')).toEqual({ list: [1, 3] });
  });
  it('returns the same reference when the path is missing', () => {
    const original = { a: 1 };
    expect(unset(original, 'b.c')).toBe(original);
    expect(unset(original, 'a.b')).toBe(original);
    expect(unset(original, '')).toBe(original);
    expect(unset(original, '__proto__')).toBe(original);
  });
  it('handles out-of-range indices', () => {
    const original = { list: [1] };
    expect(unset(original, 'list[5]')).toBe(original);
  });
});

describe('pick / omit', () => {
  it('picks plain keys', () => {
    expect(pick(user, ['id', 'name'])).toEqual({ id: 1, name: 'Vishnu' });
  });
  it('skips absent keys instead of adding undefined', () => {
    expect(Object.keys(pick(user, ['id', 'missing'] as never))).toEqual(['id']);
  });
  it('picks nested paths', () => {
    expect(pick(user, ['company.address.city'])).toEqual({
      company: { address: { city: 'Kochi' } },
    });
  });
  it('omits keys immutably', () => {
    const result = omit(user, ['name']);
    expect((result as { name?: string }).name).toBeUndefined();
    expect(user.name).toBe('Vishnu');
  });
  it('omits nested paths', () => {
    expect(omit(user, ['company.address.zip']).company).toEqual({ address: { city: 'Kochi' } });
  });
  it('handles nullish input', () => {
    expect(pick(null as never, ['a'])).toEqual({});
    expect(omit(null as never, ['a'])).toEqual({});
  });
  it('omits from arrays without breaking them', () => {
    expect(omit([1, 2, 3] as never, ['1'] as never)).toEqual([1, 3]);
  });
});
