/** `true` for anything callable, including classes, generators and async functions. */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}
export default isFunction;
