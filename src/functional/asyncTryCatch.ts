/**
 * `await` a function and return a fallback instead of rejecting. Synchronous throws inside the
 * function are caught too, which a bare `.catch()` misses.
 *
 * @example
 * const user = await asyncTryCatch(() => api.getUser(id), null);
 * const list = await asyncTryCatch(() => api.list(), (err) => { report(err); return []; });
 */
export async function asyncTryCatch<T>(fn: () => T | Promise<T>): Promise<Awaited<T> | undefined>;
export async function asyncTryCatch<T, F>(
  fn: () => T | Promise<T>,
  fallback: F | ((error: unknown) => F | Promise<F>),
): Promise<Awaited<T> | F>;
export async function asyncTryCatch<T, F>(
  fn: () => T | Promise<T>,
  fallback?: F | ((error: unknown) => F | Promise<F>),
): Promise<Awaited<T> | F | undefined> {
  try {
    return await fn();
  } catch (error) {
    return typeof fallback === 'function'
      ? await (fallback as (error: unknown) => F | Promise<F>)(error)
      : fallback;
  }
}
export default asyncTryCatch;
