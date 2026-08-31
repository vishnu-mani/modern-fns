import { isPlainObject, tagOf } from '../internal/types.js';

/**
 * Structural deep clone with no dependencies and no `structuredClone` requirement.
 *
 * Handles plain objects, arrays, `Date`, `RegExp`, `Map`, `Set`, typed arrays, `ArrayBuffer`
 * and circular references. Class instances keep their prototype and own enumerable properties.
 * Functions, symbols and primitives are returned as-is (they are already immutable or
 * intentionally shared).
 *
 * @example
 * const copy = deepClone(state);
 * copy.a.b.c = 1; // state is untouched
 */
export function deepClone<T>(value: T): T {
  return cloneValue(value, new WeakMap<object, unknown>());
}

function cloneValue<T>(value: T, seen: WeakMap<object, unknown>): T {
  if (value === null || typeof value !== 'object') return value;

  const source = value as unknown as object;
  const existing = seen.get(source);
  if (existing !== undefined) return existing as T;

  switch (tagOf(value)) {
    case 'Date':
      return new Date((value as unknown as Date).getTime()) as unknown as T;
    case 'RegExp': {
      const re = value as unknown as RegExp;
      const copy = new RegExp(re.source, re.flags);
      copy.lastIndex = re.lastIndex;
      return copy as unknown as T;
    }
    case 'ArrayBuffer':
      return (value as unknown as ArrayBuffer).slice(0) as unknown as T;
    default:
      break;
  }

  if (ArrayBuffer.isView(value)) {
    const view = value as unknown as { constructor: new (v: unknown) => unknown };
    return new view.constructor((value as unknown as Uint8Array).slice()) as T;
  }

  if (Array.isArray(value)) {
    const copy: unknown[] = new Array((value as unknown[]).length);
    seen.set(source, copy);
    (value as unknown[]).forEach((item, index) => {
      copy[index] = cloneValue(item, seen);
    });
    return copy as unknown as T;
  }

  if (value instanceof Map) {
    const copy = new Map<unknown, unknown>();
    seen.set(source, copy);
    value.forEach((item, key) => copy.set(cloneValue(key, seen), cloneValue(item, seen)));
    return copy as unknown as T;
  }

  if (value instanceof Set) {
    const copy = new Set<unknown>();
    seen.set(source, copy);
    value.forEach((item) => copy.add(cloneValue(item, seen)));
    return copy as unknown as T;
  }

  const copy = (
    isPlainObject(value) ? {} : Object.create(Object.getPrototypeOf(source) as object | null)
  ) as Record<PropertyKey, unknown>;
  seen.set(source, copy);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (!descriptor?.enumerable) continue;
    copy[key] = cloneValue((source as Record<PropertyKey, unknown>)[key], seen);
  }
  return copy as T;
}

export default deepClone;
