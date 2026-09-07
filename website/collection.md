---
title: "JavaScript Collection Utilities — one API for arrays, objects, Map and Set"
description: "Iterate arrays, plain objects, Map, Set and iterables with one consistent API: size, first, last, each, map, filter, find, some, every. map and filter preserve the container type."
head:
  - - meta
    - name: keywords
      content: "iterate object javascript, map over object, javascript collection utilities"
  - - meta
    - property: og:title
      content: "JavaScript Collection Utilities — one API for arrays, objects, Map and Set"
  - - meta
    - property: og:description
      content: "Iterate arrays, plain objects, Map, Set and iterables with one consistent API: size, first, last, each, map, filter, find, some, every. map and filter preserve the container type."
  - - meta
    - property: og:type
      content: article
---

<!-- Generated from docs/collection.md by scripts/sync-docs.mjs. Edit that file, not this one. -->

# JavaScript collection utilities

_The `collection` module of [modern-fns](/), a dependency-free JavaScript and TypeScript
utility library._
```ts
import { size, map, filter, each } from 'modern-fns';
import size from 'modern-fns/collection/size';
```

One signature for every container: arrays, plain objects, `Map`, `Set`, strings and any iterable.
This module exists **only** where that unification is worth it — there is no `collection/reduce`,
no `collection/sort` and no re-implementation of `Array.prototype`.

`map` and `filter` **preserve the container type**: objects stay objects, `Map`s stay `Map`s,
`Set`s stay `Set`s. Strings, iterables and class instances produce arrays.

The iteratee always receives `(value, key, collection)`, where `key` is the property name for
objects, the index for arrays, strings and sets, and the real key for `Map`s.

---

### `size(value)`

```ts
function size(value: Collection): number;
```

```ts
size([1, 2, 3]); // 3
size({ a: 1, b: 2 }); // 2
size(new Set([1, 1, 2])); // 2
size('héllo'); // 5
size('😀😀'); // 2 — counted by code point
size(null); // 0
```

**Why** — `.length`, `.size` and `Object.keys().length` are three different answers to one
question, and only one of them is right for any given value.

---

### `first(value)` / `last(value)`

```ts
first({ a: 1, b: 2 }); // 1
last(
  new Map([
    ['a', 1],
    ['b', 2],
  ]),
); // 2
first([]); // undefined
```

**Edge cases** — iteration order is the container's own (insertion order for objects, except
integer-like keys). Empty or nullish input returns `undefined`.

---

### `isEmpty(value)`

Re-exported from [`value/isEmpty`](./value.md#isemptyvalue).

---

### `each(value, iteratee)`

```ts
function each<T>(value: Collection<T>, iteratee: (value: T, key, collection) => unknown): void;
```

```ts
each({ a: 1, b: 2 }, (value, key) => console.log(key, value));
each(bigList, (item) => (item.id === target ? false : undefined)); // early exit
```

**Edge cases** — returning `false` (strictly) stops the loop — the thing
`Array.prototype.forEach` cannot do. Any other return value, including `undefined`, continues.

---

### `map(value, iteratee)`

```ts
map([1, 2], (n) => n * 2); // [2, 4]
map({ a: 1, b: 2 }, (n) => n * 2); // { a: 2, b: 4 }
map(new Map([['a', 1]]), (n) => n + 1); // Map { 'a' => 2 }
map(new Set([1, 2]), (n) => n + 1); // Set { 2, 3 }
map({ a: 1 }, (value, key) => `${key}${value}`); // { a: 'a1' }
```

**Edge cases** — nullish input returns `[]`. Nothing is mutated. Overloads keep the input's
element and key types.

---

### `filter(value, predicate)`

```ts
filter([1, 2, 3], (n) => n > 1); // [2, 3]
filter({ a: 1, b: 2 }, (n) => n > 1); // { b: 2 }
filter(form, (value) => value !== '' && value !== null); // drop blanks before PATCH
```

**Edge cases** — object filtering keeps the original keys. `Map` filtering keeps the original
keys too. Nullish input returns `[]`.

---

### `find(value, predicate)` / `some(value, predicate)` / `every(value, predicate)`

```ts
find(users, (u) => u.isAdmin);
find({ a: 1, b: 5 }, (n) => n > 2); // 5
some({ a: 0, b: 3 }, (n) => n > 2); // true
every({ a: 1, b: 2 }, (n) => n > 0); // true
every([], () => false); // true — vacuously, like Array.prototype.every
```

**Edge cases** — all three short-circuit. `find` returns `undefined` when nothing matches.

