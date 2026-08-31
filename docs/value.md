# `value`

```ts
import { toNumber, toBoolean, isNil, defaultTo } from 'modern-fns';
import toNumber from 'modern-fns/value/toNumber';
```

Coercion and type guards for input you do not control: query strings, form fields, env vars,
`localStorage`, CSV cells and loosely typed APIs.

**Two rules hold everywhere in this module.**

1. Nothing throws. Unusable input returns a caller-supplied default.
2. No silent surprises. Every conversion is documented as a table; anything ambiguous falls back
   rather than guessing.

---

### `toString(value, defaultValue?)`

```ts
function toString(value: unknown, defaultValue?: string): string;
```

| Input                | Output                                         |
| -------------------- | ---------------------------------------------- |
| `'abc'`              | `'abc'`                                        |
| `123`, `true`, `10n` | `'123'`, `'true'`, `'10'`                      |
| `null`, `undefined`  | `defaultValue` (default `''`) — never `'null'` |
| `NaN`, `Infinity`    | `defaultValue`                                 |
| `[1, 2]`             | `'1,2'`                                        |
| `{ a: 1 }`           | `'{"a":1}'` — never `'[object Object]'`        |
| `Date`               | ISO string (invalid dates use the default)     |
| `Symbol`, `Function` | `defaultValue`                                 |
| circular object      | `defaultValue`                                 |

```ts
toString(null); // ''
toString({ a: 1 }); // '{"a":1}'
toString(undefined, '—'); // '—'
```

---

### `toNumber(value, defaultValue?)`

```ts
function toNumber(value: unknown): number;
function toNumber<D>(value: unknown, defaultValue: D): number | D;
```

| Input                                                             | Output                         |
| ----------------------------------------------------------------- | ------------------------------ |
| `42`, `'42'`, `' 42 '`                                            | `42`                           |
| `'1,299.50'`, `'₹1,299.50'`, `'$1,299.50'`                        | `1299.5`                       |
| `'1.299,50'` (European)                                           | `1299.5`                       |
| `'50%'`                                                           | `50`                           |
| `'1e3'`, `'.5'`, `'0x10'`                                         | `1000`, `0.5`, `16`            |
| `true` / `false`                                                  | `1` / `0`                      |
| `Date`                                                            | epoch milliseconds             |
| `''`, `'abc'`, `null`, `undefined`, `[]`, `{}`, `NaN`, `Infinity` | `defaultValue` (default `NaN`) |

**Separator rule** — when both `.` and `,` appear, the **last** one is the decimal separator.
When only `,` appears it is a thousands separator if followed by exactly three digits
(`'1,500'` → `1500`), otherwise a decimal separator (`'1,5'` → `1.5`).

```ts
toNumber('₹1,299.50'); // 1299.5
toNumber('abc', 0); // 0
```

**TypeScript** — with a default, the return is `number | typeof defaultValue`; without one it is
`number` (possibly `NaN`).

---

### `toBoolean(value, defaultValue?)`

```ts
function toBoolean(value: unknown, defaultValue?: boolean): boolean;
```

| Input                                                                    | Output                           |
| ------------------------------------------------------------------------ | -------------------------------- |
| `true` / `false`                                                         | as-is                            |
| `'true'`, `'1'`, `'yes'`, `'y'`, `'on'`, `'enabled'` (any case, trimmed) | `true`                           |
| `'false'`, `'0'`, `'no'`, `'n'`, `'off'`, `'disabled'`, `''`             | `false`                          |
| finite numbers                                                           | `true` when non-zero             |
| `null`, `undefined`, unknown strings, objects                            | `defaultValue` (default `false`) |

```ts
toBoolean('false'); // false — where Boolean('false') is true
toBoolean('maybe', true); // true (fallback)
```

---

### `toArray(value)`

```ts
function toArray<T>(value: T | readonly T[] | null | undefined): T[];
```

| Input                                | Output                                                  |
| ------------------------------------ | ------------------------------------------------------- |
| `[1, 2]`                             | the same array reference (nothing is copied or mutated) |
| `null`, `undefined`                  | `[]`                                                    |
| `'abc'`                              | `['abc']` — **not** split into characters               |
| `Set`, `Map`, generators, `NodeList` | spread (`Map` yields entries)                           |
| `{ a: 1 }`, `42`, `true`             | `[value]`                                               |

