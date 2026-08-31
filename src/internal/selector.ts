/** Internal `keyof T | ((item: T) => R)` normaliser used across the `array` module. */

import type { Selector } from '../types.js';

/** Turn a selector into a plain function. */
export function toSelectorFn<T, R = PropertyKey>(selector: Selector<T, R>): (item: T) => R {
  if (typeof selector === 'function') return selector;
  const key = selector as unknown as keyof T;
  return (item: T): R => (item == null ? (undefined as R) : (item[key] as unknown as R));
}
