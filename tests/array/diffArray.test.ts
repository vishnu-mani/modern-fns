import { describe, expect, it } from 'vitest';
import { diffArray } from '../../src/index.js';

const oldUsers = [
  { id: 1, name: 'John', age: 28 },
  { id: 2, name: 'Bob', age: 40 },
  { id: 3, name: 'Cid', age: 22 },
];
const newUsers = [
  { id: 1, name: 'Vishnu', age: 29 },
  { id: 3, name: 'Cid', age: 22 },
  { id: 4, name: 'Dee', age: 31 },
];

describe('diffArray with a key', () => {
  const result = diffArray(oldUsers, newUsers, 'id');

  it('detects added items', () => {
    expect(result.added).toEqual([{ id: 4, name: 'Dee', age: 31 }]);
  });
  it('detects removed items', () => {
    expect(result.removed).toEqual([{ id: 2, name: 'Bob', age: 40 }]);
  });
  it('detects unchanged items', () => {
    expect(result.unchanged).toEqual([{ id: 3, name: 'Cid', age: 22 }]);
  });
  it('reports field-level changes for updated items', () => {
    expect(result.updated).toHaveLength(1);
    expect(result.updated[0].key).toBe(1);
    expect(result.updated[0].before).toEqual(oldUsers[0]);
    expect(result.updated[0].after).toEqual(newUsers[0]);
    expect(result.updated[0].changes).toEqual([
      { path: 'name', type: 'changed', oldValue: 'John', newValue: 'Vishnu' },
      { path: 'age', type: 'changed', oldValue: 28, newValue: 29 },
    ]);
  });
  it('does not mutate the inputs', () => {
    expect(oldUsers).toHaveLength(3);
    expect(newUsers).toHaveLength(3);
  });
  it('treats reordering as unchanged', () => {
    const shuffled = diffArray(oldUsers, [oldUsers[2], oldUsers[0], oldUsers[1]], 'id');
    expect(shuffled.unchanged).toHaveLength(3);
    expect(shuffled.added).toEqual([]);
    expect(shuffled.removed).toEqual([]);
    expect(shuffled.updated).toEqual([]);
  });
  it('accepts a key function', () => {
    const byName = diffArray(oldUsers, newUsers, (u) => u.name);
    expect(byName.added.map((u) => u.name)).toEqual(['Vishnu', 'Dee']);
    expect(byName.removed.map((u) => u.name)).toEqual(['John', 'Bob']);
  });
  it('can skip change computation', () => {
    const cheap = diffArray(oldUsers, newUsers, 'id', { withChanges: false });
    expect(cheap.updated[0].changes).toEqual([]);
  });
  it('honours ignore and custom equality', () => {
    expect(
      diffArray(oldUsers, newUsers, 'id', { ignore: (p) => p === 'age' }).updated[0].changes,
    ).toHaveLength(1);
    const alwaysEqual = diffArray(oldUsers, newUsers, 'id', { equals: () => true });
    expect(alwaysEqual.updated[0].changes).toEqual([]);
  });
});

describe('diffArray without a key', () => {
  it('matches by deep equality', () => {
    expect(diffArray([1, 2, 3], [2, 3, 4])).toEqual({
      added: [4],
      removed: [1],
      updated: [],
      unchanged: [2, 3],
    });
  });
  it('handles duplicates as a multiset', () => {
    const result = diffArray([1, 1, 2], [1, 2, 2]);
    expect(result.added).toEqual([2]);
    expect(result.removed).toEqual([1]);
    expect(result.unchanged).toEqual([1, 2]);
  });
  it('deep-compares objects', () => {
    const result = diffArray([{ a: { b: 1 } }], [{ a: { b: 1 } }]);
    expect(result.unchanged).toHaveLength(1);
    expect(result.added).toEqual([]);
  });
  it('never reports updates', () => {
    expect(diffArray([{ id: 1, v: 1 }], [{ id: 1, v: 2 }]).updated).toEqual([]);
  });
});

describe('diffArray edge cases', () => {
  it('handles empty inputs', () => {
    expect(diffArray([], [])).toEqual({ added: [], removed: [], updated: [], unchanged: [] });
    expect(diffArray([], [1]).added).toEqual([1]);
    expect(diffArray([1], []).removed).toEqual([1]);
  });
  it('handles nullish inputs', () => {
    expect(diffArray(null as never, undefined as never)).toEqual({
      added: [],
      removed: [],
      updated: [],
      unchanged: [],
    });
  });
  it('handles items missing the key', () => {
    const result = diffArray(
      [{ id: undefined }] as never,
      [{ id: undefined }] as never,
      'id' as never,
    );
    expect(result.unchanged).toHaveLength(1);
  });
});
