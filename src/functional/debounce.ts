/** Options for {@link debounce}. */
export interface DebounceOptions {
  /** Invoke on the leading edge of the wait window. Default `false`. */
  leading?: boolean;
  /** Invoke on the trailing edge. Default `true`. */
  trailing?: boolean;
  /** Invoke at least once every `maxWait` ms while calls keep arriving. */
  maxWait?: number;
}

/** A debounced function with lifecycle controls. */
export interface Debounced<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  /** Drop the pending call. Always call this on unmount. */
  cancel(): void;
  /** Run the pending call immediately and return its result. */
  flush(): ReturnType<T> | undefined;
  /** Is a call currently pending? */
  pending(): boolean;
}

/**
 * Delay invocation until `wait` ms have passed without another call — search-as-you-type,
 * autosave, resize handlers.
 *
 * Returns the controls you actually need: `cancel()` (call it in `onUnmounted` /
 * `useEffect` cleanup to avoid setting state on a dead component), `flush()` (fire now, e.g.
 * on form submit) and `pending()`.
 *
 * @remarks The returned function is stateful by design — that is the point of debouncing.
 * Create one per component instance, not one per render.
 *
 * @example
 * const search = debounce((q: string) => void fetchResults(q), 300);
 * input.addEventListener('input', (e) => search(e.target.value));
 * onUnmounted(() => search.cancel());
 *
 * @example Guarantee progress during continuous typing
 * const save = debounce(persist, 500, { maxWait: 2000 });
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  wait = 0,
  options: DebounceOptions = {},
): Debounced<T> {
  const { leading = false, trailing = true, maxWait } = options;

  let timer: ReturnType<typeof setTimeout> | undefined;
  let maxTimer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: ReturnType<T> | undefined;

  const clearTimers = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    if (maxTimer !== undefined) clearTimeout(maxTimer);
    timer = undefined;
    maxTimer = undefined;
  };

  const invoke = (): ReturnType<T> | undefined => {
    if (lastArgs === undefined) return result;
    const args = lastArgs;
    const context = lastThis;
    lastArgs = undefined;
    lastThis = undefined;
    result = fn.apply(context, args) as ReturnType<T>;
    return result;
  };

  const debounced = function debouncedWrapper(
    this: unknown,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined {
    lastArgs = args;
    // The deferred call must run with the receiver the caller used, e.g. `element.onScroll()`.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this;

    const isFirstCall = timer === undefined;
    if (timer !== undefined) clearTimeout(timer);

    if (isFirstCall && leading) invoke();

    timer = setTimeout(() => {
      timer = undefined;
      if (maxTimer !== undefined) {
        clearTimeout(maxTimer);
        maxTimer = undefined;
      }
      if (trailing && lastArgs !== undefined) invoke();
    }, wait);

    if (maxWait !== undefined && maxTimer === undefined) {
      maxTimer = setTimeout(() => {
        maxTimer = undefined;
        if (timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;
        }
        if (lastArgs !== undefined) invoke();
      }, maxWait);
    }

    return result;
  } as Debounced<T>;

  debounced.cancel = (): void => {
    clearTimers();
    lastArgs = undefined;
    lastThis = undefined;
  };
  debounced.flush = (): ReturnType<T> | undefined => {
    clearTimers();
    return invoke();
  };
  debounced.pending = (): boolean => timer !== undefined || maxTimer !== undefined;

  return debounced;
}
export default debounce;
