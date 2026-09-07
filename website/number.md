---
title: "JavaScript Number Utilities — clamp, round, currency, abbreviate"
description: "Decimal-safe number helpers and Intl formatting: clamp, round, percentage, formatNumber, abbreviate (1.5M), currency, tax, discount and compound interest."
head:
  - - meta
    - name: keywords
      content: "javascript number utilities, format currency javascript, round decimals javascript, abbreviate number"
  - - meta
    - property: og:title
      content: "JavaScript Number Utilities — clamp, round, currency, abbreviate"
  - - meta
    - property: og:description
      content: "Decimal-safe number helpers and Intl formatting: clamp, round, percentage, formatNumber, abbreviate (1.5M), currency, tax, discount and compound interest."
  - - meta
    - property: og:type
      content: article
---

<!-- Generated from docs/number.md by scripts/sync-docs.mjs. Edit that file, not this one. -->

# JavaScript number utilities

_The `number` module of [modern-fns](/), a dependency-free JavaScript and TypeScript
utility library._
```ts
import { clamp, round, percentage, currency, abbreviate } from 'modern-fns';
import currency from 'modern-fns/number/currency';
```

Decimal-safe maths, business maths and `Intl` formatting with sane fallbacks.

---

### `clamp(value, min, max)`

```ts
function clamp(value: number, min: number, max: number): number;
```

```ts
clamp(150, 0, 100); // 100
clamp(-5, 0, 100); // 0
```

**Edge cases** — if `min > max` the bounds are swapped instead of returning nonsense. `NaN`
returns `NaN`; `Infinity` clamps to `max`.

---

### `round(value, decimals?)` / `floor` / `ceil`

Decimal-safe rounding.

```ts
function round(value: number, decimals?: number): number; // and floor, ceil
```

```ts
round(1.005, 2); // 1.01   (naive Math.round gives 1)
round(2.675, 2); // 2.68
round(1234, -2); // 1200
floor(1.999, 2); // 1.99
ceil(1.001, 2); // 1.01
```

**Why** — `Math.round(1.005 * 100) / 100` is `1`, because `1.005` is stored as `1.00499…`. These
shift by exponent instead of multiplying, so the intuitive answer comes out.

**Edge cases** — negative `decimals` round to tens, hundreds and so on. `NaN` and `Infinity` pass
through unchanged. Ties round half **up** toward `+Infinity` (`round(-2.5)` is `-2`), matching
`Math.round`.

---

### `percentage(value, total, decimals?)`

```ts
function percentage(value: number, total: number, decimals?: number): number;
```

```ts
percentage(25, 200); // 12.5
percentage(1, 3, 2); // 33.33
percentage(5, 0); // 0
```

**Edge cases** — a `total` of `0` returns `0`, not `NaN`/`Infinity`: "0 of 0" is 0% in a progress
bar. Non-finite input returns `0`.

---

### `percentageChange(oldValue, newValue)`

```ts
function percentageChange(oldValue: number, newValue: number): number;
```

```ts
percentageChange(200, 250); // 25
percentageChange(250, 200); // -20
percentageChange(-100, -50); // 50
```

**Edge cases** — both `0` gives `0`. Growth from `0` is mathematically undefined and returns
`Infinity`/`-Infinity`: check with `Number.isFinite` and render "New" in the UI. Non-finite input
gives `NaN`.

---

### `formatNumber(value, options?)`

```ts
function formatNumber(
  value: unknown,
  options?: Intl.NumberFormatOptions & {
    locale?: string | string[];
    decimals?: number;
    fallback?: string;
  },
): string;
```

```ts
formatNumber(1234567.891); // '1,234,567.891' (en-US)
formatNumber(1234567.891, { decimals: 2 }); // '1,234,567.89'
formatNumber(1234567, { locale: 'en-IN' }); // '12,34,567'
formatNumber(0.256, { style: 'percent' }); // '26%'
formatNumber(null, { fallback: '—' }); // '—'
```

**Edge cases** — accepts anything and returns `fallback` (default `''`) for `null`, `''`, `NaN`,
`Infinity` and unparseable strings, so a missing API field cannot render `NaN`. `decimals` is
shorthand for both fraction-digit options. Every native `Intl.NumberFormat` option passes
through, including `notation: 'compact'`.

---

### `abbreviate(value, options?)`

```ts
function abbreviate(
  value: number,
  options?: { decimals?: number; units?: string[]; space?: boolean },
): string;
```

