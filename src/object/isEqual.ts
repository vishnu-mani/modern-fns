import { hasOwn, sameValueZero, tagOf } from '../internal/types.js';

/**
 * Deep structural equality.
 *
 * - `NaN` equals `NaN`, `0` equals `-0` (SameValueZero).
 * - `Date`, `RegExp`, `Map`, `Set`, typed arrays and array buffers compare by content.
 * - Objects must share a prototype and have the same own enumerable keys.
 * - Circular structures are handled.
 * - Functions compare by reference.
 *
 * @example
 * isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }); // true
 * isEqual(new Date(0), new Date(0));                   // true
 */
export function isEqual(a: unknown, b: unknown): boolean {
  return equals(a, b, new Map<unknown, Set<unknown>>());
}

function equals(a: unknown, b: unknown, seen: Map<unknown, Set<unknown>>): boolean {
  if (sameValueZero(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

  const tag = tagOf(a);
  if (tag !== tagOf(b)) return false;

  const visited = seen.get(a);
  if (visited?.has(b)) return true;
  if (visited) visited.add(b);
  else seen.set(a, new Set([b]));

  switch (tag) {
    case 'Date':
      return sameValueZero((a as Date).getTime(), (b as Date).getTime());
    case 'RegExp':
      return (
        (a as RegExp).source === (b as RegExp).source && (a as RegExp).flags === (b as RegExp).flags
      );
    case 'Error':
      return (
        (a as Error).name === (b as Error).name && (a as Error).message === (b as Error).message
      );
    default:
      break;
  }

  if (Array.isArray(a)) {
    const other = b as unknown[];
    if (a.length !== other.length) return false;
    return a.every((item, index) => equals(item, other[index], seen));
  }

  if (a instanceof Map) {
    const other = b as Map<unknown, unknown>;
    if (a.size !== other.size) return false;
    for (const [key, value] of a) {
      if (!other.has(key)) {
        // Keys may be structurally (not referentially) equal.
        const match = [...other.entries()].find(([otherKey]) => equals(key, otherKey, seen));
        if (!match || !equals(value, match[1], seen)) return false;
        continue;
      }
      if (!equals(value, other.get(key), seen)) return false;
    }
    return true;
  }

  if (a instanceof Set) {
    const other = b as Set<unknown>;
    if (a.size !== other.size) return false;
    const remaining = [...other];
    for (const value of a) {
      const index = remaining.findIndex((candidate) => equals(value, candidate, seen));
      if (index === -1) return false;
      remaining.splice(index, 1);
    }
    return true;
  }

  if (ArrayBuffer.isView(a) && !(a instanceof DataView)) {
    const left = a as unknown as ArrayLike<number>;
    const right = b as unknown as ArrayLike<number>;
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i += 1) if (left[i] !== right[i]) return false;
    return true;
  }

  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (key) =>
      hasOwn(b, key) &&
      equals((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], seen),
  );
}

export default isEqual;
