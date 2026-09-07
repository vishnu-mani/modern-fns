---
title: "JavaScript Functional Utilities — pipe, compose, debounce, memoize"
description: "Lightweight functional helpers for JavaScript and TypeScript: pipe, compose, debounce, throttle, memoize, once, tryCatch, tap, when and unless. Async-aware, zero dependencies."
head:
  - - meta
    - name: keywords
      content: "javascript debounce, throttle javascript, memoize function, pipe compose javascript"
  - - meta
    - property: og:title
      content: "JavaScript Functional Utilities — pipe, compose, debounce, memoize"
  - - meta
    - property: og:description
      content: "Lightweight functional helpers for JavaScript and TypeScript: pipe, compose, debounce, throttle, memoize, once, tryCatch, tap, when and unless. Async-aware, zero dependencies."
  - - meta
    - property: og:type
      content: article
---

<!-- Generated from docs/functional.md by scripts/sync-docs.mjs. Edit that file, not this one. -->

# JavaScript functional programming utilities

_The `functional` module of [modern-fns](/), a dependency-free JavaScript and TypeScript
utility library._
```ts
import { pipe, debounce, memoize, tryCatch } from 'modern-fns';
import debounce from 'modern-fns/functional/debounce';
```

Composition, memoisation, rate limiting and safe execution. Small, unopinionated, and free of the
currying machinery that makes most FP libraries hard to read in a TypeScript codebase.

---

### `pipe(...fns)`

Compose left to right: `pipe(a, b, c)(x)` is `c(b(a(x)))`.

```ts
function pipe(...fns: Array<(value: never) => unknown>): (...args: unknown[]) => unknown;
```

```ts
const normalizeUsername = pipe(
  (s: string) => s.trim(),
  (s: string) => s.toLowerCase(),
  removeSpaces,
  (s: string) => truncate(s, 20),
);
normalizeUsername('  Vishnu M  '); // 'vishnum'
```

**Async-aware** — if any step returns a promise, the rest of the chain is awaited automatically
and the pipeline returns a promise. A fully synchronous pipeline stays synchronous: no accidental
microtask, no `await` where none is needed.

```ts
const loadUserName = pipe(
  fetchUser,
  (r: Response) => r.json(),
  (u: User) => u.name,
);
await loadUserName('/api/me');
```

**Edge cases** — the first function may take several arguments; later ones take one.
`pipe()(x)` returns `x`. Rejections propagate as normal promise rejections; wrap with
`asyncTryCatch` if you want a fallback.

**TypeScript** — typed overloads for up to five functions infer the chain end to end, including
the sync-versus-async return type. Beyond five, annotate the result.

---

### `compose(...fns)`

Right to left: `compose(a, b, c)(x)` is `a(b(c(x)))`. Async-aware, exactly like `pipe`.

```ts
const shout = compose(
  (s: string) => `${s}!`,
  (s: string) => s.toUpperCase(),
);
shout('hey'); // 'HEY!'
```

Use `pipe` for data-flow readability; use `compose` when mirroring mathematical notation or
porting existing FP code.

---

### `identity(value)` / `noop()`

```ts
identity(x); // x
noop(); // undefined
```

`identity` is the default iteratee for grouping and sorting; `noop` is a stable shared empty
callback, so a default prop does not allocate a new closure per render.

---

### `once(fn)`

```ts
function once<T extends (...args: never[]) => unknown>(fn: T): T;
```

```ts
const init = once(() => expensiveSetup());
init();
init(); // expensiveSetup ran once
```

**Edge cases** — later calls return the **first** result and ignore their arguments. If the first
call throws, the error is not cached and the next call retries. `this` is preserved.

**Use it for** — lazy initialisation that must survive React strict mode, HMR and
double-mounted components.

---

### `memoize(fn, options?)`

```ts
function memoize<T extends (...args: never[]) => unknown>(
  fn: T,
  options?: { resolver?: (...args: Parameters<T>) => unknown; maxSize?: number },
): T & { cache: Map<unknown, ReturnType<T>> };
```

```ts
const slugCache = memoize(slugify);
const fmt = memoize(formatRow, { maxSize: 100 });
fmt.cache.clear();
```

