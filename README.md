# modern-fns

**Modern utility functions for JavaScript and TypeScript — modular, immutable, tree-shakeable and
dependency-free.**

146 focused utilities for the problems frontend and backend developers solve by hand over and
over: reading a nested path safely, diffing two objects for a `PATCH` body, editing a query
string without losing the hash, parsing `"₹1,299.50"` into a number, formatting `1500000` as
`"1.5M"`.

```bash
npm install modern-fns
```

```ts
import { groupBy, set, diff, slugify, currency } from 'modern-fns';

groupBy(orders, 'status'); // { paid: [...], pending: [...] }
set(state, 'user.address.city', 'Kochi'); // immutable — `state` untouched
diff(pristine, form); // [{ path: 'name', type: 'changed', ... }]
slugify('Hello Vue World!'); // 'hello-vue-world'
currency(1299.5, 'INR', 'en-IN'); // '₹1,299.50'
```

|                               |                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| **Zero runtime dependencies** | Nothing but the platform. No Lodash, no `qs`, no `deepmerge`.                             |
| **Tree-shakeable**            | One function per file. `import { chunk }` ships **0.20 kB** gzipped.                      |
| **Immutable**                 | No exported function mutates its input. Ever.                                             |
| **TypeScript-first**          | Written in strict TS, generics that infer, no `any` in the public API.                    |
| **Universal**                 | Vue, React, Nuxt, Next, Svelte, Node, Deno, Bun, workers, plain `<script type="module">`. |
| **ESM + CJS**                 | Modern `exports` map with `import`/`require`/`types` conditions.                          |
| **Tested**                    | 363 tests, 99.4% line coverage; ESM + CJS consumers typechecked against the real tarball. |

---

## Table of contents

