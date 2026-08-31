# `array`

```ts
import { chunk, groupBy, diffArray } from 'modern-fns';
import chunk from 'modern-fns/array/chunk';
```

Every function here is **immutable** — the input array is never sorted, spliced or reordered in
place. Anywhere a `selector` is accepted it may be a property name (`'id'`) or a function
(`(item) => item.id`).

---

### `chunk(array, size)`

Split an array into consecutive groups of `size`. The final group holds the remainder.

```ts
function chunk<T>(array: readonly T[], size: number): T[][];
```

| Parameter | Type           | Description                               |
| --------- | -------------- | ----------------------------------------- |
| `array`   | `readonly T[]` | Source array. Never mutated.              |
| `size`    | `number`       | Items per chunk; truncated to an integer. |

**Returns** `T[][]` — a new array of new arrays.

```ts
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
chunk([1, 2, 3, 4], 2); // [[1, 2], [3, 4]]
```

**Edge cases** — `[]`, a non-array, `size < 1`, `NaN` or `Infinity` all return `[]`.

**TypeScript** — `chunk(users, 10)` infers `User[][]`.

---

### `unique(array)`

Remove duplicates, keeping the first occurrence and the original order. Uses SameValueZero, so
`NaN` de-duplicates correctly where `indexOf` fails.

```ts
function unique<T>(array: readonly T[]): T[];
```

```ts
unique([3, 1, 3, 2, 1]); // [3, 1, 2]
unique([NaN, NaN]); // [NaN]
```

**Edge cases** — objects compare by reference (use `uniqueBy` for structural identity);
non-array input returns `[]`.

**TypeScript** — `unique<string>(tags)` returns `string[]`.

---

### `uniqueBy(array, selector)`

Remove duplicates by a derived key, keeping the first occurrence.

```ts
function uniqueBy<T>(array: readonly T[], selector: keyof T | ((item: T) => PropertyKey)): T[];
```

```ts
uniqueBy(users, 'email');
uniqueBy(files, (f) => f.name.toLowerCase());
```

**Edge cases** — nullish items yield an `undefined` key with a property selector and are treated
as one group; non-array input returns `[]`.

**TypeScript** — the property selector is constrained to `keyof T`, so typos are compile errors.

---

### `groupBy(array, selector)`

Group items into a record keyed by a property or derived value.

```ts
function groupBy<T>(
  array: readonly T[],
  selector: keyof T | ((item: T) => PropertyKey),
): Record<string, T[]>;
```

```ts
groupBy(users, 'role'); // { admin: [...], editor: [...] }
groupBy(orders, (o) => o.date.slice(0, 7)); // { '2026-08': [...] }
```

**Edge cases** — keys are stringified. Groups keep insertion order except that integer-like keys
follow JavaScript's numeric-key ordering (`'2'` before `'10'`). The result has a `null`
prototype, so a `'__proto__'` key is safe. Empty or non-array input returns `{}`.

**TypeScript** — returns `Record<string, T[]>`; narrow with your own union type if the key set is
known.

---

### `indexBy(array, selector)`

Build a lookup table keyed by a property or derived value. On duplicate keys the **last** item
wins.

```ts
function indexBy<T>(
  array: readonly T[],
  selector: keyof T | ((item: T) => PropertyKey),
): Record<string, T>;
```

```ts
const byId = indexBy(users, 'id');
byId['2']; // the user with id 2
```

**Edge cases** — same key handling as `groupBy`. Use `groupBy` when duplicates matter.

**TypeScript** — `Record<string, User>`; index access is `User`, so guard for missing ids.

---

### `partition(array, predicate)`

Split into `[matching, notMatching]` in one pass.

```ts
function partition<T>(
  array: readonly T[],
  predicate: (item: T, index: number) => boolean,
): [T[], T[]];
```

```ts
const [active, inactive] = partition(users, (u) => u.isActive);
```

**Edge cases** — empty or non-array input returns `[[], []]`.

**TypeScript** — the tuple return destructures with correct types; no `| undefined`.

---

### `sortBy(array, selector)`

Return a **new** array sorted ascending by a derived value. Stable, and never mutates — unlike
`Array.prototype.sort`.

```ts
function sortBy<T>(array: readonly T[], selector: keyof T | ((item: T) => unknown)): T[];
```

```ts
sortBy(users, 'age');
sortBy(files, (f) => f.name.toLowerCase());
```

