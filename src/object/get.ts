import { parsePath } from '../internal/path.js';
import type { Path } from '../types.js';

/**
 * Read a deeply nested value without optional-chaining gymnastics.
 *
 * Walks arrays, plain objects and `Map` instances. Returns `defaultValue` when any segment is
 * missing **or** when the resolved value is `undefined` (a stored `null` is returned as `null`).
 *
 * @example
 * get(user, 'company.address.city');
 * get(data, 'users[0].email', 'n/a');
 * get(data, ['users', 0, 'email']);
 */
export function get<T = unknown>(object: unknown, path: Path, defaultValue?: T): T | undefined {
  const segments = parsePath(path);
  let current: unknown = object;

  for (const segment of segments) {
    if (current == null) return defaultValue;
    if (current instanceof Map) {
      current = current.has(segment) ? current.get(segment) : current.get(String(segment));
      continue;
    }
    if (
      typeof current !== 'object' &&
      typeof current !== 'string' &&
      typeof current !== 'function'
    ) {
      return defaultValue;
    }
    current = (current as Record<PropertyKey, unknown>)[segment];
  }

  return current === undefined ? defaultValue : (current as T);
}

export default get;
