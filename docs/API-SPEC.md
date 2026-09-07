# modern-fns — Phase 1: API Specification

> Status: frozen for implementation. Any deviation made during Phase 2 is recorded in
> [Phase 4 review](#) at the bottom of the README.

## 1. Package identity

| Item            | Value                                                                                  |
| --------------- | -------------------------------------------------------------------------------------- |
| npm name        | `modern-fns` — verified **available** (registry returns 404 for `npm view modern-fns`) |
| License         | MIT                                                                                    |
| Runtime deps    | **zero**                                                                               |
| Module system   | ESM first, CJS mirror for legacy consumers                                             |
| Minimum runtime | Node 18+, Chrome 90+, Safari 15+, Firefox 90+ (ES2021 + `Intl`)                        |
| Language        | TypeScript, `strict: true`                                                             |

## 2. Design rules

1. **Immutable by default.** No exported function mutates its input. The only exceptions are
   documented explicitly (`functional/tap` invokes a user callback; `debounce`/`throttle`/`memoize`
   own internal mutable state).
2. **Predictable failure.** Conversion helpers never throw on bad input — they return a caller
   supplied default. Structural helpers never throw on `null`/`undefined` — they degrade to the
   empty result for their type.
3. **One concept, one name.** A name means the same thing in every module (see §5 conflicts).
4. **No native duplication.** `map`, `filter`, `find`, `forEach` only exist in `collection`, where
   they add value by working across arrays, objects, `Map`, `Set` and iterables with one signature.
   There is no `array/map`, no `string/trim`, no `array/includes`, no `sum`, no `isNaN`.
5. **One function per file**, default export **and** named export, so both
   `import { chunk } from 'modern-fns'` and `import chunk from 'modern-fns/array/chunk'` work.
6. **No barrel in the hot path.** Subpath imports never touch a module index, so a single-function
   import pulls in that file plus its internal helpers only.

## 3. Module map

Counts below are the **as-built** figures, verified against the compiled package.

```
modern-fns
├── array       27 fns   list transforms + diffArray
├── object      15 fns   path access, merge, clone, structural equality
├── diff         4 fns   structural change sets (form dirty state, audit logs, PATCH bodies)
├── string      22 fns   case conversion, sanitising, extraction, validation
├── number      16 fns   math, business math, Intl formatting
├── url         13 fns   absolute + relative URL manipulation
├── query       11 fns   query-string parse/serialise with configurable rules
├── value       19 fns   coercion + type guards for untrusted input
├── functional  13 fns   composition, memoisation, rate limiting, safe execution
└── collection  10 fns   container-agnostic iteration
                ───────
                150 exported names
                145 unique functions (aliases + cross-module re-exports)
```

## 4. Function list and signatures

### 4.1 `array`

```ts
chunk<T>(array: readonly T[], size: number): T[][]
unique<T>(array: readonly T[]): T[]
uniqueBy<T>(array: readonly T[], selector: Selector<T>): T[]
groupBy<T>(array: readonly T[], selector: Selector<T>): Record<string, T[]>
indexBy<T>(array: readonly T[], selector: Selector<T>): Record<string, T>
partition<T>(array: readonly T[], predicate: (item: T, index: number) => boolean): [T[], T[]]
sortBy<T>(array: readonly T[], selector: Selector<T>): T[]
orderBy<T>(array: readonly T[], selectors: Selector<T>[], directions?: ('asc' | 'desc')[]): T[]
flatten<T>(array: readonly (T | readonly T[])[]): T[]
flattenDeep<T>(array: NestedArray<T>): T[]
compact<T>(array: readonly T[]): NonNullable<Exclude<T, false | '' | 0>>[]
difference<T>(array: readonly T[], other: readonly T[]): T[]
intersection<T>(array: readonly T[], other: readonly T[]): T[]
union<T>(...arrays: readonly T[][]): T[]
zip<T extends readonly unknown[][]>(...arrays: T): Zipped<T>
unzip<T>(array: readonly (readonly T[])[]): T[][]
first<T>(array: readonly T[]): T | undefined
last<T>(array: readonly T[]): T | undefined
take<T>(array: readonly T[], count: number): T[]
takeRight<T>(array: readonly T[], count: number): T[]
drop<T>(array: readonly T[], count: number): T[]
dropRight<T>(array: readonly T[], count: number): T[]
range(start: number, end?: number, step?: number): number[]
window<T>(array: readonly T[], size: number): T[][]
diffArray<T>(oldArray: readonly T[], newArray: readonly T[], key?: Key<T>, options?): ArrayDiff<T>
```

`Selector<T> = keyof T | ((item: T) => PropertyKey)` — every selector position accepts a key name
or a function. This is the single most repeated ergonomic win in the library.

`diffArray` returns:

```ts
{
  added: T[]
  removed: T[]
  updated: Array<{ key: PropertyKey; before: T; after: T; changes: Change[] }>
  unchanged: T[]
}
```

### 4.2 `object`

```ts
get<T>(object: unknown, path: Path, defaultValue?: T): T | undefined
set<T extends object>(object: T, path: Path, value: unknown): T
has(object: unknown, path: Path): boolean
unset<T extends object>(object: T, path: Path): T
pick<T extends object, K extends keyof T>(object: T, paths: readonly K[]): Pick<T, K>
omit<T extends object, K extends keyof T>(object: T, paths: readonly K[]): Omit<T, K>
deepClone<T>(value: T): T
deepMerge<T extends object[]>(...objects: T): DeepMerged<T>
mapValues<T extends object, R>(object: T, iteratee: (value, key, object) => R): Record<keyof T, R>
mapKeys<T extends object>(object: T, iteratee: (key, value, object) => PropertyKey): Record<string, T[keyof T]>
isEqual(a: unknown, b: unknown): boolean
isEmpty(value: unknown): boolean
flattenObject(object: object, options?: FlattenOptions): Record<string, unknown>
unflattenObject(object: Record<string, unknown>, options?: FlattenOptions): Record<string, unknown>
```

`Path = string | ReadonlyArray<string | number>` and supports `a.b.c`, `a[0].b`, `a["dotted.key"]`.

### 4.3 `diff`

```ts
diff(oldObject: unknown, newObject: unknown, options?: DiffOptions): Change[]
changed(oldObject: unknown, newObject: unknown, options?: DiffOptions): boolean
patch<T>(object: T, changes: readonly Change[]): T

type Change =
  | { path: string; type: 'added';   newValue: unknown }
  | { path: string; type: 'removed'; oldValue: unknown }
  | { path: string; type: 'changed'; oldValue: unknown; newValue: unknown }

interface DiffOptions {
  arrays?: 'index' | 'whole' | 'key'   // default 'index'
  key?: string | ((item: unknown) => PropertyKey)
  equals?: (a: unknown, b: unknown, path: string) => boolean | undefined
  maxDepth?: number
  ignore?: (path: string) => boolean
}
```

### 4.4 `string`

```ts
capitalize(value), capitalizeWords(value)
camelCase(value), pascalCase(value), kebabCase(value), snakeCase(value), constantCase(value)
slugify(value, options?)
truncate(value, length, options?), truncateWords(value, wordCount, options?)
initials(value, options?)
mask(value, options?)
stripHtml(value), stripWhitespace(value), removeSpaces(value), normalizeWhitespace(value)
escapeHtml(value), unescapeHtml(value)
isEmail(value), isUrl(value, options?)
extractNumbers(value), extractEmails(value)
```

All return `string` (or `string[]` for the two `extract*`) and accept `unknown`-ish input safely:
`null`/`undefined` produce `''` / `[]` rather than throwing.

### 4.5 `number`

```ts
clamp(value, min, max)
round(value, decimals?), floor(value, decimals?), ceil(value, decimals?)
percentage(value, total), percentageChange(oldValue, newValue)
formatNumber(value, options?), abbreviate(value, options?)
currency(value, currency, locale?)
random(min, max, options?), range(start, end?, step?)
isNumeric(value), toNumber(value, defaultValue?)
tax(value, percentage), discount(value, percentage)
compoundInterest(principal, rate, periods, years)
```

`round/floor/ceil` are decimal-safe (`round(1.005, 2) === 1.01`, which naive `Math.round` gets
wrong). `tax` and `discount` both return the **resulting amount**, not the delta.

### 4.6 `url`

```ts
parseUrl(url): ParsedUrl
buildUrl(options: BuildUrlOptions): string
getQuery(url, key), getQueryParams(url, options?)
setQuery(url, key, value), setQueryParams(url, params)
removeQuery(url, key | key[]), mergeQuery(url, params), hasQuery(url, key)
setHash(url, hash), removeHash(url)
isSameUrl(a, b, options?)
joinUrl(...parts)
```

Every function preserves the _shape_ of its input: a relative URL in, a relative URL out.

### 4.7 `query`

```ts
parse(queryString, options?): QueryObject
stringify(object, options?): string
get(queryString, key, options?), set(queryString, key, value, options?)
remove(queryString, key, options?), merge(queryString, values, options?)
has(queryString, key), toggle(queryString, key, options?)
parseNumber(queryString, key, defaultValue?)
parseBoolean(queryString, key, defaultValue?)
parseArray(queryString, key, options?)
```

`ParseOptions = { parseNumbers?, parseBooleans?, nested?, arrayFormat?, decode? }`.

### 4.8 `value`

```ts
toString(value, defaultValue?), toNumber(value, defaultValue?), toBoolean(value, defaultValue?)
toArray(value), toDate(value, defaultValue?), toObject(value, defaultValue?)
isNull, isUndefined, isNil, isString, isNumber, isBoolean, isArray, isObject, isFunction  // type guards
defaultTo(value, defaultValue), nullable(value), coalesce(...values)
isEmpty(value)
```

### 4.9 `functional`

```ts
pipe(...fns), compose(...fns)          // sync, and async when any step returns a thenable
identity(value), noop()
once(fn), memoize(fn, options?)
debounce(fn, wait, options?) -> fn & { cancel(); flush(); pending() }
throttle(fn, wait, options?) -> same control surface
tryCatch(fn, fallback?), asyncTryCatch(fn, fallback?)
tap(value, callback)
when(condition, valueOrFn, otherwise?), unless(condition, valueOrFn, otherwise?)
```

### 4.10 `collection`

```ts
(size(value), first(value), last(value), isEmpty(value));
(each(value, iteratee), map(value, iteratee), filter(value, predicate));
(find(value, predicate), some(value, predicate), every(value, predicate));
```

Works over `Array`, plain object, `Map`, `Set`, `string` and any iterable. `map`/`filter` preserve
the container type.

## 5. Naming conflicts and resolution

| Name                                                     | Modules                                  | Resolution                                                                                                                                                                                              |
| -------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `range`                                                  | `array`, `number`                        | One implementation in `array/range`; `number/range` re-exports it. Root exports it once.                                                                                                                |
| `first`, `last`, `isEmpty`                               | `array`, `object`, `value`, `collection` | Canonical implementations: `array/first`, `array/last`, `value/isEmpty`. `collection/*` are the generalised versions and are what the root barrel exports. `object/isEmpty` re-exports `value/isEmpty`. |
| `toNumber`                                               | `number`, `value`                        | One implementation in `value/toNumber`; `number/toNumber` re-exports.                                                                                                                                   |
| `get`, `set`, `has`                                      | `object`, `query`                        | Root barrel exports the **object** versions. Query's are reachable as `query.get(...)` (namespace) or `modern-fns/query/get` (subpath). Documented loudly.                                              |
| `remove`, `merge`, `parse`, `stringify`, `toggle`        | `query` only                             | Too generic for the root barrel — namespace/subpath only.                                                                                                                                               |
| `map`, `filter`, `find`, `some`, `every`, `each`, `size` | `collection` only                        | Exported at root; no array/object duplicates exist.                                                                                                                                                     |
| `isEqual`                                                | `object` (used by `diff`, `array`)       | Single implementation, re-used internally.                                                                                                                                                              |
| `diff`                                                   | `diff` module                            | Object diff. Array diff is `diffArray` to avoid an overloaded, unpredictable signature.                                                                                                                 |

**Root barrel exclusions** (namespace + subpath only): the whole `query` module surface.
Everything else is flat-exported.

## 6. Dependency analysis

- **Runtime dependencies: none.** Only `Intl.NumberFormat`, `URL`/`URLSearchParams`,
  `String.prototype.normalize`, `structuredClone`-free manual cloning, and standard ES2021.
- **Internal coupling** (kept deliberately shallow so subpath imports stay small):

  | Internal helper                                     | Consumed by                                                 |
  | --------------------------------------------------- | ----------------------------------------------------------- |
  | `internal/path.ts` (parse/format paths)             | `object/*`, `diff/*`                                        |
  | `internal/selector.ts` (`keyof T \| fn` normaliser) | `array/*`                                                   |
  | `internal/words.ts` (unicode word splitter)         | `string` case functions                                     |
  | `internal/types.ts` (`isPlainObject`, guards)       | most modules                                                |
  | `internal/url.ts` (relative-safe URL parsing)       | `url/*`                                                     |
  | `internal/query.ts` (key-path tokeniser, coercion)  | `query/*`, `url/*`                                          |
  | `object/isEqual.ts`                                 | `diff/*`, `array/diffArray`, `array/difference` (deep mode) |

  Worst-case single-function import: `diff/diff` → `internal/path` + `internal/types` +
  `object/isEqual`. Measured in the bundle-size check.

- **Dev dependencies only:** typescript, vitest, @vitest/coverage-v8, eslint,
  typescript-eslint, prettier, esbuild (size check), @changesets/cli.

## 7. Bundle-size strategy

1. `sideEffects: false` in `package.json`.
2. One function per file; no cross-imports between sibling functions unless genuinely shared.
3. Module `index.ts` files are pure re-export barrels — safe to shake, but subpath imports skip
   them entirely.
4. Compiled with `tsc` (not a bundler) so the published `dist` mirrors `src` file-for-file: what a
   bundler sees is exactly one function per module.
5. No polyfills, no `class` where a closure does, no shared mutable registries.
6. `npm run size` builds each public entry with esbuild (minify + gzip) and prints per-entry
   bytes; CI fails if any single-function entry exceeds its budget.

Budgets: single-function entry ≤ 1.5 kB gzip, module barrel ≤ 6 kB gzip, full barrel ≤ 18 kB gzip.

## 8. Package architecture

```
src/<module>/<fn>.ts   one function, named + default export
src/<module>/index.ts  barrel
src/internal/*.ts      shared helpers, never published as a public entry point
src/index.ts           flat named exports + namespace exports
```

Build output:

```
dist/            ESM + .d.ts, mirrors src/
dist/cjs/        CJS + .d.ts, with { "type": "commonjs" } marker
```

`exports` map exposes `.`, `./<module>`, and `./<module>/*` with `types`/`import`/`require`
conditions for each.
