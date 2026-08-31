/**
 * First value that is neither `null` nor `undefined`, or `undefined` if there is none.
 *
 * A variadic `??` that works with arrays and spread arguments.
 *
 * @example
 * coalesce(user.nickname, user.firstName, 'Anonymous');
 * coalesce(...fallbacks);
 */
export function coalesce<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value != null) return value;
  }
  return undefined;
}
export default coalesce;
