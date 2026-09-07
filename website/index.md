---
layout: home
title: 'modern-fns — Modern JavaScript Utility Library'
titleTemplate: false
description: 'Modern JavaScript & TypeScript utility library — 145 modular, immutable, tree-shakeable, dependency-free utilities. A lightweight alternative to Lodash.'
head:
  - - meta
    - name: keywords
      content: 'javascript utility library, typescript utility library, lodash alternative, tree-shakeable utilities, immutable javascript'

hero:
  name: modern-fns
  text: Modern JavaScript utility library
  tagline: 145 modular, immutable, tree-shakeable utilities for JavaScript and TypeScript. Zero runtime dependencies. A lightweight alternative to Lodash.
  actions:
    - theme: brand
      text: Get started
      link: /docs
    - theme: alt
      text: vs Lodash
      link: /compare
    - theme: alt
      text: GitHub
      link: https://github.com/vishnu-mani/modern-fns

features:
  - title: Zero runtime dependencies
    details: Nothing but the platform. No Lodash, no qs, no deepmerge — enforced by a CI check on every build.
  - title: Tree-shakeable by design
    details: One function per file and sideEffects false. Importing chunk ships 0.20 kB gzipped, not a library.
  - title: Immutable everywhere
    details: No exported function mutates its input, so reference equality checks in Vue, React and Svelte stay correct.
  - title: TypeScript-first
    details: Written in strict TypeScript. Types are generated from the source — no @types package, no any in the public API.
  - title: ESM and CommonJS
    details: A modern exports map with per-condition types, verified by typechecking real ESM and CJS consumer projects in CI.
  - title: Per-function imports
    details: import chunk from 'modern-fns/array/chunk' resolves to exactly one module, no barrel file in the way.
---

## Install

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

## Ten focused modules

| Module | What it covers |
| --- | --- |
| [array](/array) | chunk, unique, groupBy, indexBy, partition, sortBy, orderBy, zip, range, diffArray |
| [object](/object) | get, set, has, unset, pick, omit, deepClone, deepMerge, isEqual, flattenObject |
| [diff](/diff) | structural diffs for dirty checking, audit logs, PATCH bodies and undo/redo |
| [string](/string) | slugify, camelCase, kebabCase, truncate, initials, mask, stripHtml, isEmail |
| [number](/number) | clamp, decimal-safe round, percentage, formatNumber, abbreviate, currency, tax |
| [url](/url) | parseUrl, buildUrl, setQuery, mergeQuery, removeHash, joinUrl, isSameUrl |
| [query](/query) | parse, stringify, get, set, toggle, parseArray — a dependency-free qs alternative |
| [value](/value) | toNumber, toBoolean, toDate, toArray plus typed guards for untrusted input |
| [functional](/functional) | pipe, compose, debounce, throttle, memoize, once, tryCatch, tap |
| [collection](/collection) | one iteration API across arrays, objects, Map, Set and iterables |

## Why not just use Lodash?

Lodash predates ES modules, TypeScript-by-default and bundle-size budgets. modern-fns is built for
those constraints: native ESM with an `exports` map, types generated from the source rather than a
separate `@types` package, and immutability as a rule rather than a per-function detail.

The [full comparison](/compare) is honest about where Lodash is still the better choice.
