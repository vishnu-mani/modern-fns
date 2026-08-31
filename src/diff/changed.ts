import { diff, type DiffOptions } from './diff.js';

/**
 * Has anything changed? Short-circuits on the first difference, so it is the cheap check for
 * "is this form dirty?" / "should I enable Save?".
 *
 * @example
 * const isDirty = changed(pristine, form);
 * const isDirtyIgnoringMeta = changed(pristine, form, {
 *   ignore: (path) => path.startsWith('meta.'),
 * });
 */
export function changed(oldObject: unknown, newObject: unknown, options?: DiffOptions): boolean {
  return diff(oldObject, newObject, options).length > 0;
}

export default changed;
