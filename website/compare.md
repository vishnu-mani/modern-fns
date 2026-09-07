---
title: 'modern-fns vs Lodash — an honest comparison'
description: 'A factual comparison of modern-fns and Lodash: packaging, TypeScript support, ESM, tree-shaking, bundle size, immutability and API surface — including when Lodash is still the better choice.'
head:
  - - meta
    - name: keywords
      content: 'modern-fns vs lodash, lodash comparison, lodash bundle size, lodash typescript, lodash tree shaking'
---

# modern-fns vs Lodash

Lodash is the reference point for JavaScript utility libraries and it earned that position. This
page is a factual comparison rather than a sales pitch — including the cases where Lodash remains
the right answer.

Lodash figures below were checked against `lodash@4.18.1` and `lodash-es@4.18.1` on the npm
registry. modern-fns figures come from its own CI, which enforces them on every commit.

## At a glance

| | modern-fns | Lodash |
| --- | --- | --- |
| Runtime dependencies | 0 | 0 |
| Bundled TypeScript types | Yes, generated from source | No — install `@types/lodash` |
| ESM | Native | Separate `lodash-es` package |
| `exports` map | Yes, with `import` / `require` / `types` | No `exports` field |
| Tree-shaking from the main entry | Yes (`sideEffects: false`) | Needs `lodash-es` or per-method imports |
| Per-function imports | `modern-fns/array/chunk` | `lodash/chunk` |
| Immutability | Every function | Mixed — `set`, `merge`, `pull`, `remove` mutate |
| Selector style | `keyof T` or a function | Strings, paths, objects, matchers |
| API surface | 145 functions | ~300 functions |
| First released | 2026 | 2012 |

## Packaging

This is the substantive difference. Lodash was designed before ES modules existed, and its
packaging still reflects that: `lodash@4.18.1` has no `type`, no `module`, no `exports` and no
`types` field. Bundlers therefore treat it as CommonJS, which is why `import _ from 'lodash'` so
often ships the entire library.

The workarounds are well known — switch to `lodash-es`, import per method (`lodash/chunk`), or add
`babel-plugin-lodash`. They work. They are also configuration you have to know about.

modern-fns ships one package with an `exports` map that resolves ESM, CommonJS and TypeScript
declarations per condition. CI typechecks a real ESM consumer and a real CommonJS consumer against
the packed tarball on every commit, so a broken entry point fails the build rather than reaching
npm.

## Bundle size

modern-fns budgets are enforced in CI:

| Import | Gzipped |
| --- | --- |
| `import { chunk } from 'modern-fns'` | 0.20 kB |
| `import { diff } from 'modern-fns'` | 1.35 kB |
| `import { array } from 'modern-fns'` | 2.91 kB |
| the entire library | 12.83 kB |

Lodash's equivalent numbers depend entirely on how you import it, which is the point: with
`lodash-es` and a modern bundler, a handful of methods costs a few kB; with a default CommonJS
`import _ from 'lodash'`, you ship roughly 70 kB gzipped. Measure your own build rather than
trusting either of us.

## TypeScript

Lodash's types live in `@types/lodash`, maintained separately from the library by
DefinitelyTyped contributors. They are good, widely used, and occasionally out of step with the
runtime — a category of problem that cannot occur when declarations are generated from the
implementation, as they are here.

modern-fns is written in strict TypeScript with no `any` in its public API, and every selector
position accepts `keyof T` or a function:

```ts
groupBy(users, 'role'); // Record<string, User[]>
groupBy(users, (u) => u.id); // Record<string, User[]>
```

Lodash additionally supports matcher shorthands (`_.filter(users, { active: true })`) that
modern-fns deliberately omits, because they are harder to type precisely and no shorter than the
arrow function.

## Immutability

In Lodash, whether a method mutates depends on the method: `_.map` and `_.sortBy` return new
values, while `_.set`, `_.merge`, `_.pull` and `_.remove` modify in place. That is a reasonable
design for 2012, and a persistent source of bugs in reactive UI code where a mutated object
defeats `===` change detection.

modern-fns has one rule: nothing mutates. `set` and `unset` copy the path and leave every
untouched branch pointing at its original reference, which keeps Vue, React and Svelte
re-rendering exactly what changed.

## What Lodash does better

- **Breadth.** ~300 methods against 145. `_.template`, `_.curry`, `_.partial`, `_.debounce` with
  `maxWait`, and the entire `lodash/fp` module have no equivalent here.
- **Maturity.** More than a decade in production across a large fraction of npm. modern-fns is new.
- **Ecosystem.** Babel plugins, ESLint rules, Stack Overflow answers, and a colleague who already
  knows it.
- **Legacy toolchains.** If you are on an older CommonJS build pipeline, Lodash is designed for it.

## Choosing

Reach for modern-fns when bundle size matters, when you want types that ship with the library, when
your codebase is ESM and TypeScript, or when you want immutability guaranteed rather than
per-method. Stay on Lodash when you need its breadth or its maturity.

They also coexist without conflict, so adopting modern-fns for new code while leaving existing
Lodash calls alone is a perfectly good outcome. The
[migration mapping](/lodash-alternative) covers method-by-method equivalents.
