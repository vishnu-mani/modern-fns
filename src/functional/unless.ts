import { when } from './when.js';

/**
 * The inverse of {@link when}: return the value only when the condition is falsy.
 *
 * @example
 * unless(isLoggedIn, () => renderLoginPrompt());
 * unless(items.length, 'No results', `${items.length} results`);
 */
export function unless<T>(condition: unknown, valueOrFn: T | (() => T)): T | undefined;
export function unless<T, F>(
  condition: unknown,
  valueOrFn: T | (() => T),
  otherwise: F | (() => F),
): T | F;
export function unless<T, F>(
  condition: unknown,
  valueOrFn: T | (() => T),
  otherwise?: F | (() => F),
): T | F | undefined {
  const truthy =
    typeof condition === 'function' ? Boolean((condition as () => unknown)()) : Boolean(condition);
  return when(!truthy, valueOrFn, otherwise as F | (() => F));
}
export default unless;
