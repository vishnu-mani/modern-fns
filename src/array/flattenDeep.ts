import type { NestedArray } from '../types.js';

/**
 * Flatten every level of nesting, however deep.
 *
 * Iterative, so it cannot blow the call stack on deeply nested input.
 *
 * @example
 * flattenDeep([1, [2, [3, [4, [5]]]]]); // [1, 2, 3, 4, 5]
 */
export function flattenDeep<T>(array: NestedArray<T> | readonly unknown[]): T[] {
  if (!Array.isArray(array)) return [];
  const result: T[] = [];
  const stack: unknown[] = [...array];
  while (stack.length > 0) {
    const item = stack.shift();
    if (Array.isArray(item)) stack.unshift(...(item as unknown[]));
    else result.push(item as T);
  }
  return result;
}

export default flattenDeep;
