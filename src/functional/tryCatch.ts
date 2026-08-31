/**
 * Run a function and return a fallback instead of throwing.
 *
 * The fix for the `JSON.parse` / `localStorage` / `new URL()` try-catch blocks that clutter
 * every codebase. The fallback may be a value or a function receiving the error.
 *
 * @example
 * const config = tryCatch(() => JSON.parse(raw), {});
 * const port   = tryCatch(() => new URL(input).port, (err) => { log(err); return '80'; });
 * tryCatch(() => risky());        // undefined on failure
 */
export function tryCatch<T>(fn: () => T): T | undefined;
export function tryCatch<T, F>(fn: () => T, fallback: F | ((error: unknown) => F)): T | F;
export function tryCatch<T, F>(
  fn: () => T,
  fallback?: F | ((error: unknown) => F),
): T | F | undefined {
  try {
    return fn();
  } catch (error) {
    return typeof fallback === 'function' ? (fallback as (error: unknown) => F)(error) : fallback;
  }
}
export default tryCatch;
