import { describe, expect, it } from 'vitest';
import { changed, diff, patch } from '../../src/index.js';
import { invert } from '../../src/diff/patch.js';

const oldUser = { name: 'John', age: 28, address: { country: 'IN' }, tags: ['a', 'b'] };
const newUser = {
  name: 'Vishnu',
  age: 29,
  address: { country: 'IN', city: 'Kochi' },
  tags: ['a', 'b'],
};

describe('diff', () => {
  it('reports changed, added and nested changes', () => {
    expect(diff(oldUser, newUser)).toEqual([
      { path: 'name', type: 'changed', oldValue: 'John', newValue: 'Vishnu' },
      { path: 'age', type: 'changed', oldValue: 28, newValue: 29 },
      { path: 'address.city', type: 'added', newValue: 'Kochi' },
    ]);
  });
  it('reports removals', () => {
    expect(diff({ a: 1, b: 2 }, { a: 1 })).toEqual([{ path: 'b', type: 'removed', oldValue: 2 }]);
  });
  it('returns [] for equal values', () => {
    expect(diff(oldUser, { ...oldUser, tags: ['a', 'b'], address: { country: 'IN' } })).toEqual([]);
    expect(diff(1, 1)).toEqual([]);
    expect(diff(null, null)).toEqual([]);
  });
  it('diffs arrays by index', () => {
    expect(diff({ l: [1, 2] }, { l: [1, 9] })).toEqual([
      { path: 'l[1]', type: 'changed', oldValue: 2, newValue: 9 },
    ]);
    expect(diff({ l: [1] }, { l: [1, 2] })).toEqual([{ path: 'l[1]', type: 'added', newValue: 2 }]);
    expect(diff({ l: [1, 2] }, { l: [1] })).toEqual([
      { path: 'l[1]', type: 'removed', oldValue: 2 },
    ]);
  });
  it('supports whole-array comparison', () => {
    expect(diff({ l: [1, 2] }, { l: [1, 9] }, { arrays: 'whole' })).toEqual([
      { path: 'l', type: 'changed', oldValue: [1, 2], newValue: [1, 9] },
    ]);
  });
  it('supports key-based array comparison', () => {
    const before = {
      items: [
        { id: 1, n: 'a' },
        { id: 2, n: 'b' },
      ],
    };
    const after = {
      items: [
        { id: 2, n: 'b' },
        { id: 1, n: 'z' },
      ],
    };
    const changes = diff(before, after, { arrays: 'key', key: 'id' });
    expect(changes).toEqual([
      { path: 'items[1].n', type: 'changed', oldValue: 'a', newValue: 'z' },
    ]);
  });
  it('reports adds and removes with key-based comparison', () => {
    const changes = diff({ l: [{ id: 1 }] }, { l: [{ id: 2 }] }, { arrays: 'key', key: 'id' });
    expect(changes).toEqual([
      { path: 'l[0]', type: 'added', newValue: { id: 2 } },
      { path: 'l[0]', type: 'removed', oldValue: { id: 1 } },
    ]);
  });
  it('accepts a key function', () => {
    const changes = diff(
      { l: [{ id: 1, v: 1 }] },
      { l: [{ id: 1, v: 2 }] },
      { arrays: 'key', key: (item) => (item as { id: number }).id },
    );
    expect(changes).toEqual([{ path: 'l[0].v', type: 'changed', oldValue: 1, newValue: 2 }]);
  });
  it('honours custom equality', () => {
    const caseInsensitive = diff(
      { n: 'ABC' },
      { n: 'abc' },
      {
        equals: (a, b) =>
          typeof a === 'string' && typeof b === 'string'
            ? a.toLowerCase() === b.toLowerCase()
            : undefined,
      },
    );
    expect(caseInsensitive).toEqual([]);
    expect(diff({ n: 'a', x: 1 }, { n: 'b', x: 2 }, { equals: () => undefined })).toHaveLength(2);
  });
  it('honours ignore', () => {
    expect(
      diff({ a: 1, updatedAt: 1 }, { a: 2, updatedAt: 2 }, { ignore: (p) => p === 'updatedAt' }),
    ).toEqual([{ path: 'a', type: 'changed', oldValue: 1, newValue: 2 }]);
    expect(diff({ a: 1 }, {}, { ignore: () => true })).toEqual([]);
    expect(diff({}, { a: 1 }, { ignore: () => true })).toEqual([]);
    expect(diff({ l: [1] }, { l: [] }, { ignore: () => true })).toEqual([]);
    expect(diff({ l: [] }, { l: [1] }, { ignore: () => true })).toEqual([]);
  });
  it('honours maxDepth', () => {
    expect(diff({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } }, { maxDepth: 1 })).toEqual([
      { path: 'a', type: 'changed', oldValue: { b: { c: 1 } }, newValue: { b: { c: 2 } } },
    ]);
  });
  it('handles type changes and root-level values', () => {
    expect(diff({ a: 1 }, { a: [1] })).toEqual([
      { path: 'a', type: 'changed', oldValue: 1, newValue: [1] },
    ]);
    expect(diff(1, 2)).toEqual([{ path: '', type: 'changed', oldValue: 1, newValue: 2 }]);
    expect(diff(undefined, { a: 1 })).toEqual([{ path: '', type: 'added', newValue: { a: 1 } }]);
  });
  it('quotes non-identifier keys in paths', () => {
    expect(diff({ 'a.b': 1 }, { 'a.b': 2 })[0].path).toBe("['a.b']");
  });
  it('does not mutate its inputs', () => {
    const snapshot = JSON.stringify(oldUser);
    diff(oldUser, newUser);
    expect(JSON.stringify(oldUser)).toBe(snapshot);
  });
});