```ts
abbreviate(1500000); // '1.5M'
abbreviate(999); // '999'
abbreviate(-2500); // '-2.5K'
abbreviate(1234, { decimals: 2 }); // '1.23K'
abbreviate(1500, { space: true }); // '1.5 K'
```

**Edge cases** — deliberately **locale-independent** so snapshots and tests are stable; use
`formatNumber(value, { notation: 'compact' })` for localised compact notation. Rounds toward zero
(`abbreviate(1999)` is `'1.9K'`), so a count never reads higher than it is. Trailing zeros are
dropped. Values beyond the last unit keep scaling it (`1e15` → `'1000T'`). Non-finite input
returns `''`.

---

### `currency(value, currency, locale?, options?)`

```ts
function currency(
  value: unknown,
  currencyCode: string,
  locale?: string | string[],
  options?: Omit<Intl.NumberFormatOptions, 'style' | 'currency'> & { fallback?: string },
): string;
```

```ts
currency(1299.5, 'INR'); // '₹1,299.50'
currency(1299.5, 'INR', 'en-IN'); // '₹1,299.50'
currency(1299.5, 'USD', 'de-DE'); // '1.299,50 $'
currency(1000, 'JPY', 'en-US'); // '¥1,000'  (zero-decimal currency)
```

**Edge cases** — defaults to the **runtime locale**; pass one explicitly wherever output must be
stable (tests, PDFs, emails). An invalid currency code returns `fallback` rather than throwing.
`null`, `''` and `NaN` return `fallback` (default `''`).

---

### `random(min?, max?, options?)`

```ts
function random(
  min?: number,
  max?: number,
  options?: { float?: boolean; source?: () => number },
): number;
```

```ts
random(1, 6); // 1..6 inclusive
random(0, 1, { float: true }); // 0.something
random(1, 6, { source: () => 0.5 }); // deterministic in tests
```

**Edge cases** — **inclusive at both ends** for integers, which is what "between 1 and 6" means.
Swapped bounds are normalised. A range containing no integer (e.g. `1.2` to `1.8`) returns `NaN`.
Not cryptographically secure — use `crypto.getRandomValues` for tokens.

---

### `range(start, end?, step?)`

Re-exported from [`array/range`](./array.md#rangestart-end-step) — the same function.

---

### `isNumeric(value)`

```ts
function isNumeric(value: unknown): boolean;
```

```ts
isNumeric('42'); // true
isNumeric(''); // false — Number('') is 0
isNumeric(null); // false — Number(null) is 0
isNumeric([]); // false — Number([]) is 0
isNumeric('1,000'); // false — use toNumber for formatted input
```

**Edge cases** — rejects `NaN` and `Infinity`, and every value `Number()` silently coerces to a
number. This is the guard that stops `''` becoming `0` in form validation.

---

### `toNumber(value, defaultValue?)`

Re-exported from [`value/toNumber`](./value.md#tonumbervalue-defaultvalue) — use it for
**formatted** input (`'₹1,299.50'`), and `isNumeric` for validation.

---

### `tax(value, percentage, decimals?)` / `discount(value, percentage, decimals?)`

Both return the **resulting amount**, not the delta.

```ts
function tax(value: number, percentage: number, decimals?: number): number;
function discount(value: number, percentage: number, decimals?: number): number;
```

```ts
tax(1000, 18); // 1180
tax(1000, 18) - 1000; // 180 — the tax component
discount(1000, 10); // 900
discount(100, 150); // 0 — clamped, never negative
```

**Edge cases** — rounded to `decimals` (default `2`) so line-item maths does not accumulate
floating-point dust. Non-finite input returns `NaN`. A discount above 100% clamps at `0` for
positive amounts.

---

### `compoundInterest(principal, rate, periods, years, decimals?)`

Returns the **final amount**, `P(1 + r/n)^(n·t)`.

```ts
function compoundInterest(
  principal: number,
  rate: number,
  periods: number,
  years: number,
  decimals?: number,
): number;
```

| Parameter   | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| `principal` | Starting amount.                                                         |
| `rate`      | Annual rate as a **percentage** (`7.5`, not `0.075`).                    |
| `periods`   | Compounding periods per year: `12` monthly, `4` quarterly, `1` annually. |
| `years`     | Number of years; fractional years allowed.                               |

```ts
compoundInterest(1000, 5, 1, 2); // 1102.5
compoundInterest(1000, 5, 1, 2) - 1000; // 102.5 interest earned
compoundInterest(100000, 7.5, 12, 10); // 211206.46
```

**Edge cases** — `periods <= 0` returns `NaN`; a `rate` of `0` returns the principal; non-finite
input returns `NaN`.

