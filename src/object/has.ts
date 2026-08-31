import { parsePath } from '../internal/path.js';
import { hasOwn } from '../internal/types.js';
import type { Path } from '../types.js';

/**
 * Does a path exist? Unlike `get(...) !== undefined`, this distinguishes "absent" from
 * "present and set to `undefined`".
 *
 * @example
 * has({ a: { b: undefined } }, 'a.b'); // true
 * has({ a: {} }, 'a.b');               // false
 * has({ list: [1] }, 'list[0]');       // true
 */
export function has(object: unknown, path: Path): boolean {
  const segments = parsePath(path);
  if (segments.length === 0) return object !== undefined;
  let current: unknown = object;

  for (const segment of segments) {
    if (current == null) return false;
    if (current instanceof Map) {
      if (!current.has(segment) && !current.has(String(segment))) return false;
      current = current.has(segment) ? current.get(segment) : current.get(String(segment));
      continue;
    }
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) return false;
      current = current[index];
      continue;
    }
    if (typeof current !== 'object') return false;
    if (!hasOwn(current, segment)) return false;
    current = (current as Record<PropertyKey, unknown>)[segment];
  }

  return true;
}

export default has;
