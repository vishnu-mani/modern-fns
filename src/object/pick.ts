import { hasOwn } from '../internal/types.js';
import { get } from './get.js';
import { set } from './set.js';
import type { Path } from '../types.js';

/**
 * Keep only the listed keys. Absent keys are skipped rather than set to `undefined`, so the
 * result is safe to spread into a PATCH body.
 *
 * Dotted paths are supported and rebuild the nested shape.
 *
 * @example
 * pick(user, ['id', 'name']);
 * pick(user, ['id', 'address.city']); // { id, address: { city } }
 */
export function pick<T extends object, K extends keyof T>(
  object: T,
  paths: readonly K[],
): Pick<T, K>;
export function pick<T extends object>(object: T, paths: readonly Path[]): Partial<T>;
export function pick<T extends object>(object: T, paths: readonly Path[]): Partial<T> {
  if (object == null || typeof object !== 'object') return {};
  let result = {} as Partial<T>;
  for (const path of paths) {
    if (typeof path === 'string' && !/[.[]/.test(path)) {
      if (hasOwn(object, path)) result[path as keyof T] = object[path as keyof T];
      continue;
    }
    const value = get(object, path);
    if (value !== undefined) result = set(result, path, value);
  }
  return result;
}

export default pick;
