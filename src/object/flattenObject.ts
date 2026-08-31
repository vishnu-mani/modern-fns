import { isPlainObject } from '../internal/types.js';

/** Options shared by {@link flattenObject} and {@link unflattenObject}. */
export interface FlattenOptions {
  /** Key separator. Default `'.'`. */
  delimiter?: string;
  /** Flatten array items as `key[0]`. When `false`, arrays are kept as leaf values. Default `true`. */
  arrays?: boolean;
  /** Prefix applied to every produced key. */
  prefix?: string;
}

/**
 * Flatten nested structures into a single-level record of path -> value.
 *
 * Empty objects and empty arrays are preserved as leaves so the operation round-trips through
 * {@link unflattenObject}.
 *
 * Useful for translation files, form field names, `FormData` payloads and flat diff tables.
 *
 * @example
 * flattenObject({ user: { name: 'V', tags: ['a'] } });
 * // { 'user.name': 'V', 'user.tags[0]': 'a' }
 */
export function flattenObject(
  object: object,
  options: FlattenOptions = {},
): Record<string, unknown> {
  const { delimiter = '.', arrays = true, prefix = '' } = options;
  const result: Record<string, unknown> = {};
  if (object == null || typeof object !== 'object') return result;

  const walk = (value: unknown, path: string): void => {
    if (isPlainObject(value)) {
      const keys = Object.keys(value);
      if (keys.length === 0 && path !== '') {
        result[path] = {};
        return;
      }
      for (const key of keys) {
        walk(value[key], path === '' ? key : `${path}${delimiter}${key}`);
      }
      return;
    }
    if (arrays && Array.isArray(value)) {
      if (value.length === 0 && path !== '') {
        result[path] = [];
        return;
      }
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    result[path] = value;
  };

  walk(object, prefix);
  return result;
}

export default flattenObject;
