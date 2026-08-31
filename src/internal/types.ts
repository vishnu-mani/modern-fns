/** Internal runtime type helpers. Not part of the public API. */

/** Objects that are safe to treat as records: `{}` literals and `Object.create(null)`. */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  if (proto === null) return true;
  if (proto !== Object.prototype) return false;
  return !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}

/** `Object.prototype.toString` tag, e.g. `"Date"`, `"Map"`, `"RegExp"`. */
export function tagOf(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1);
}

/** Own-property check that works on objects with a null prototype, and on Node 16. */
export function hasOwn(target: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(target, key);
}

/** Keys that must never be written through a user-supplied path (prototype-pollution guard). */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** `true` when a path segment is unsafe to write. */
export function isForbiddenKey(key: string | number): boolean {
  return typeof key === 'string' && FORBIDDEN_KEYS.has(key);
}

/** SameValueZero: like `===` but `NaN` equals `NaN`. */
export function sameValueZero(a: unknown, b: unknown): boolean {
  return a === b || (a !== a && b !== b);
}