**Key strategy** — single-argument calls key on the argument itself (object arguments key by
reference, which is fast and predictable); multi-argument calls key on `JSON.stringify(args)`.
Pass a `resolver` when neither fits.

**Edge cases** — `undefined` results are cached. Rejected promises are cached too: delete the
entry to allow a retry. `maxSize` evicts the oldest entry. **Only memoize pure functions.**

---

### `debounce(fn, wait, options?)`

```ts
function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  wait?: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number },
): Debounced<T>;

interface Debounced<T> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
  pending(): boolean;
}
```

```ts
const search = debounce((q: string) => void fetchResults(q), 300);
input.addEventListener('input', (e) => search(e.target.value));
onUnmounted(() => search.cancel()); // required, or you set state on a dead component

const save = debounce(persist, 500, { maxWait: 2000 }); // progress during continuous typing
```

| Control     | Purpose                                                               |
| ----------- | --------------------------------------------------------------------- |
| `cancel()`  | Drop the pending call. Call it in `onUnmounted` / effect cleanup.     |
| `flush()`   | Run the pending call now, e.g. on form submit, and return its result. |
| `pending()` | Is a call queued? Useful for "saving…" indicators.                    |

**Edge cases** — `leading: false, trailing: true` by default. The wrapper returns the **previous**
result synchronously, not a promise. `this` is preserved, so `element.onScroll()` works.
`flush()` with nothing pending returns the last result without re-invoking.

**Mutability note** — the returned function is stateful by design. Create one per component
instance, not one per render.

---

### `throttle(fn, wait, options?)`

At most one call per `wait` ms, leading-edge by default so the first event is not delayed.

```ts
const onScroll = throttle(() => updateHeader(), 100);
window.addEventListener('scroll', onScroll, { passive: true });
onUnmounted(() => onScroll.cancel());
```

Implemented as `debounce` with `maxWait === wait`, so it exposes the same `cancel`, `flush` and
`pending` controls.

---

### `tryCatch(fn, fallback?)`

```ts
function tryCatch<T>(fn: () => T): T | undefined;
function tryCatch<T, F>(fn: () => T, fallback: F | ((error: unknown) => F)): T | F;
```

```ts
const config = tryCatch(() => JSON.parse(raw), {});
const port = tryCatch(
  () => new URL(input).port,
  (err) => {
    log(err);
    return '80';
  },
);
```

**Edge cases** — without a fallback, failures return `undefined`. The fallback may be a value or
a function receiving the error. Replaces the `JSON.parse` / `localStorage` / `new URL()`
try-catch blocks in every codebase.

---

### `asyncTryCatch(fn, fallback?)`

```ts
const user = await asyncTryCatch(() => api.getUser(id), null);
const list = await asyncTryCatch(
  () => api.list(),
  (err) => {
    report(err);
    return [];
  },
);
```

**Edge cases** — catches both rejections **and** synchronous throws inside the function, which a
bare `.catch()` misses. Always returns a promise. An async fallback is awaited.

---

### `tap(value, callback)`

```ts
function tap<T>(value: T, callback: (value: T) => void): T;
```

```ts
const total = pipe(getItems, (items) => tap(items, console.log), sum)(cart);
```

**Mutability note** — `tap` runs your callback; if that callback mutates the value, `tap` will
not stop it. Keep the callback side-effect-only.

---

### `when(condition, valueOrFn, otherwise?)` / `unless(...)`

```ts
function when<T, F>(condition: unknown, valueOrFn: T | (() => T), otherwise?: F | (() => F)): T | F;
```

```ts
const attrs = { ...base, ...when(isDisabled, { 'aria-disabled': 'true' }, {}) };
when(user.isAdmin, () => buildAdminMenu()); // menu or undefined
when(count > 0, `${count} items`, 'Empty');
unless(isLoggedIn, () => renderLoginPrompt());
```

**Edge cases** — the condition may be a boolean or a predicate function; branches may be values
or thunks, and **only the taken branch is evaluated**. With no `otherwise`, the untaken branch
gives `undefined`.

