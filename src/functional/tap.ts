/**
 * Run a side effect on a value and return the value unchanged — logging or instrumenting a
 * pipeline without breaking it.
 *
 * @remarks `tap` deliberately runs your callback; if that callback mutates the value, `tap`
 * will not stop it. Keep the callback side-effect-only.
 *
 * @example
 * const total = pipe(getItems, (items) => tap(items, console.log), sum)(cart);
 */
export function tap<T>(value: T, callback: (value: T) => void): T {
  callback(value);
  return value;
}
export default tap;
