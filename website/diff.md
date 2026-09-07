---
title: "JavaScript Object Diff — deep diff, dirty checking and PATCH bodies"
description: "Compute a structural diff between two JavaScript objects. Detect added, removed and changed paths for form dirty checking, audit logs, API PATCH payloads and undo/redo."
head:
  - - meta
    - name: keywords
      content: "javascript object diff, deep diff, compare two objects javascript, json diff"
  - - meta
    - property: og:title
      content: "JavaScript Object Diff — deep diff, dirty checking and PATCH bodies"
  - - meta
    - property: og:description
      content: "Compute a structural diff between two JavaScript objects. Detect added, removed and changed paths for form dirty checking, audit logs, API PATCH payloads and undo/redo."
  - - meta
    - property: og:type
      content: article
---

<!-- Generated from docs/diff.md by scripts/sync-docs.mjs. Edit that file, not this one. -->

# JavaScript object diff

_The `diff` module of [modern-fns](/), a dependency-free JavaScript and TypeScript
utility library._
```ts
import { diff, changed, patch } from 'modern-fns';
import { invert } from 'modern-fns/diff/patch';
import diff from 'modern-fns/diff/diff';
```

A structural diff of two values, as a flat, serialisable change list. This is the module behind
form dirty-checking, audit logs, `PATCH` bodies, state synchronisation and undo/redo.

## The `Change` type

```ts
type Change =
  | { path: string; type: 'added'; newValue: unknown }
  | { path: string; type: 'removed'; oldValue: unknown }
  | { path: string; type: 'changed'; oldValue: unknown; newValue: unknown };
```

`path` uses the same notation the [`object`](./object.md) module accepts, so `get`, `set`,
`unset` and `patch` all understand it. Keys that are not valid identifiers are quoted:
`"['a.b']"`.

---

### `diff(oldObject, newObject, options?)`

```ts
function diff(oldObject: unknown, newObject: unknown, options?: DiffOptions): Change[];

interface DiffOptions {
  arrays?: 'index' | 'whole' | 'key'; // default 'index'
  key?: string | ((item: unknown) => PropertyKey);
  equals?: (a: unknown, b: unknown, path: string) => boolean | undefined;
  maxDepth?: number;
  ignore?: (path: string) => boolean;
}
```

| Option            | Description                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arrays: 'index'` | Recurse position by position. Tail length changes become `added`/`removed`. Best for ordered lists.                                                |
| `arrays: 'whole'` | Treat each array as one atomic value: a single `changed` entry.                                                                                    |
| `arrays: 'key'`   | Match items by `key` regardless of position. Best for collections of records. Requires `key`.                                                      |
| `key`             | Property name or function giving item identity, for `arrays: 'key'`.                                                                               |
| `equals`          | Custom comparison. Return `true`/`false` to decide, `undefined` to fall through to the default. Receives the path, so rules can be field-specific. |
| `maxDepth`        | Stop recursing below this depth and report the subtree as one change.                                                                              |
| `ignore`          | Return `true` to skip a path entirely, e.g. `updatedAt`.                                                                                           |

```ts
diff({ name: 'John', age: 28 }, { name: 'Vishnu', age: 29, city: 'Kochi' });
// [
//   { path: 'name', type: 'changed', oldValue: 'John', newValue: 'Vishnu' },
//   { path: 'age',  type: 'changed', oldValue: 28, newValue: 29 },
//   { path: 'city', type: 'added',   newValue: 'Kochi' },
// ]

diff(before, after, { ignore: (path) => path.endsWith('updatedAt') });

diff(before, after, {
  equals: (a, b, path) =>
    path === 'email' && typeof a === 'string' && typeof b === 'string'
      ? a.toLowerCase() === b.toLowerCase()
      : undefined,
});

diff({ items: [...] }, { items: [...] }, { arrays: 'key', key: 'id' });
```

**Returns** `Change[]` — empty when the values are deep-equal.

**Edge cases** — comparing two non-objects produces one change at path `''`. `undefined` versus a
value at the root is reported as `added`. Type changes (`1` → `[1]`) are one `changed` entry.
Dates, `Map`s and `Set`s are compared by `isEqual` and reported atomically. Neither input is
mutated.

**TypeScript** — `Change` is a discriminated union on `type`, so narrowing gives you exactly the
fields that exist:

```ts
for (const change of diff(before, after)) {
  if (change.type === 'added') console.log(change.newValue); // no oldValue in scope
}
```

---

### `changed(oldObject, newObject, options?)`

```ts
function changed(oldObject: unknown, newObject: unknown, options?: DiffOptions): boolean;
```

```ts
const isDirty = changed(pristine, form);
const isDirtyIgnoringMeta = changed(pristine, form, {
  ignore: (path) => path.startsWith('meta.'),
});
```

**Edge cases** — takes the same options as `diff`; returns `false` for deep-equal values.

---

### `patch(object, changes)`

Apply a change list, immutably.

```ts
function patch<T>(object: T, changes: readonly Change[]): T;
```

```ts
const changes = diff(before, after);
patch(before, changes); // structurally equal to `after`
```

**Edge cases** — `removed` changes are applied last and from the highest index down, so array
splices do not shift each other. A change at path `''` replaces the whole value. An empty or
nullish change list returns the input reference unchanged.

---

### `invert(changes)`

Reverse a change list so it can undo an edit.

```ts
function invert(changes: readonly Change[]): Change[];
```

```ts
patch(after, invert(diff(before, after))); // back to `before`
```

**Edge cases** — `added` becomes `removed` and vice versa; `changed` swaps its values. Inverting
twice returns the original list.

---

## Recipes

**Form dirty state**

```ts
const isDirty = computed(() => changed(pristine.value, form.value));
```

**Minimal PATCH body**

```ts
const body = Object.fromEntries(
  diff(pristine, form)
    .filter((change) => change.type !== 'removed')
    .map((change) => [change.path, change.newValue]),
);
```

**Audit log**

```ts
diff(before, after, { ignore: (p) => p === 'updatedAt' }).map((change) => ({
  field: change.path,
  action: change.type,
  from: 'oldValue' in change ? change.oldValue : undefined,
  to: 'newValue' in change ? change.newValue : undefined,
  at: new Date().toISOString(),
}));
```

**Undo/redo stack**

```ts
const undoStack: Change[][] = [];
function commit(next: State) {
  undoStack.push(invert(diff(state, next)));
  state = next;
}
function undo() {
  const changes = undoStack.pop();
  if (changes) state = patch(state, changes);
}
```

