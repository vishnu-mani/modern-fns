type Fn = (value: never) => unknown;

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return value != null && typeof (value as PromiseLike<unknown>).then === 'function';
}

/**
 * Compose functions left to right: `pipe(a, b, c)(x)` is `c(b(a(x)))`.
 *
 * **Async-aware:** if any step returns a promise, the rest of the chain is awaited
 * automatically and the pipeline returns a promise. A fully synchronous pipeline stays
 * synchronous — no accidental microtask, no `await` where none is needed.
 *
 * @example
 * const normalizeUsername = pipe(
 *   (s: string) => s.trim(),
 *   (s: string) => s.toLowerCase(),
 *   removeSpaces,
 *   (s: string) => truncate(s, 20),
 * );
 * normalizeUsername('  Vishnu M  '); // 'vishnum'
 *
 * @example Async steps
 * const loadUser = pipe(fetchUser, (r: Response) => r.json(), (u: User) => u.name);
 * await loadUser('/api/me');
 */
export function pipe<A extends unknown[], B>(f1: (...args: A) => B): (...args: A) => B;
export function pipe<A extends unknown[], B, C>(
  f1: (...args: A) => B,
  f2: (b: Awaited<B>) => C,
): (...args: A) => B extends PromiseLike<unknown> ? Promise<Awaited<C>> : C;
export function pipe<A extends unknown[], B, C, D>(
  f1: (...args: A) => B,
  f2: (b: Awaited<B>) => C,
  f3: (c: Awaited<C>) => D,
): (...args: A) => B | C extends PromiseLike<unknown> ? Promise<Awaited<D>> : D;
export function pipe<A extends unknown[], B, C, D, E>(
  f1: (...args: A) => B,
  f2: (b: Awaited<B>) => C,
  f3: (c: Awaited<C>) => D,
  f4: (d: Awaited<D>) => E,
): (...args: A) => B | C | D extends PromiseLike<unknown> ? Promise<Awaited<E>> : E;
export function pipe<A extends unknown[], B, C, D, E, F>(
  f1: (...args: A) => B,
  f2: (b: Awaited<B>) => C,
  f3: (c: Awaited<C>) => D,
  f4: (d: Awaited<D>) => E,
  f5: (e: Awaited<E>) => F,
): (...args: A) => B | C | D | E extends PromiseLike<unknown> ? Promise<Awaited<F>> : F;
export function pipe(...fns: Fn[]): (...args: unknown[]) => unknown;
export function pipe(...fns: Fn[]): (...args: unknown[]) => unknown {
  return (...args: unknown[]): unknown => {
    if (fns.length === 0) return args[0];
    let result: unknown = (fns[0] as (...a: unknown[]) => unknown)(...args);

    for (let i = 1; i < fns.length; i += 1) {
      const next = fns[i] as (value: unknown) => unknown;
      if (isThenable(result)) {
        const remaining = fns.slice(i) as Array<(value: unknown) => unknown>;
        return remaining.reduce<PromiseLike<unknown>>(
          (promise, fn) => Promise.resolve(promise).then(fn),
          result,
        );
      }
      result = next(result);
    }
    return result;
  };
}
export default pipe;
