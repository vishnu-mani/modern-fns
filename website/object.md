---
title: "JavaScript Object Utilities — get, set, deepMerge, deepClone, isEqual"
description: "Safe nested property access and immutable updates for JavaScript and TypeScript: get, set, has, unset, pick, omit, deepClone, deepMerge, isEqual, flattenObject."
head:
  - - meta
    - name: keywords
      content: "javascript object utilities, lodash get alternative, deep clone javascript, immutable set"
  - - meta
    - property: og:title
      content: "JavaScript Object Utilities — get, set, deepMerge, deepClone, isEqual"
  - - meta
    - property: og:description
      content: "Safe nested property access and immutable updates for JavaScript and TypeScript: get, set, has, unset, pick, omit, deepClone, deepMerge, isEqual, flattenObject."
  - - meta
    - property: og:type
      content: article
---

<!-- Generated from docs/object.md by scripts/sync-docs.mjs. Edit that file, not this one. -->

# JavaScript object utilities

_The `object` module of [modern-fns](/), a dependency-free JavaScript and TypeScript
utility library._
```ts
import { get, set, deepMerge, isEqual } from 'modern-fns';
import set from 'modern-fns/object/set';
```

Path-based access, immutable updates and structural comparison.

## Path syntax

Every path-taking function accepts the same two forms:

| Form          | Example                                                           |
| ------------- | ----------------------------------------------------------------- |
| String        | `'user.address.city'`, `'users[0].email'`, `"data['dotted.key']"` |
| Segment array | `['users', 0, 'email']`                                           |

Bracketed integers become array indices; quoted segments allow keys containing `.` or `[`.
Parsed paths are cached, so repeated access in a render loop is cheap.

> **Prototype safety** — `set` and `unset` reject paths containing `__proto__`, `constructor` or
> `prototype` and return the input unchanged, so a path from user input cannot pollute
> `Object.prototype`.

---

### `get(object, path, defaultValue?)`

Read a nested value without optional-chaining chains.

```ts
function get<T = unknown>(object: unknown, path: Path, defaultValue?: T): T | undefined;
```

| Parameter      | Type                             | Description                                                   |
| -------------- | -------------------------------- | ------------------------------------------------------------- |
| `object`       | `unknown`                        | Any value, including `null`.                                  |
| `path`         | `string \| (string \| number)[]` | Property path.                                                |
| `defaultValue` | `T`                              | Returned when the path is missing or resolves to `undefined`. |

```ts
get(user, 'company.address.city');
get(data, 'users[0].email', 'n/a');
get(data, ['users', 0, 'email']);
```

**Edge cases** — walks arrays, plain objects, strings (`get('abc', 'length')` is `3`) and `Map`
instances. A stored `null` is returned as `null`, **not** replaced by the default; only
`undefined` triggers the default. An empty path returns the object itself. Never throws.

**TypeScript** — `get<string>(user, 'name')` returns `string | undefined`; passing a default
narrows away the `undefined`.

---

### `set(object, path, value)`

Immutably write a nested value.

```ts
function set<T>(object: T, path: Path, value: unknown): T;
```

```ts
const original = { user: { name: 'John' } };
const updated = set(original, 'user.name', 'Vishnu');
updated.user.name; // 'Vishnu'
original.user.name; // 'John' — untouched
```

**Edge cases** — every container on the path is copied; untouched branches keep their original
reference, so `===` checks and Vue/React change detection stay cheap. Missing containers are
created: an array when the next segment is a numeric index, otherwise an object. A primitive in
the path is replaced by a container. An empty path returns `value`. Forbidden keys make the call
a no-op.

**TypeScript** — the return type matches the input type. When the write adds a key the type does
not know about, annotate the result.

---

### `unset(object, path)`

Immutably remove a path.

```ts
function unset<T>(object: T, path: Path): T;
```

```ts
unset({ a: { b: 1, c: 2 } }, 'a.b'); // { a: { c: 2 } }
unset({ list: [1, 2, 3] }, 'list[1]'); // { list: [1, 3] }
```

**Edge cases** — returns the **same reference** when the path does not exist, so it is safe to
call unconditionally and cheap to compare. Removing an array index splices it out rather than
leaving a hole. Forbidden keys are a no-op.

---

### `has(object, path)`

```ts
function has(object: unknown, path: Path): boolean;
```

```ts
has({ a: { b: undefined } }, 'a.b'); // true
has({ a: {} }, 'a.b'); // false
has({ list: [1] }, 'list[0]'); // true
```

**Edge cases** — distinguishes "absent" from "present and `undefined`", which
`get(...) !== undefined` cannot. Inherited properties do not count (`has({}, 'toString')` is
`false`). Out-of-range and negative array indices are `false`. `Map` keys are supported.

---

### `pick(object, paths)` / `omit(object, paths)`

```ts
function pick<T extends object, K extends keyof T>(object: T, paths: readonly K[]): Pick<T, K>;
function omit<T extends object, K extends keyof T>(object: T, paths: readonly K[]): Omit<T, K>;
```

```ts
pick(user, ['id', 'name']);
pick(user, ['id', 'address.city']); // { id, address: { city } }
omit(user, ['password', 'token']);
omit(form, ['meta.internalId']);
```

