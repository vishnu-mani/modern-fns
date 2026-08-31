import { set } from './set.js';
import { parsePath } from '../internal/path.js';
import type { FlattenOptions } from './flattenObject.js';

/**
 * Rebuild nested structures from flat `path -> value` records — the inverse of
 * {@link flattenObject}.
 *
 * Numeric bracket segments produce arrays; everything else produces objects.
 *
 * @example
 * unflattenObject({ 'user.name': 'V', 'user.tags[0]': 'a' });
 * // { user: { name: 'V', tags: ['a'] } }
 */
export function unflattenObject(
  object: Record<string, unknown>,
  options: Pick<FlattenOptions, 'delimiter'> = {},
): Record<string, unknown> {
  const { delimiter = '.' } = options;
  let result: Record<string, unknown> = {};
  if (object == null || typeof object !== 'object') return result;

  for (const key of Object.keys(object)) {
    const segments =
      delimiter === '.' ? parsePath(key) : key.split(delimiter).flatMap((part) => parsePath(part));
    result = set(result, segments, object[key]);
  }
  return result;
}

export default unflattenObject;