- [Quick start](#quick-start)
- [Import styles](#import-styles)
- [Modules](#modules)
- [Highlights](#highlights)
- [TypeScript](#typescript)
- [Immutability](#immutability)
- [Bundle size and tree shaking](#bundle-size-and-tree-shaking)
- [Browser and runtime support](#browser-and-runtime-support)
- [Design philosophy](#design-philosophy)
- [API documentation](#api-documentation)
- [Contributing](#contributing)

---

## Quick start

```ts
import { changed, chunk, diffArray, mergeQuery, orderBy, pipe, toNumber } from 'modern-fns';

// Reshape API data
chunk(products, 24); // pages
orderBy(users, ['role', 'age'], ['asc', 'desc']); // multi-key sort, immutable

// Know exactly what changed
changed(pristine, form); // is the form dirty?
diffArray(oldRows, newRows, 'id'); // { added, removed, updated, unchanged }

// URLs without string surgery
mergeQuery('/products?page=2&sort=price', { page: 3, q: 'shoes' });
// '/products?page=3&sort=price&q=shoes'

// Trust nothing from the wire
toNumber('₹1,299.50'); // 1299.5
toNumber('abc', 0); // 0

// Compose
const toHandle = pipe((s: string) => s.trim(), slugify);
```

## Import styles

All three are tree-shakeable. **Named imports are the recommended default.**

```ts
// 1. Named — recommended
import { chunk, groupBy, diff } from 'modern-fns';

// 2. Subpath — maximally explicit, provably one module
import chunk from 'modern-fns/array/chunk';
import diff from 'modern-fns/diff/diff';

// 3. Namespaces — useful for the query module
import { array, object, string, number, url, query, value } from 'modern-fns';
query.parse('?page=2&tags=vue&tags=nuxt'); // { page: 2, tags: ['vue', 'nuxt'] }
```

CommonJS works too:

```js
const { chunk } = require('modern-fns');
```

> **One naming rule to know:** the `query` module's functions (`parse`, `get`, `set`, `has`,
> `merge`, `remove`, `toggle`, …) are **not** flat-exported from the package root, because they
> would collide with the `object` module's `get`/`set`/`has`. Use `query.parse(...)` or
> `modern-fns/query/parse`. Everything else is available as a named import.

## Modules

| Module       | What it covers                                                                | Docs                                       |
| ------------ | ----------------------------------------------------------------------------- | ------------------------------------------ |
| `array`      | 25 list utilities plus `diffArray` for list reconciliation                    | [docs/array.md](./docs/array.md)           |
| `object`     | Path get/set/unset, pick/omit, deep clone/merge, structural equality, flatten | [docs/object.md](./docs/object.md)         |
| `diff`       | Structural change sets: dirty checking, audit logs, `PATCH`, undo/redo        | [docs/diff.md](./docs/diff.md)             |
| `string`     | Case conversion, slugs, truncation, masking, sanitising, extraction           | [docs/string.md](./docs/string.md)         |
| `number`     | Decimal-safe maths, percentages, business maths, `Intl` formatting            | [docs/number.md](./docs/number.md)         |
| `url`        | Absolute and relative URL manipulation, query and hash editing                | [docs/url.md](./docs/url.md)               |
| `query`      | Query-string parse/stringify with configurable rules and typed readers        | [docs/query.md](./docs/query.md)           |
| `value`      | Safe coercion and type guards for untrusted input                             | [docs/value.md](./docs/value.md)           |
| `functional` | `pipe`, `memoize`, `debounce`, `throttle`, `tryCatch`, …                      | [docs/functional.md](./docs/functional.md) |
| `collection` | One iteration API across arrays, objects, `Map`, `Set`, iterables             | [docs/collection.md](./docs/collection.md) |

The full signature list lives in the [API specification](./docs/API-SPEC.md).

## Highlights

### Immutable deep updates that keep references stable

```ts
import { set, unset, get } from 'modern-fns';

const next = set(state, 'user.profile.city', 'Kochi');
next !== state; // true — the path was copied
next.user.roles === state.user.roles; // true — untouched branches keep their reference
get(data, 'users[0].address.city', 'n/a'); // paths support brackets and defaults
```

That reference stability is what makes `===` change detection in Vue, React and Svelte cheap and
correct.

### A diff you can actually use

```ts
import { diff, changed, patch } from 'modern-fns';

changed(pristine, form); // enable/disable Save

diff(pristine, form);
// [
//   { path: 'name',         type: 'changed', oldValue: 'John', newValue: 'Vishnu' },
//   { path: 'address.city', type: 'added',   newValue: 'Kochi' },
// ]

patch(pristine, diff(pristine, form)); // structurally equal to `form`
```

Configurable array strategies (`'index'`, `'whole'`, `'key'`), custom equality per path, and an
`ignore` hook for server-managed fields like `updatedAt`.

### List reconciliation

```ts
import { diffArray } from 'modern-fns';

diffArray(oldUsers, newUsers, 'id');
// added:     items only in the new list
// removed:   items only in the old list
// updated:   [{ key, before, after, changes: [...] }]  — with field-level changes
// unchanged: deep-equal items
```

Reordering is not a change. An edit is one `updated` entry, not a delete plus an insert.

### URLs and query strings that survive real input

```ts
import { setQuery, mergeQuery, isSameUrl } from 'modern-fns';
import { query } from 'modern-fns';

setQuery('/products?page=2', 'sort', 'price'); // '/products?page=2&sort=price'
mergeQuery('/p?page=2&sort=price', { sort: undefined }); // '/p?page=2'
isSameUrl('/p?a=1&b=2', '/p/?b=2&a=1'); // true
query.parse('?page=2&tags=vue&tags=nuxt'); // { page: 2, tags: ['vue', 'nuxt'] }
query.toggle('?page=2', 'inStock'); // '?page=2&inStock=true'
```

Relative in, relative out. Arrays, nested keys, hashes and encoding all handled.

### Coercion without the JavaScript traps

```ts
import { toNumber, toBoolean, isEmpty, isNumeric } from 'modern-fns';

toNumber('₹1,299.50'); // 1299.5      (currency and separators)
toBoolean('false'); // false       (Boolean('false') is true)
isNumeric(''); // false       (Number('') is 0)
isEmpty(0); // false       (0 is a value, not an absence)
```

Every conversion is documented as an input/output table — see [docs/value.md](./docs/value.md).

### Numbers that behave

```ts
import { round, abbreviate, currency, percentage } from 'modern-fns';

round(1.005, 2); // 1.01   (Math.round gives 1)
abbreviate(1500000); // '1.5M'
currency(1299.5, 'INR', 'en-IN'); // '₹1,299.50'
percentage(5, 0); // 0      (not NaN)
```

## TypeScript

Written in TypeScript with `strict: true`, shipped with complete `.d.ts` files and source maps.
No `any` in the public API.

**Generics infer through the call.**

```ts
const byRole = groupBy(users, 'role'); // Record<string, User[]>
const [active, rest] = partition(users, (u) => u.isActive); // [User[], User[]]
const names = compact(list); // (string | null)[] -> string[]
```

**Property selectors are checked.**

```ts
groupBy(users, 'role'); // ok
groupBy(users, 'rolle'); // compile error: not a keyof User
groupBy(users, (u) => u.role.toUpperCase()); // functions welcome too
```

**Type guards narrow.**

```ts
if (isString(input)) input.trim(); // input: string
const numbers = mixed.filter(isNumber); // number[]
```

**Discriminated unions where they help.**

```ts
for (const change of diff(before, after)) {
  if (change.type === 'added') change.newValue; // no `oldValue` in scope
}
```

**Overloads for real signatures.**

```ts
toNumber('42'); // number
toNumber(input, 0); // number
toDate(value); // Date | undefined
toDate(value, new Date()); // Date
pipe(fetchUser, (r: Response) => r.json()); // returns a Promise — inferred
pipe((n: number) => n + 1); // stays synchronous — inferred
```

## Immutability

Every transformation returns a new value. Nothing sorts in place, splices your array or writes to
your object.

```ts
const original = { user: { name: 'John' } };
const updated = set(original, 'user.name', 'Vishnu');
original.user.name; // 'John'
```

Three functions own internal state, and say so in their docs: `debounce`, `throttle` and
`memoize`. `tap` invokes a callback you provide — if that callback mutates, `tap` cannot stop it.
Nothing else in the library holds state.

`set` and `unset` also refuse paths containing `__proto__`, `constructor` or `prototype`, so a
path from user input cannot pollute `Object.prototype`.

## Bundle size and tree shaking

The published `dist/` mirrors `src/` **file for file** — the package is compiled with `tsc`, not
bundled. Your bundler sees one function per module and can drop everything else without
heuristics. `sideEffects: false` is declared, and no module runs code at import time.

Measured with esbuild (minified + gzipped), enforced in CI by `npm run size`:

| Import                            | Gzipped  |
| --------------------------------- | -------- |
| `modern-fns/array/chunk`          | 0.20 kB  |
| `modern-fns/object/set`           | 0.53 kB  |
| `modern-fns/value/toNumber`       | 0.40 kB  |
| `modern-fns/functional/debounce`  | 0.33 kB  |
| `modern-fns/diff/diff`            | 1.35 kB  |
| `modern-fns/array` (whole module) | 2.91 kB  |
| `modern-fns` (**everything**)     | 12.83 kB |

```ts
// Ships one function, not a library.
import { chunk } from 'modern-fns';
```

Verified with Vite, Rollup, webpack 5 and esbuild. If your bundler is configured for CJS only,
prefer subpath imports — CJS cannot be tree-shaken by anyone.

## Browser and runtime support

| Environment                                | Minimum |
| ------------------------------------------ | ------- |
| Node                                       | 18      |
| Chrome / Edge                              | 90      |
| Firefox                                    | 90      |
| Safari                                     | 15      |
| Deno, Bun, Cloudflare Workers, Vercel Edge | current |

The library targets ES2021 and uses only `Intl.NumberFormat`, `URL`, `String.prototype.normalize`
and standard collections. There are no Node built-ins, no DOM requirements and no polyfills — the
same file runs in a browser, a server and a worker.

## Design philosophy

Every function had to answer one question before it was added:

> **What recurring developer pain does this eliminate?**

That is why this is **not** a Lodash clone. There is no `map`, `filter`, `head`, `sum`, `isNaN` or
`forEach` shim — the native versions are good. What is here is the code you would otherwise write
by hand and get subtly wrong:

- `round(1.005, 2)` is `1.01`. The naive version gives `1`.
- `sortBy` returns a new array. `Array.prototype.sort` mutates.
- `toBoolean('false')` is `false`. `Boolean('false')` is `true`.
- `isNumeric('')` is `false`. `Number('')` is `0`.
- `zip` pads to the longest input instead of silently dropping data.
- `random(1, 6)` includes `6`.
- `abbreviate(1999)` is `'1.9K'` — a count never reads higher than it is.
- `pick` skips absent keys instead of adding `undefined` to your `PATCH` body.
- `unset` on an array index splices instead of leaving a hole.
- `debounce` returns `cancel()`, so unmounting does not set state on a dead component.

And where a name is risky, there is an escape hatch: `slidingWindow` aliases `window` so a named
import cannot shadow the DOM global, and the `query` module is namespaced away from `object`.

Priorities, in order: practicality, predictable APIs, type safety, small bundles, tree shaking,
immutability, documentation, edge-case handling, composability.

## API documentation

Per-function reference — name, description, signature, parameters, return value, examples, edge
cases and TypeScript notes:

[array](./docs/array.md) · [object](./docs/object.md) · [diff](./docs/diff.md) ·
[string](./docs/string.md) · [number](./docs/number.md) · [url](./docs/url.md) ·
[query](./docs/query.md) · [value](./docs/value.md) · [functional](./docs/functional.md) ·
[collection](./docs/collection.md)

Design notes: the [API specification](./docs/API-SPEC.md) (signatures, naming conflicts, bundle
strategy) and the [API review](./docs/API-REVIEW.md) (what was cut, what is on probation, and
why).

Runnable examples: a [Node tour](./examples/node-demo) and a [Vue 3 playground](./examples/vue-demo)
that exercises every exported function with live, editable inputs.

Every function also carries full JSDoc, so your editor shows the same information on hover.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) — it covers the local workflow and the bar a new utility
has to clear.

```bash
npm install
npm run dev            # vitest, watch mode
npm run ci             # lint + typecheck + coverage + build + verify + size
```

## License

[MIT](./LICENSE) © Vishnu M
