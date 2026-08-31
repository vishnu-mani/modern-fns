/**
 * Shared public types.
 *
 * @module types
 */

/** A property path, either dotted/bracketed string form or an explicit segment list. */
export type Path = string | ReadonlyArray<string | number>;

/** Anything that can be produced by `JSON.parse`. */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** A plain object with unknown values. */
export type PlainObject = Record<string, unknown>;

/**
 * A selector accepts either a property name or a mapping function. Every `modern-fns`
 * function that groups, sorts, indexes or de-duplicates accepts this shape.
 */
export type Selector<T, R = PropertyKey> = (T extends object ? keyof T : never) | ((item: T) => R);

/** Sort direction used by {@link orderBy}. */
export type SortDirection = 'asc' | 'desc';

/** An arbitrarily nested array. */
export type NestedArray<T> = Array<T | NestedArray<T>>;

/** A single structural change produced by the `diff` module. */
export type Change =
  | { path: string; type: 'added'; newValue: unknown }
  | { path: string; type: 'removed'; oldValue: unknown }
  | { path: string; type: 'changed'; oldValue: unknown; newValue: unknown };

/** The kind of a {@link Change}. */
export type ChangeType = Change['type'];

/** Any function. */
export type AnyFunction = (...args: never[]) => unknown;
