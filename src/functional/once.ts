/**
 * Run a function at most once; later calls return the first result.
 *
 * The canonical guard for lazy initialisation (analytics, a WebSocket, a config fetch) that
 * must not run twice under React strict mode, HMR or double-mounted components.
 *
 * @remarks If the first call throws, the error is **not** cached — the next call retries.
 *
 * @example
 * const init = once(() => expensiveSetup());
 * init(); init(); // expensiveSetup ran once
 */
export function once<T extends (...args: never[]) => unknown>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;
  return function onceWrapper(this: unknown, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      result = fn.apply(this, args) as ReturnType<T>;
      called = true;
    }
    return result;
  } as unknown as T;
}
export default once;
