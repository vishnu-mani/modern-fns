import { pipe } from './pipe.js';

/**
 * Compose functions right to left: `compose(a, b, c)(x)` is `a(b(c(x)))` — the mathematical
 * order. Async-aware, exactly like {@link pipe}.
 *
 * Use `pipe` for data-flow readability; use `compose` when mirroring mathematical notation or
 * porting existing FP code.
 *
 * @example
 * const shout = compose((s: string) => `${s}!`, (s: string) => s.toUpperCase());
 * shout('hey'); // 'HEY!'
 */
export function compose<A extends unknown[], B>(f1: (...args: A) => B): (...args: A) => B;
export function compose<A extends unknown[], B, C>(
  f2: (b: Awaited<B>) => C,
  f1: (...args: A) => B,
): (...args: A) => B extends PromiseLike<unknown> ? Promise<Awaited<C>> : C;
export function compose<A extends unknown[], B, C, D>(
  f3: (c: Awaited<C>) => D,
  f2: (b: Awaited<B>) => C,
  f1: (...args: A) => B,
): (...args: A) => B | C extends PromiseLike<unknown> ? Promise<Awaited<D>> : D;
export function compose(...fns: Array<(value: never) => unknown>): (...args: unknown[]) => unknown;
export function compose(...fns: Array<(value: never) => unknown>): (...args: unknown[]) => unknown {
  return pipe(...fns.slice().reverse());
}
export default compose;
