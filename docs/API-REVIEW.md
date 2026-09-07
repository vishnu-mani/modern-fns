# Phase 4 — public API review

A pass over all 150 export names (145 unique functions — aliases and cross-module re-exports account for the difference) asking, for each one: _what recurring developer pain does this
eliminate, and is the name and signature the best one available?_ Findings, and what was done
about them.

## Acted on in 0.1.0

### 1. `window` shadowed the DOM global — alias added

`import { window } from 'modern-fns'` shadows `window` for the whole module. That is a genuinely
confusing bug to debug in browser code.

**Done:** `slidingWindow` is exported as an alias of the same function, and the docs recommend it
for browser code. `window` stays for people who like the name and for the subpath
`modern-fns/array/window`.

### 2. `diffModule` was an ugly namespace — removed

The root barrel exported `export * as diffModule` purely because the namespace name `diff`
collided with the `diff` function. A namespace nobody would guess the name of is worse than no
namespace. `diff`, `changed`, `patch` and `invert` are all flat-exported, and
`modern-fns/diff/diff` still works.

**Done:** namespace removed.

### 3. The `query` module's names were unsafe at the root — namespaced

`parse`, `get`, `set`, `has`, `merge` and `remove` would collide with the `object` module and with
ordinary user code.

**Done (in Phase 1, confirmed here):** the `query` module is reachable only via the `query`
namespace or subpath imports. It is the only module with that restriction, and it is called out
in the README, the module docs and the barrel's JSDoc.

### 4. Duplicate names across modules — one implementation each

`range`, `toNumber`, `isEmpty`, `first` and `last` each appeared in two or more modules in the
specification. Rather than shipping copies that could drift, each has exactly one implementation
that the other modules re-export. `object.isEmpty === value.isEmpty` is asserted in the test
suite.

## Known weak spots, kept deliberately

These were specified, they pass the pain test only weakly, and each carries an explicit note in
its documentation.

| Export                      | Concern                                           | Why it stays                                                                                                                                                                         |
| --------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `flatten` / `flattenDeep`   | Thin wrappers over `.flat(1)` / `.flat(Infinity)` | Nullish-safe, better inference for deeply nested input, and `flattenDeep` is iterative rather than relying on engine flattening. Cost is ~0.2 kB.                                    |
| `unique`                    | `[...new Set(x)]` is already short                | The single most-typed idiom in application code, and it is nullish-safe here. `uniqueBy` is where the real value is.                                                                 |
| `removeSpaces`              | Overlaps `stripWhitespace`                        | Genuinely different (ASCII spaces only, keeps line structure), but it is the least-used export in the library and the likeliest candidate for removal in 1.0.                        |
| `array/first`, `array/last` | Duplicate `collection/first`, `collection/last`   | The root barrel exports the container-agnostic version. The array-only files exist so `modern-fns/array/first` stays a 0.1 kB import instead of pulling in the collection machinery. |
| `identity`, `noop`          | Trivial                                           | Stable shared references matter for default props and memo dependencies.                                                                                                             |

## Naming risks documented rather than changed

- **`value.toString`** — as a namespace member this shadows `Object.prototype.toString` on the
  namespace object. Harmless in practice, but prefer the named import `toString`, or alias it:
  `import { toString as str } from 'modern-fns'`.
- **Generic root names** — `map`, `filter`, `find`, `size`, `first`, `last`, `some`, `every`,
  `get`, `set`, `has`. They are the right names for what they do; the collision risk is with your
  own locals, which your editor will flag. Subpath imports sidestep it entirely.

## Considered and rejected

| Proposal                                                        | Verdict                                                                                                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sum`, `mean`, `min`, `max`, `head`, `tail`, `isNaN`, `forEach` | Rejected. Native or one-liners; adding them would make this a Lodash clone.                                                                                   |
| `deepEqual` as an alias of `isEqual`                            | Rejected. Two names for one function is a documentation tax.                                                                                                  |
| Curried variants (`chunk(2)(array)`)                            | Rejected. Doubles the type surface and reads worse in TypeScript. `pipe` with an arrow covers it.                                                             |
| A `date` module                                                 | Rejected for 0.x. Dates deserve a dedicated library; `toDate` is the only date-adjacent utility, and it is a coercion helper.                                 |
| `diff` overloaded to accept arrays                              | Rejected. An overload that changes its return shape based on input type is exactly the unpredictability this library avoids — hence the separate `diffArray`. |

## Open questions for 1.0

1. Should `tax` and `discount` return the resulting amount (current) or the delta? The current
   choice is documented and consistent between the two, but `tax(1000, 18) === 1180` surprises
   some readers. A `taxAmount`/`discountAmount` pair may be clearer than changing these.
2. Should `compoundInterest` live in a general-purpose utility library at all, or in a `finance`
   companion package?
3. `removeSpaces` — keep or drop (see above).
4. Should `abbreviate` gain a `locale` option, or stay deliberately locale-independent so
   snapshots are stable? Current answer: stay; use `formatNumber(value, { notation: 'compact' })`
   for localised output.