```ts
toArray(response.data ?? null).map(render); // always safe
```

---

### `toDate(value, defaultValue?)`

```ts
function toDate(value: unknown): Date | undefined;
function toDate<D>(value: unknown, defaultValue: D): Date | D;
```

| Input                                              | Output                                        |
| -------------------------------------------------- | --------------------------------------------- |
| valid `Date`                                       | a **copy**, so the original cannot be mutated |
| `1700000000000`                                    | epoch milliseconds                            |
| `1700000000` (10 digits)                           | epoch **seconds**, auto-detected              |
| `'2026-08-31'`, ISO strings, numeric strings       | parsed                                        |
| invalid `Date`, `''`, `'not a date'`, `null`, `{}` | `defaultValue` (default `undefined`)          |

```ts
toDate('2026-08-31')?.getUTCFullYear(); // 2026
toDate(null, new Date(0)); // 1970-01-01
```

**Edge case** — the seconds/milliseconds heuristic keys off magnitude (`< 1e11` is seconds). Pass
milliseconds explicitly if you work with pre-1973 timestamps.

---

### `toObject(value, defaultValue?)`

```ts
function toObject(value: unknown, defaultValue?: Record<string, unknown>): Record<string, unknown>;
```

| Input                         | Output                                   |
| ----------------------------- | ---------------------------------------- |
| `{ a: 1 }`                    | the same object                          |
| `'{"a":1}'`                   | parsed JSON, when it parses to an object |
| `Map`, `URLSearchParams`      | entries as an object                     |
| `[['a', 1]]`                  | `{ a: 1 }`                               |
| `[1, 2]`                      | `{ '0': 1, '1': 2 }`                     |
| anything else, malformed JSON | `defaultValue` (default `{}`)            |

```ts
toObject(localStorage.getItem('prefs')); // {} when absent or malformed
```

---

### Type guards

```ts
isNull(value); // value === null only
isUndefined(value); // value === undefined only
isNil(value); // null or undefined — the one you usually want
isString(value); // string primitives
isNumber(value); // finite numbers only: NaN and Infinity are false
isBoolean(value);
isArray(value); // typed Array.isArray
isObject(value); // plain objects only: not arrays, Date, Map, class instances or null
isFunction(value); // includes classes, generators and async functions
```

Every one is a TypeScript type predicate, so it narrows:

```ts
if (isString(input)) input.trim(); // input: string
const clean = list.filter(isNumber); // number[]
```

**Design notes** — `isNumber(NaN)` is `false` because `NaN` is not a number you can compute with.
`isObject` answers "is this a data bag I can iterate?", so it excludes arrays and class instances.

---

### `isEmpty(value)`

```ts
function isEmpty(value: unknown): boolean;
```

| Empty                                                                    | Not empty                                            |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| `null`, `undefined`, `''`, `'   '`, `[]`, `{}`, empty `Map`/`Set`, `NaN` | `0`, `false`, `'a'`, `[0]`, `{ a: 1 }`, `new Date()` |

`0` and `false` are values, not absences — that is deliberate, and it is the bug people hit with
`if (!value)`.

Re-exported unchanged as `object/isEmpty` and `collection/isEmpty`.

---

### `defaultTo(value, defaultValue)`

```ts
function defaultTo<T, D>(value: T | null | undefined, defaultValue: D): NonNullable<T> | D;
```

```ts
defaultTo(props.count, 0);
defaultTo(Number('abc'), 0); // 0 — where ?? gives NaN
defaultTo(0, 5); // 0 — falsy values are kept
```

**Versus `??`** — identical for nullish values, plus it catches `NaN`.

---

### `nullable(value)`

```ts
function nullable<T>(value: T): NonNullable<T> | null;
```

```ts
nullable(form.middleName); // '' -> null
nullable(0); // 0
```

**Why** — `JSON.stringify` drops `undefined` keys entirely, so a "clear this field" edit silently
becomes a no-op. Converting blanks to `null` sends the clear.

---

### `coalesce(...values)`

```ts
function coalesce<T>(...values: Array<T | null | undefined>): T | undefined;
```

```ts
coalesce(user.nickname, user.firstName, 'Anonymous');
coalesce(...fallbacks);
```

**Edge cases** — a variadic `??`: `0`, `''` and `false` are returned, not skipped. All-nullish
input returns `undefined`.
