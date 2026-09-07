---
title: "JavaScript Query String Utilities — parse and stringify query params"
description: "Parse and serialise query strings with configurable rules: repeated keys as arrays, nested brackets, number and boolean coercion, toggle, parseArray. A dependency-free qs alternative."
head:
  - - meta
    - name: keywords
      content: "javascript query string, parse query params, qs alternative, stringify query string"
  - - meta
    - property: og:title
      content: "JavaScript Query String Utilities — parse and stringify query params"
  - - meta
    - property: og:description
      content: "Parse and serialise query strings with configurable rules: repeated keys as arrays, nested brackets, number and boolean coercion, toggle, parseArray. A dependency-free qs alternative."
  - - meta
    - property: og:type
      content: article
---

<!-- Generated from docs/query.md by scripts/sync-docs.mjs. Edit that file, not this one. -->

# JavaScript query string utilities

_The `query` module of [modern-fns](/), a dependency-free JavaScript and TypeScript
utility library._
```ts
import { query } from 'modern-fns'; // namespace
import parse from 'modern-fns/query/parse'; // subpath
```

> **Not flat-exported.** `parse`, `get`, `set`, `has`, `merge` and `remove` are too generic for
> the package root, where they would collide with the [`object`](./object.md) module. Reach them
> through the `query` namespace or a subpath import. This is the only module with that rule.

Every mutating function takes a query string and returns a **new** query string, preserving a
leading `?` if the input had one.

## Types

```ts
type QueryValue = string | number | boolean | null | QueryValue[] | { [key: string]: QueryValue };
type QueryObject = Record<string, QueryValue>;
```

---

### `parse(queryString, options?)`

```ts
function parse(
  queryString: string,
  options?: {
    parseNumbers?: boolean; // default true
    parseBooleans?: boolean; // default true
    nested?: boolean; // default true
    decode?: boolean; // default true
    comma?: boolean; // default false
  },
): QueryObject;
```

```ts
parse('?page=2&tags=vue&tags=nuxt'); // { page: 2, tags: ['vue', 'nuxt'] }
parse('filter[status]=active&ids[]=1&ids[]=2');
// { filter: { status: 'active' }, ids: [1, 2] }
parse('page=2', { parseNumbers: false }); // { page: '2' }
parse('tags=a,b', { comma: true }); // { tags: ['a', 'b'] }
```

**Input** — a bare query (`'a=1'`), a prefixed one (`'?a=1'`) or a whole URL; the query part is
extracted either way.

**Edge cases**

- Repeated keys become arrays; `a[b]=1` becomes a nested object; `a[0]=x` becomes an array.
- **Number coercion is conservative**: only clean integers/decimals that round-trip exactly.
  `'007'` stays `'007'` and a 20-digit id stays a string, so record ids are never corrupted.
- `?q=` yields `''`; a bare `?debug` yields `''` (use `parseBoolean` to read it as `true`).
- Malformed percent-encoding is left as-is rather than throwing.
- `+` decodes to a space; `=novalue` (empty key) is skipped.
- A URL with no query returns `{}`.

**TypeScript** — the return is `QueryObject`; narrow individual keys with the typed readers below.

---

### `stringify(object, options?)`

```ts
function stringify(
  object: unknown,
  options?: {
    arrayFormat?: 'repeat' | 'bracket' | 'comma' | 'index'; // default 'repeat'
    nested?: boolean; // default true
    encode?: boolean; // default true
    skipNull?: boolean; // default false
    skipEmpty?: boolean; // default false
    sort?: boolean; // default false
    addQueryPrefix?: boolean; // default false
  },
): string;
```

```ts
stringify({ page: 2, tags: ['vue', 'nuxt'] }); // 'page=2&tags=vue&tags=nuxt'
stringify({ tags: ['a', 'b'] }, { arrayFormat: 'bracket' }); // 'tags[]=a&tags[]=b'
stringify({ tags: ['a', 'b'] }, { arrayFormat: 'comma' }); // 'tags=a,b'
stringify({ filter: { status: 'active' } }); // 'filter[status]=active'
stringify({ b: 1, a: 2 }, { sort: true, addQueryPrefix: true }); // '?a=2&b=1'
```

