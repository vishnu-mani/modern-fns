# Contributing to modern-fns

Thanks for helping. This document covers the two things that matter most: how to run the
project, and the design bar a new utility has to clear.

## Getting started

```bash
git clone https://github.com/vishnum/modern-fns.git
cd modern-fns
nvm use          # Node 24; the package supports Node >= 18
npm install
npm test
```

| Command                           | What it does                                     |
| --------------------------------- | ------------------------------------------------ |
| `npm run dev`                     | Vitest in watch mode                             |
| `npm run build`                   | ESM + CJS + declarations into `dist/`            |
| `npm run test`                    | Run the suite once                               |
| `npm run test:coverage`           | Suite + coverage, enforcing the thresholds       |
| `npm run lint` / `lint:fix`       | ESLint                                           |
| `npm run format` / `format:check` | Prettier                                         |
| `npm run typecheck`               | `tsc --noEmit` over `src`, `tests` and `scripts` |
| `npm run size`                    | Bundle-size budgets per entry point              |
| `npm run verify:build`            | Import the built artefact and assert it works    |
| `npm run ci`                      | Everything CI runs, in order                     |

## The bar for a new utility

Before proposing a function, answer this in the PR description:

> **What recurring developer pain does this eliminate?**

A utility earns its place if at least one of these is true:

1. The native equivalent is genuinely awkward (`Object.entries().map().fromEntries()`).
2. The obvious hand-rolled version is subtly wrong (`Math.round(x * 100) / 100`,
   `Boolean('false')`, `array.sort()` mutating).
3. It unifies inconsistent shapes (`.length` vs `.size` vs `Object.keys().length`).

It does **not** earn its place if it is a thin alias for something native (`isNaN`, `sum`,
`head`), or a Lodash function we would only add for parity.

## House rules

- **One function per file**, named **and** default export, in `src/<module>/<fn>.ts`.
- **Immutable.** No exported function may mutate an argument. If it must (`debounce` state),
  say so in the JSDoc.
- **No runtime dependencies.** Ever. Dev dependencies are fine.
- **No throwing on bad input.** Return the empty result for the type, or a caller-supplied
  default. Document the fallback in a table.
- **No `any`.** Use generics and overloads. `unknown` plus a narrowing guard is fine.
- **Cross-module imports are a cost.** A subpath import should pull in as little as possible;
  put anything shared in `src/internal/`.
- **JSDoc every export**: one-line summary, the non-obvious behaviour, at least one
  `@example`, and edge cases. The docs in `docs/` are written from these.
- **Export it** from `src/<module>/index.ts` and, unless the name collides, `src/index.ts`.

## Tests

Every function needs tests covering: the normal case, empty input, `null`/`undefined`,
malformed input, and any edge case named in the JSDoc. Immutability is asserted centrally in
`tests/package/api.test.ts` — add new transforms there too. Coverage thresholds (95% lines,
90% branches) are enforced in CI.

## Commits and releases

- Conventional commits are preferred but not enforced.
- Every user-visible change needs a changeset: `npm run changeset`, pick `patch`/`minor`/
  `major`, and describe the change from the user's point of view.
- Entries in `CHANGELOG.md` are generated from those changesets — do not edit that file by hand.
- Releases are automated: merging to `main` opens (or updates) a version PR; merging that PR
  publishes to npm.

## Adding a whole module

Open an issue first. A new top-level module needs its own `exports` entries in `package.json`,
a barrel, a `docs/<module>.md`, a bundle-size budget in `scripts/bundle-size.mjs`, and an
answer to why it does not belong in an existing module.
