import { isPlainObject } from '../internal/types.js';

/**
 * `true` for plain objects only — `{}`, object literals and `Object.create(null)`.
 *
 * Arrays, `null`, `Date`, `Map`, `Set`, class instances and functions all return `false`,
 * which is what "is this a data bag I can iterate?" actually means.
 *
 * @example
 * isObject({});        // true
 * isObject([]);        // false
 * isObject(new Date()) // false
 * isObject(null);      // false
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value);
}
export default isObject;