**Edge cases** — `undefined` values, empty arrays and empty objects are dropped; `null` becomes
`key=` unless `skipNull`. `Date` values become ISO strings. Brackets stay readable rather than
percent-encoded. `sort: true` gives a stable string for cache keys. `parse(stringify(x))`
round-trips for plain data.

---

### `get(queryString, key, options?)`

```ts
query.get('?page=2', 'page'); // 2
query.get('?q=', 'q'); // ''  — present but empty
query.get('?page=2', 'missing'); // undefined
```

---

### `set(queryString, key, value, options?)`

```ts
query.set('page=2', 'sort', 'price'); // 'page=2&sort=price'
query.set('?page=2', 'page', 3); // '?page=3'
query.set('page=2', 'tags', ['vue', 'nuxt']); // 'page=2&tags=vue&tags=nuxt'
```

**Edge cases** — existing keys keep their position; new keys are appended; `undefined` removes
the key; the `?` prefix is preserved.

---

### `remove(queryString, key)`

```ts
query.remove('page=2&sort=price', 'sort'); // 'page=2'
query.remove('a=1&b=2&c=3', ['a', 'c']); // 'b=2'
```

---

### `merge(queryString, values, options?)`

```ts
query.merge('page=2&sort=price', { page: 3, q: 'shoes' }); // 'page=3&sort=price&q=shoes'
query.merge('page=2&sort=price', { sort: undefined }); // 'page=2'
```

**Edge cases** — `undefined` deletes; a nullish `values` is a no-op.

---

### `has(queryString, key)`

```ts
query.has('?q=&page=2', 'q'); // true
query.has('?page=2', 'q'); // false
```

---

### `toggle(queryString, key, options?)`

```ts
query.toggle('?page=2', 'inStock'); // '?page=2&inStock=true'
query.toggle('?page=2&inStock=true', 'inStock'); // '?page=2'
query.toggle('', 'dark', { value: 1 }); // 'dark=1'
```

**Edge cases** — presence, not truthiness, decides: `inStock=false` toggles **off** because the
key exists. Pass `value` to control what is written when switching on.

**Use it for** — filter chips and facet toggles that live in the URL.

---

### `parseNumber(queryString, key, defaultValue?)`

```ts
query.parseNumber('?page=2', 'page'); // 2
query.parseNumber('?page=abc', 'page', 1); // 1
query.parseNumber('?p=1,299.50', 'p'); // 1299.5
```

**Edge cases** — reads the raw value and runs it through
[`toNumber`](./value.md#tonumbervalue-defaultvalue), so formatted numbers work. Repeated keys and
nested objects return the default. Without a default the result is `number | undefined`.

---

### `parseBoolean(queryString, key, defaultValue?)`

```ts
query.parseBoolean('?debug=true', 'debug'); // true
query.parseBoolean('?debug', 'debug'); // true  — bare flag
query.parseBoolean('?debug=0', 'debug'); // false
query.parseBoolean('?x=1', 'debug', false); // false
```

**Edge cases** — understands `true/false/1/0/yes/no/on/off/enabled/disabled`. A **bare** key
counts as `true`, matching hand-written feature flags. Unknown strings fall back to
`defaultValue` (default `false`).

---

### `parseArray(queryString, key, options?)`

Always returns an array, whatever form the value arrived in.

```ts
function parseArray(
  queryString: string,
  key: string,
  options?: ParseOptions & { separator?: string | null },
): QueryValue[];
```

```ts
query.parseArray('?tags=vue&tags=nuxt', 'tags'); // ['vue', 'nuxt']
query.parseArray('?tags[]=vue', 'tags'); // ['vue']
query.parseArray('?tags=vue', 'tags'); // ['vue']
query.parseArray('?tags=a,b', 'tags'); // ['a', 'b']
query.parseArray('', 'tags'); // []
```

**Edge cases** — a missing key and an empty value both give `[]`, so list rendering never needs a
shape check. Pass `separator: null` to stop splitting on commas.

