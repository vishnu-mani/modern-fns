# modern-fns playground (Vue 3)

A live, editable demo of **every function modern-fns exports** — 150 exported names across ten
modules — built with Vue 3, Vite and TypeScript.

```bash
npm install     # links the library from ../.. via file:
npm run dev     # http://localhost:5178
```

Requires Node 18+ (Vite 6 needs 18; this was developed on 24).

## What it does

- **Every argument is editable.** Type in a field and the call re-runs immediately. The exact call
  is printed above the result, so you can copy it straight into your own code.
- **Predicates and selectors are editable too.** Inputs marked `fn` are compiled from the text you
  type, so you can change `(u) => u.role` to `(u) => u.age` and watch `groupBy` regroup.
- **Failures are shown, not swallowed.** Malformed JSON or a bad predicate renders as `threw` with
  the message; fix the input and the card recovers.
- **Stateful functions get real widgets.** `debounce` and `throttle` have a live input with
  keystroke and invocation counters plus `flush()` / `cancel()` buttons; `memoize` shows cache hits
  against real computations; `once` proves the underlying function runs once; `random` rolls.
- **Coverage is computed, not claimed.** The header compares the demo registry against what the
  library actually exports at runtime. Add a function to modern-fns without adding a demo and the
  header turns red and names it.

## How it is put together

```
src/
├── registry/         one spec per function: signature, summary, editable inputs, run()
│   ├── array.ts  object.ts  string.ts  number.ts  url.ts
│   ├── value.ts  functional.ts  collection.ts
│   └── index.ts      merges the modules and computes live coverage
├── components/
│   ├── FunctionCard.vue    renders a spec: inputs -> call -> output
│   ├── InputField.vue      json / text / number / boolean / select / fn editors
│   ├── OutputView.vue      pretty-printed result with a type badge
│   ├── TimingWidget.vue    debounce + throttle
│   └── StatefulWidget.vue  once + memoize + random
└── App.vue           search, module filter, coverage header
```

Adding a function to the library means adding one entry to the matching registry file — the UI is
entirely data-driven.

## A note on bundle size

This app imports whole namespaces (`import { array } from 'modern-fns'`) because it demonstrates
everything, so its bundle contains the entire library. That is the opposite of how you should
import in a real app:

```ts
import { chunk } from 'modern-fns'; // ships ~0.2 kB gzipped, not the library
```

See the tree-shaking section of the [main README](../../README.md).

## Standalone use

The only dependency on its parent is `"modern-fns": "file:../.."` in `package.json`. Change that to
`"modern-fns": "^0.1.0"` and this directory can be moved into a repository of its own.
