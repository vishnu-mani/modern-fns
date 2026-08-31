import { debounce, type Debounced, type DebounceOptions } from './debounce.js';

/**
 * Invoke at most once per `wait` ms — scroll, pointermove, progress events.
 *
 * Implemented as a debounce with `maxWait === wait`, so it also gives you `cancel()`,
 * `flush()` and `pending()`. Leading-edge by default, so the first event is not delayed.
 *
 * @example
 * const onScroll = throttle(() => updateHeader(), 100);
 * window.addEventListener('scroll', onScroll, { passive: true });
 * onUnmounted(() => onScroll.cancel());
 */
export function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  wait = 0,
  options: Omit<DebounceOptions, 'maxWait'> = {},
): Debounced<T> {
  const { leading = true, trailing = true } = options;
  return debounce(fn, wait, { leading, trailing, maxWait: wait });
}
export default throttle;
