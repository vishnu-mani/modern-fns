---
title: 'Documentation — modern-fns API reference'
description: 'Complete API documentation for modern-fns: installation, import styles, TypeScript usage, immutability guarantees, tree-shaking and all ten utility modules.'
head:
  - - meta
    - name: keywords
      content: 'modern-fns documentation, javascript utility api, typescript utility library docs'
---

# Documentation

modern-fns is a collection of 145 small, focused utilities for JavaScript and TypeScript,
organised into ten modules. Every function is immutable, individually importable and free of
runtime dependencies.

## Installation

```bash
npm install modern-fns
```

```bash
pnpm add modern-fns
```

```bash
yarn add modern-fns
```

Requires Node 18 or newer, or any modern browser. The package ships ESM and CommonJS builds with
TypeScript declarations for both.

## Import styles

All three work. Named imports are the recommended default.

```ts
// 1. Named imports — recommended. Tree-shaking removes what you do not use.
import { chunk, groupBy, diff } from 'modern-fns';

// 2. Per-function subpath — the smallest possible surface, no barrel file involved.
import chunk from 'modern-fns/array/chunk';
import diff from 'modern-fns/diff/diff';

// 3. Namespaces — handy when names would collide with your own.
import { array, object, query } from 'modern-fns';
array.chunk([1, 2, 3], 2);
```

CommonJS works too:

```js
const { chunk } = require('modern-fns');
```

::: tip Query module naming
`query.get`, `query.set` and `query.has` are reachable through the namespace or the subpath
(`modern-fns/query/get`) only. The root barrel exports the **object** versions of those names, so
the two can never be confused.
:::

## Modules

| Module | Reference |
| --- | --- |
| Array utilities | [/array](/array) |
| Object utilities | [/object](/object) |
| Object diff | [/diff](/diff) |
| String utilities | [/string](/string) |
| Number utilities | [/number](/number) |
| URL utilities | [/url](/url) |
| Query string utilities | [/query](/query) |
| Value coercion & guards | [/value](/value) |
| Functional utilities | [/functional](/functional) |
| Collection utilities | [/collection](/collection) |

## Immutability

No exported function mutates its input. `set`, `unset`, `sortBy`, `orderBy` and every other
transform return a new value, and untouched branches keep their original reference — which is what
makes `===` change detection in Vue, React and Svelte correct and cheap.

```ts
const original = { user: { name: 'John' } };
const updated = set(original, 'user.name', 'Vishnu');

original.user.name; // 'John' — untouched
updated.user.name; // 'Vishnu'
updated === original; // false
```

The only stateful exceptions are documented as such: `debounce`, `throttle`, `memoize` and `once`
own internal state by definition, and `tap` runs a callback you supply.

## TypeScript

Types are generated from the implementation, so they never drift from runtime behaviour.

```ts
import { groupBy, get, pick } from 'modern-fns';

interface User {
  id: number;
  role: 'admin' | 'editor';
}

groupBy(users, 'role'); // Record<string, User[]>
groupBy(users, (u) => u.id); // Record<string, User[]>
pick(user, ['id']); // { id: number }
get<string>(user, 'company.address.city'); // string | undefined
```

Every selector position accepts `keyof T` or a function. There is no `any` in the public API.

## Tree shaking

The package sets `sideEffects: false` and ships one function per file, so bundlers keep only what
you import.

| Import | Gzipped |
| --- | --- |
| `import { chunk } from 'modern-fns'` | 0.20 kB |
| `import { diff } from 'modern-fns'` | 1.35 kB |
| `import { array } from 'modern-fns'` | 2.91 kB |
| the entire library | 12.83 kB |

Budgets are enforced in CI, so these numbers cannot silently regress.

## Browser and runtime support

Node 18+, Chrome and Edge 90+, Firefox 90+, Safari 15+. The library targets ES2021 and uses only
`Intl.NumberFormat`, `URL`, `String.prototype.normalize` and standard collections. There are no
Node built-ins — a CI check enforces that — so the same files run in a browser, on a server and in
a worker.