**Edge cases** — `pick` **skips absent keys** rather than adding `undefined`, so the result is
safe to spread into a `PATCH` body. Dotted paths rebuild the nested shape. Both are immutable;
`omit` on an array removes by index and re-indexes. Nullish input returns `{}`.

**TypeScript** — with literal key arrays, `Pick`/`Omit` are inferred exactly. With dotted paths
the result widens to `Partial<T>`.

---

### `deepClone(value)`

Structural deep clone with no dependencies and no `structuredClone` requirement.

```ts
function deepClone<T>(value: T): T;
```

```ts
const copy = deepClone(state);
copy.a.b.c = 1; // state untouched
```

**Edge cases** — handles plain objects, arrays, `Date`, `RegExp` (including `lastIndex`), `Map`,
`Set`, typed arrays, `ArrayBuffer` and circular references. Class instances keep their prototype
and own enumerable properties. Functions, symbols and primitives are returned as-is. Non-enumerable
and getter-only properties are not copied.

**Versus `structuredClone`** — this clones functions by reference instead of throwing, preserves
prototypes, and works in every environment including older Safari and edge runtimes.

---

### `deepMerge(...objects)` / `deepMergeWith(options, ...objects)`

Recursively merge plain objects into a new object; later sources win.

```ts
function deepMerge<A extends object, B extends object>(a: A, b: B): Omit<A, keyof B> & B;
function deepMergeWith(options: DeepMergeOptions, ...objects: object[]): Record<string, unknown>;

interface DeepMergeOptions {
  arrays?: 'replace' | 'concat' | 'merge'; // default 'replace'
  skipUndefined?: boolean; // default true
}
```

```ts
deepMerge({ a: { b: 1, c: 2 } }, { a: { c: 3 } }); // { a: { b: 1, c: 3 } }
deepMergeWith({ arrays: 'concat' }, { l: [1] }, { l: [2] }); // { l: [1, 2] }
```

**Edge cases** — only **plain objects** merge recursively; `Date`, `Map`, class instances and (by
default) arrays are atomic values, which is what config merging wants. `undefined` source values
do not overwrite unless `skipUndefined: false`. `__proto__` and `constructor` keys are skipped.
Nullish and non-object sources are ignored. Nothing is mutated.

**TypeScript** — overloads cover two, three and four objects with a proper intersection; beyond
that the result is `Record<string, unknown>`.

---

### `mapValues(object, iteratee)` / `mapKeys(object, iteratee)`

The object equivalents of `Array.prototype.map`.

```ts
function mapValues<T extends object, R>(
  object: T,
  iteratee: (value: T[keyof T], key: string, object: T) => R,
): { [K in keyof T]: R };

function mapKeys<T extends object>(
  object: T,
  iteratee: (key: string, value: T[keyof T], object: T) => PropertyKey,
): Record<string, T[keyof T]>;
```

```ts
mapValues({ a: 1, b: 2 }, (n) => n * 2); // { a: 2, b: 4 }
mapKeys({ first_name: 'Vishnu' }, camelCase); // { firstName: 'Vishnu' }
```

**Edge cases** — own enumerable string keys only. Colliding keys from `mapKeys` overwrite, last
one wins. Nullish input returns `{}`. Neither mutates.

---

### `isEqual(a, b)`

Deep structural equality.

```ts
function isEqual(a: unknown, b: unknown): boolean;
```

```ts
isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }); // true
isEqual(new Date(0), new Date(0)); // true
isEqual(NaN, NaN); // true
```

**Edge cases** — SameValueZero (`NaN` equals `NaN`, `0` equals `-0`). `Date`, `RegExp`, `Error`,
`Map`, `Set`, typed arrays compare by content; `Map` keys that are structurally equal match.
Objects must share a prototype and have the same own enumerable keys, so `{ a: 1 }` does not equal
`{ a: 1, b: undefined }`. Circular structures are handled. Functions compare by reference.

---

### `isEmpty(value)`

Re-exported from [`value/isEmpty`](./value.md#isemptyvalue) — the same function, so
`object.isEmpty === value.isEmpty`.

---

### `flattenObject(object, options?)` / `unflattenObject(object, options?)`

```ts
function flattenObject(
  object: object,
  options?: { delimiter?: string; arrays?: boolean; prefix?: string },
): Record<string, unknown>;

function unflattenObject(
  object: Record<string, unknown>,
  options?: { delimiter?: string },
): Record<string, unknown>;
```

```ts
flattenObject({ user: { name: 'V', tags: ['a'] } });
// { 'user.name': 'V', 'user.tags[0]': 'a' }

unflattenObject({ 'user.name': 'V', 'user.tags[0]': 'a' });
// { user: { name: 'V', tags: ['a'] } }
```

**Edge cases** — empty objects and arrays survive as leaf values so the pair round-trips.
`arrays: false` keeps arrays as single values. Numeric bracket segments rebuild arrays;
everything else rebuilds objects. Nullish input returns `{}`.

**Use it for** — translation files, `FormData` payloads, flat diff tables, dot-notation form
libraries and validation error maps.

