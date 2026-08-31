import { parsePath, type PathSegment } from '../internal/path.js';
import { hasOwn, isForbiddenKey } from '../internal/types.js';
import type { Path } from '../types.js';

function copyContainer(value: unknown): unknown {
  return Array.isArray(value) ? value.slice() : { ...(value as object) };
}

function exists(container: unknown, segment: PathSegment): boolean {
  if (container == null || typeof container !== 'object') return false;
  if (Array.isArray(container)) {
    const index = Number(segment);
    return Number.isInteger(index) && index >= 0 && index < container.length;
  }
  return hasOwn(container, segment);
}

/**
 * Immutably remove a path. Returns the original reference untouched when the path does not
 * exist, so `unset` is safe to call unconditionally.
 *
 * Removing an array index **splices** it out rather than leaving a hole — the behaviour people
 * actually want when deleting a row.
 *
 * @example
 * unset({ a: { b: 1, c: 2 } }, 'a.b');   // { a: { c: 2 } }
 * unset({ list: [1, 2, 3] }, 'list[1]'); // { list: [1, 3] }
 */
export function unset<T>(object: T, path: Path): T {
  const segments = parsePath(path);
  if (segments.length === 0 || segments.some(isForbiddenKey)) return object;

  // Walk first so a missing path costs nothing and returns the same reference.
  let probe: unknown = object;
  for (let i = 0; i < segments.length; i += 1) {
    if (!exists(probe, segments[i])) return object;
    probe = (probe as Record<PropertyKey, unknown>)[segments[i]];
  }

  const root = copyContainer(object) as Record<PropertyKey, unknown>;
  let cursor: Record<PropertyKey, unknown> = root;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    cursor[segment] = copyContainer(cursor[segment]);
    cursor = cursor[segment] as Record<PropertyKey, unknown>;
  }

  const leaf = segments[segments.length - 1];
  if (Array.isArray(cursor)) (cursor as unknown[]).splice(Number(leaf), 1);
  else delete cursor[leaf];

  return root as T;
}

export default unset;
