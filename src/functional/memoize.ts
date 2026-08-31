/** Options for {@link memoize}. */
export interface MemoizeOptions<T extends (...args: never[]) => unknown> {
  /** Build the cache key. Default: the single argument itself, or `JSON.stringify(args)`. */
  resolver?: (...args: Parameters<T>) => unknown;
  /** Evict the oldest entry beyond this size. Default: unbounded. */
  maxSize?: number;
}

/** A memoized function with an exposed cache. */
export type Memoized<T extends (...args: never[]) => unknown> = T & {
  /** The underlying cache — inspect it, or `clear()` it when inputs change. */
  cache: Map<unknown, ReturnType<T>>;
};

/**
 * Cache a pure function's results by its arguments.
 *
 * Single-argument functions key on the argument itself (so object arguments are keyed by
 * reference — fast and leak-free with `maxSize`). Multi-argument calls key on
 * `JSON.stringify(args)`; pass a `resolver` when that is wrong for your types.
 *
 * @remarks Only memoize **pure** functions. Rejected promises are cached too — clear the entry
 * yourself if you want retries.
 *
 * @example
 * const slugCache = memoize(slugify);
 * slugCache('Hello World'); // computed
 * slugCache('Hello World'); // cached
 *
 * @example Bounded LRU-ish cache
 * const fmt = memoize(formatCurrency, { maxSize: 100 });
 * fmt.cache.clear();
 */
export function memoize<T extends (...args: never[]) => unknown>(
  fn: T,
  options: MemoizeOptions<T> = {},
): Memoized<T> {
  const { resolver, maxSize } = options;
  const cache = new Map<unknown, ReturnType<T>>();

  const memoized = function memoizedWrapper(this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : args.length === 1 ? args[0] : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as ReturnType<T>;

    const result = fn.apply(this, args) as ReturnType<T>;
    cache.set(key, result);
    if (maxSize !== undefined && cache.size > maxSize) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }
    return result;
  } as unknown as Memoized<T>;

  memoized.cache = cache;
  return memoized;
}
export default memoize;
