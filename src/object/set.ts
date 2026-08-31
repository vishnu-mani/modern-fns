import { parsePath, type PathSegment } from '../internal/path.js';
import { isForbiddenKey } from '../internal/types.js';
import type { Path } from '../types.js';

function shallowCopy(value: unknown, nextSegment: PathSegment | undefined): unknown {
  if (Array.isArray(value)) return value.slice();
  if (value !== null && typeof value === 'object') return { ...value };
  return typeof nextSegment === 'number' ? [] : {};
}

/**
 * Immutably write a deeply nested value. Every object on the path is copied; untouched
 * branches keep their original reference, so `===` checks and Vue/React change detection
 * stay cheap and correct.
 *
 * Missing intermediate containers are created — an array when the next segment is a numeric
 * index, otherwise an object.
 *
 * @remarks Path segments `__proto__`, `constructor` and `prototype` are rejected (the whole
 * write becomes a no-op) to prevent prototype pollution from user-supplied paths.
 *
 * @example
 * const next = set(state, 'user.address.city', 'Kochi');
 * next !== state;            // true
 * state.user.address.city;   // unchanged
 */
export function set<T>(object: T, path: Path, value: unknown): T {
  const segments = parsePath(path);
  if (segments.length === 0) return value as T;
  if (segments.some(isForbiddenKey)) return object;

  const root = shallowCopy(object, segments[0]) as Record<PropertyKey, unknown>;
  let cursor: Record<PropertyKey, unknown> = root;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    cursor[segment] = shallowCopy(cursor[segment], segments[i + 1]);
    cursor = cursor[segment] as Record<PropertyKey, unknown>;
  }

  cursor[segments[segments.length - 1]] = value;
  return root as T;
}

export default set;