**Edge cases** — `null`/`undefined` keys sort last; `NaN` sorts last; strings use
`localeCompare`; `Date` compares chronologically; booleans sort `false` first; values that
cannot be ordered as text compare equal, and stability preserves their original order.

**TypeScript** — `sortBy(users, 'age')` keeps `User[]`.

---

### `orderBy(array, selectors, directions?)`

Sort by several keys with independent directions. Stable and immutable.

```ts
function orderBy<T>(
  array: readonly T[],
  selectors: ReadonlyArray<keyof T | ((item: T) => unknown)>,
  directions?: readonly ('asc' | 'desc')[],
): T[];
```

```ts
orderBy(users, ['role', 'age'], ['asc', 'desc']);
orderBy(rows, [(r) => r.total], ['desc']);
```

**Edge cases** — missing directions default to `'asc'`; an empty `selectors` array returns a
copy; comparison rules match `sortBy`.

**TypeScript** — selectors may mix property names and functions in one array.

---

### `flatten(array)` / `flattenDeep(array)`

Flatten one level, or every level.

```ts
function flatten<T>(array: readonly (T | readonly T[])[]): T[];
function flattenDeep<T>(array: NestedArray<T>): T[];
```

```ts
flatten([1, [2, 3], [4]]); // [1, 2, 3, 4]
flatten([[[1]], [2]]); // [[1], 2]
flattenDeep([1, [2, [3, [4, [5]]]]]); // [1, 2, 3, 4, 5]
```

**Edge cases** — `flattenDeep` is iterative, so it survives thousands of nesting levels where a
recursive version overflows the stack. Non-array input returns `[]`.

**TypeScript** — `flattenDeep<number>(input)` when inference cannot see through the nesting.

---

### `compact(array)`

Remove all falsy values: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`.

```ts
function compact<T>(array: readonly T[]): Exclude<T, null | undefined | false | 0 | ''>[];
```

```ts
compact([0, 1, false, 2, '', 3, null]); // [1, 2, 3]
```

**Edge cases** — `0` and `''` are removed. If you only want to drop nullish values, use
`array.filter((v) => v != null)`.

**TypeScript** — `compact(list)` on `(string | null)[]` narrows to `string[]`, so no
non-null assertions downstream.

---

### `difference(array, other, selector?)` / `intersection(array, other, selector?)` / `union(...arrays)`

Set operations that keep source order.

```ts
function difference<T>(array: readonly T[], other: readonly T[], selector?): T[];
function intersection<T>(array: readonly T[], other: readonly T[], selector?): T[];
function union<T>(...arrays: ReadonlyArray<readonly T[] | null | undefined>): T[];
```

```ts
difference([1, 2, 3], [2]); // [1, 3]
difference(oldUsers, newUsers, 'id'); // objects compared by id
intersection([1, 2, 2, 3], [2, 3, 4]); // [2, 3]
union([1, 2], [2, 3], [3, 4]); // [1, 2, 3, 4]
```

**Edge cases** — without a selector, comparison is SameValueZero, so objects compare by
reference. `difference` keeps duplicates from the first array; `intersection` and `union`
de-duplicate. Nullish arguments are treated as empty.

**TypeScript** — the selector is `keyof T | ((item: T) => PropertyKey)`.

---

### `zip(...arrays)` / `unzip(array)`

Transpose between rows and columns.

```ts
function zip<T extends ReadonlyArray<readonly unknown[]>>(...arrays: T): Zipped<T>[];
function unzip<T>(array: ReadonlyArray<readonly T[]>): T[][];
```

```ts
zip([1, 2], ['a', 'b']); // [[1, 'a'], [2, 'b']]
zip([1, 2, 3], ['a']); // [[1, 'a'], [2, undefined], [3, undefined]]
unzip([
  [1, 'a'],
  [2, 'b'],
]); // [[1, 2], ['a', 'b']]
```

**Edge cases** — `zip` pads to the **longest** input rather than truncating to the shortest, so
data is never silently dropped. `zip(...unzip(rows))` round-trips.

**TypeScript** — `zip` is tuple-aware: `zip([1], ['a'])` is `[number | undefined, string |
undefined][]`.

---

### `first(array)` / `last(array)`

```ts
function first<T>(array: readonly T[]): T | undefined;
function last<T>(array: readonly T[]): T | undefined;
```

```ts
first([1, 2, 3]); // 1
last([1, 2, 3]); // 3
```

**Edge cases** — empty or non-array input returns `undefined`.

**Note** — the root export (`import { first } from 'modern-fns'`) is the container-agnostic
[`collection/first`](./collection.md), which also handles objects, `Map` and `Set`. Import
`modern-fns/array/first` for the array-only version.

---

### `take(array, count?)` / `takeRight` / `drop` / `dropRight`

Slice from either end. `count` defaults to `1`.

```ts
take([1, 2, 3], 2); // [1, 2]
takeRight([1, 2, 3], 2); // [2, 3]
drop([1, 2, 3], 1); // [2, 3]
dropRight([1, 2, 3], 1); // [1, 2]
```

**Edge cases** — counts are clamped: negative or zero counts take nothing / drop nothing;
oversized counts take or drop everything. Non-array input returns `[]`.

**TypeScript** — element type is preserved.

---

### `range(start, end?, step?)`

Build a numeric range, end-exclusive.

```ts
function range(start: number, end?: number, step?: number): number[];
```

```ts
range(4); // [0, 1, 2, 3]
range(1, 4); // [1, 2, 3]
range(0, 10, 2.5); // [0, 2.5, 5, 7.5]
range(3, 0, -1); // [3, 2, 1]
```

**Edge cases** — with one argument the range starts at `0`. A `step` of `0`, a non-finite bound,
or a direction that can never reach `end` returns `[]` instead of hanging. `range(3, 0)` infers a
step of `-1`.

**Also exported as** `modern-fns/number/range` — the same function, not a copy.

---

### `window(array, size)` / `slidingWindow(array, size)`

Sliding windows of `size` consecutive items, step 1.

```ts
function window<T>(array: readonly T[], size: number): T[][];
const slidingWindow = window; // same function, non-shadowing name
```

> In browser code prefer `slidingWindow`: a named import called `window` shadows the DOM global
> for the whole module.

```ts
window([1, 2, 3, 4], 2); // [[1, 2], [2, 3], [3, 4]]
window(prices, 7).map(average); // 7-point moving average
```

**Edge cases** — returns `[]` when the array is shorter than the window, or when `size < 1`.

**TypeScript** — `T[][]`.

---

### `diffArray(oldArray, newArray, key?, options?)`

Compare two lists and report what was added, removed, updated and unchanged.

```ts
function diffArray<T>(
  oldArray: readonly T[],
  newArray: readonly T[],
  key?: keyof T | ((item: T) => PropertyKey),
  options?: { withChanges?: boolean; equals?; ignore? },
): ArrayDiff<T>;