describe('changed', () => {
  it('answers the dirty question', () => {
    expect(changed(oldUser, newUser)).toBe(true);
    expect(changed(oldUser, { ...oldUser })).toBe(false);
    expect(changed({ a: 1, t: 1 }, { a: 1, t: 2 }, { ignore: (p) => p === 't' })).toBe(false);
  });
});

describe('patch / invert', () => {
  it('rebuilds the new value from the old one', () => {
    expect(patch(oldUser, diff(oldUser, newUser))).toEqual(newUser);
  });
  it('is immutable', () => {
    const result = patch(oldUser, diff(oldUser, newUser));
    expect(result).not.toBe(oldUser);
    expect(oldUser.name).toBe('John');
  });
  it('applies removals, including array splices', () => {
    const before = { a: 1, l: [1, 2, 3] };
    const after = { l: [1] };
    expect(patch(before, diff(before, after))).toEqual(after);
  });
  it('returns the input for an empty change list', () => {
    expect(patch(oldUser, [])).toBe(oldUser);
    expect(patch(oldUser, null as never)).toBe(oldUser);
  });
  it('handles root-level changes', () => {
    expect(patch(1, [{ path: '', type: 'changed', oldValue: 1, newValue: 2 }])).toBe(2);
  });
  it('undoes an edit when inverted', () => {
    const changes = diff(oldUser, newUser);
    expect(patch(newUser, invert(changes))).toEqual(oldUser);
  });
  it('inverts every change type', () => {
    expect(
      invert([
        { path: 'a', type: 'added', newValue: 1 },
        { path: 'b', type: 'removed', oldValue: 2 },
        { path: 'c', type: 'changed', oldValue: 3, newValue: 4 },
      ]),
    ).toEqual([
      { path: 'a', type: 'removed', oldValue: 1 },
      { path: 'b', type: 'added', newValue: 2 },
      { path: 'c', type: 'changed', oldValue: 4, newValue: 3 },
    ]);
  });
});

describe('diff use cases', () => {
  it('produces a PATCH body', () => {
    const changes = diff({ name: 'a', email: 'e', age: 1 }, { name: 'b', email: 'e', age: 1 });
    const body = Object.fromEntries(
      changes
        .filter((c) => c.type !== 'removed')
        .map((c) => [c.path, (c as { newValue: unknown }).newValue]),
    );
    expect(body).toEqual({ name: 'b' });
  });
  it('supports undo/redo round-trips', () => {
    const states = [{ n: 1 }, { n: 2 }, { n: 3 }];
    const forward = states.slice(1).map((state, i) => diff(states[i], state));
    let current: { n: number } = states[0];
    for (const changes of forward) current = patch(current, changes);
    expect(current).toEqual({ n: 3 });
    for (const changes of [...forward].reverse()) current = patch(current, invert(changes));
    expect(current).toEqual({ n: 1 });
  });
});
