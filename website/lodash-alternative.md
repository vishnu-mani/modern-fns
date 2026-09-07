---
title: 'A Modern Lodash Alternative for JavaScript & TypeScript'
description: 'modern-fns is a dependency-free, tree-shakeable, TypeScript-first alternative to Lodash. Migration mapping for 60+ Lodash methods, plus the behavioural differences to watch for.'
head:
  - - meta
    - name: keywords
      content: 'lodash alternative, replace lodash, lodash typescript alternative, lightweight lodash, lodash es modules'
---

# A modern Lodash alternative

[modern-fns](/) covers the Lodash methods most applications actually use, with native ES modules,
types generated from the source, and immutability as a rule rather than a per-method detail.

```bash
npm install modern-fns
```

```ts
// Lodash
import _ from 'lodash';
_.groupBy(users, 'role');

// modern-fns
import { groupBy } from 'modern-fns';
groupBy(users, 'role');
```

## Why people migrate

- **Bundle size.** `import _ from 'lodash'` pulls the whole library. modern-fns is one function per
  file with `sideEffects: false`, so `import { chunk }` costs 0.20 kB gzipped.
- **No `@types` package.** Lodash ships no types of its own; you install and version
  `@types/lodash` alongside it. modern-fns generates declarations from its own source.
- **Native ESM.** Lodash's main package has no `exports` field and no `module` entry — the ESM
  build is the separate `lodash-es` package. modern-fns ships both from one package.
- **Predictable mutation.** In Lodash, `_.set`, `_.merge`, `_.pull` and `_.remove` mutate their
  argument while `_.map` and `_.sortBy` do not. In modern-fns nothing mutates.

## Migration mapping

### Arrays

| Lodash | modern-fns |
| --- | --- |
| `_.chunk` | [`chunk`](/array#chunk-array-size) |
| `_.uniq` | [`unique`](/array) |
| `_.uniqBy` | [`uniqueBy`](/array) |
| `_.groupBy` | [`groupBy`](/array) |
| `_.keyBy` | [`indexBy`](/array) |
| `_.partition` | [`partition`](/array) |
| `_.sortBy` | [`sortBy`](/array) |
| `_.orderBy` | [`orderBy`](/array) |
| `_.flatten` / `_.flattenDeep` | [`flatten`](/array) / [`flattenDeep`](/array) |
| `_.compact` | [`compact`](/array) |
| `_.difference` / `_.intersection` / `_.union` | [`difference`](/array) / [`intersection`](/array) / [`union`](/array) |
| `_.zip` / `_.unzip` | [`zip`](/array) / [`unzip`](/array) |
| `_.head` / `_.last` | [`first`](/array) / [`last`](/array) |
| `_.take` / `_.takeRight` / `_.drop` / `_.dropRight` | same names |
| `_.range` | [`range`](/array) |

### Objects

| Lodash | modern-fns | Note |
| --- | --- | --- |
| `_.get` | [`get`](/object) | |
| `_.set` | [`set`](/object) | **Lodash mutates; modern-fns returns a new object.** |
| `_.has` / `_.unset` | [`has`](/object) / [`unset`](/object) | `unset` is immutable here |
| `_.pick` / `_.omit` | [`pick`](/object) / [`omit`](/object) | |
| `_.cloneDeep` | [`deepClone`](/object) | |
| `_.merge` | [`deepMerge`](/object) | **Lodash mutates its first argument; `deepMerge` returns a new object.** |
| `_.mapValues` / `_.mapKeys` | [`mapValues`](/object) / [`mapKeys`](/object) | |
| `_.isEqual` | [`isEqual`](/object) | |
| `_.isEmpty` | [`isEmpty`](/value) | |

### Strings, numbers and types

| Lodash | modern-fns |
| --- | --- |
| `_.capitalize` / `_.upperFirst` | [`capitalize`](/string) |
| `_.camelCase` / `_.kebabCase` / `_.snakeCase` | same names |
| `_.startCase` | [`capitalizeWords`](/string) |
| `_.truncate` | [`truncate`](/string) |
| `_.escape` / `_.unescape` | [`escapeHtml`](/string) / [`unescapeHtml`](/string) |
| `_.clamp`, `_.round`, `_.floor`, `_.ceil`, `_.random` | same names in [number](/number) |
| `_.toNumber` | [`toNumber`](/value) — also parses `"₹1,299.50"` |
| `_.isNil`, `_.isString`, `_.isNumber`, `_.isBoolean`, `_.isArray`, `_.isFunction` | same names in [value](/value) |
| `_.isPlainObject` | [`isObject`](/value) |
| `_.defaultTo` | [`defaultTo`](/value) |

### Functions and collections

| Lodash | modern-fns |
| --- | --- |
| `_.debounce` / `_.throttle` | [`debounce`](/functional) / [`throttle`](/functional) |
| `_.memoize` / `_.once` | [`memoize`](/functional) / [`once`](/functional) |
| `_.identity` / `_.noop` | [`identity`](/functional) / [`noop`](/functional) |
| `_.flow` / `_.flowRight` | [`pipe`](/functional) / [`compose`](/functional) |
| `_.forEach`, `_.map`, `_.filter`, `_.find`, `_.some`, `_.every`, `_.size` | [collection](/collection) module — same names, `each` instead of `forEach` |

## Behavioural differences to watch for

**`set` and `deepMerge` do not mutate.** This is the one migration change that bites silently:

```ts
// Lodash — mutates in place, return value often ignored
_.set(state, 'user.city', 'Kochi');

// modern-fns — you must use the return value
state = set(state, 'user.city', 'Kochi');
```

**`isEmpty(0)` is `false`.** Lodash returns `true` for numbers because they have no length.
modern-fns treats `0` and `false` as values, not absences.

**`debounce` has no `maxWait`.** It supports `leading`, `trailing`, `cancel()`, `flush()` and
`pending()`. If you rely on `maxWait`, keep Lodash for that call site.

**Selectors are `keyof T` or a function.** Lodash's `_.matches` / `_.property` shorthands
(`_.filter(users, { active: true })`) are not supported — write the predicate out.

## What modern-fns does not have

No equivalent exists for `_.template`, `_.curry`, `_.partial`, the `lodash/fp` module,
`_.countBy`, `_.sumBy`, `_.maxBy`, `_.minBy`, `_.times`, `_.sample`, `_.shuffle`, `_.deburr`,
`_.zipObject`, `_.fromPairs` or `_.toPairs`.

Several of those are one-liners in modern JavaScript — `Object.fromEntries`, `Object.entries`,
`Array.from({ length: n })`, `Math.max(...values.map(fn))` — which is exactly why they were left
out. See the [design philosophy](https://github.com/vishnu-mani/modern-fns#design-philosophy).

The two libraries coexist happily in one project, so a partial migration is a perfectly reasonable
outcome. Read the [detailed comparison](/compare) before deciding.