interface ArrayDiff<T> {
  added: T[];
  removed: T[];
  updated: Array<{ key: PropertyKey; before: T; after: T; changes: Change[] }>;
  unchanged: T[];
}
```

| Parameter                           | Type                               | Description                                    |
| ----------------------------------- | ---------------------------------- | ---------------------------------------------- |
| `oldArray`                          | `readonly T[]`                     | Previous state.                                |
| `newArray`                          | `readonly T[]`                     | Next state.                                    |
| `key`                               | `keyof T \| (item) => PropertyKey` | Item identity. Omit for primitive lists.       |
| `options.withChanges`               | `boolean`                          | Compute field-level `changes`. Default `true`. |
| `options.equals` / `options.ignore` | see [`diff`](./diff.md)            | Passed through when computing `changes`.       |

```ts
diffArray(oldUsers, newUsers, 'id');
// {
//   added:     [{ id: 4, ... }],
//   removed:   [{ id: 2, ... }],
//   updated:   [{ key: 1, before, after, changes: [{ path: 'name', type: 'changed', ... }] }],
//   unchanged: [{ id: 3, ... }],
// }

diffArray([1, 2, 3], [2, 3, 4]);
// { added: [4], removed: [1], updated: [], unchanged: [2, 3] }
```

**Edge cases**

- **With a `key`**, reordering is not a change, and an edited item appears once in `updated`
  rather than as a removal plus an addition.
- **Without a `key`**, items are matched by deep equality as a multiset, and `updated` is always
  empty — there is no way to tell an edit from a replacement.
- Duplicate keys: the last item with a given key wins in the old list.
- Nullish inputs are treated as empty arrays.
- The returned arrays hold the **original item references**; nothing is cloned or mutated.

**TypeScript** — `ArrayDiff<User>` throughout, and `updated[i].changes` is `Change[]` from the
`diff` module.
