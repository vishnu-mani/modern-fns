import { unset } from './unset.js';
import type { Path } from '../types.js';

/**
 * Drop the listed keys, immutably. Dotted paths remove nested keys.
 *
 * @example
 * omit(user, ['password', 'token']);
 * omit(form, ['meta.internalId']);
 */
export function omit<T extends object, K extends keyof T>(
  object: T,
  paths: readonly K[],
): Omit<T, K>;
export function omit<T extends object>(object: T, paths: readonly Path[]): Partial<T>;
export function omit<T extends object>(object: T, paths: readonly Path[]): Partial<T> {
  if (object == null || typeof object !== 'object') return {};
  let result: T = Array.isArray(object) ? ([...object] as unknown as T) : { ...object };
  for (const path of paths) {
    result = unset(result, path);
  }
  return result;
}

export default omit;
