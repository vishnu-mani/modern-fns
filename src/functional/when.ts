/**
 * Return a value only when a condition holds — a conditional expression that reads left to
 * right and stays lazy.
 *
 * The condition may be a boolean or a predicate; the branches may be values or thunks, so
 * expensive branches are only evaluated when taken.
 *
 * @example
 * const attrs = { ...base, ...when(isDisabled, { 'aria-disabled': 'true' }, {}) };
 * when(user.isAdmin, () => buildAdminMenu());       // menu or undefined
 * when(count > 0, `${count} items`, 'Empty');
 */
export function when<T>(condition: unknown, valueOrFn: T | (() => T)): T | undefined;
export function when<T, F>(
  condition: unknown,
  valueOrFn: T | (() => T),
  otherwise: F | (() => F),
): T | F;
export function when<T, F>(
  condition: unknown,
  valueOrFn: T | (() => T),
  otherwise?: F | (() => F),
): T | F | undefined {
  const truthy =
    typeof condition === 'function' ? Boolean((condition as () => unknown)()) : Boolean(condition);
  if (truthy) return typeof valueOrFn === 'function' ? (valueOrFn as () => T)() : valueOrFn;
  return typeof otherwise === 'function' ? (otherwise as () => F)() : otherwise;
}
export default when;
