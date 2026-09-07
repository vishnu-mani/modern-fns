---
title: "JavaScript String Utilities — slugify, camelCase, truncate, mask"
description: "Unicode-aware string helpers for JavaScript and TypeScript: slugify, camelCase, kebabCase, snakeCase, truncate, initials, mask, stripHtml, escapeHtml, isEmail."
head:
  - - meta
    - name: keywords
      content: "javascript string utilities, slugify javascript, camelcase converter, truncate string"
  - - meta
    - property: og:title
      content: "JavaScript String Utilities — slugify, camelCase, truncate, mask"
  - - meta
    - property: og:description
      content: "Unicode-aware string helpers for JavaScript and TypeScript: slugify, camelCase, kebabCase, snakeCase, truncate, initials, mask, stripHtml, escapeHtml, isEmail."
  - - meta
    - property: og:type
      content: article
---

<!-- Generated from docs/string.md by scripts/sync-docs.mjs. Edit that file, not this one. -->

# JavaScript string utilities

_The `string` module of [modern-fns](/), a dependency-free JavaScript and TypeScript
utility library._
```ts
import { slugify, truncate, mask, camelCase } from 'modern-fns';
import slugify from 'modern-fns/string/slugify';
```

Every function accepts a `string` and tolerates `null`/`undefined`/non-strings by returning `''`
(or `[]` for the `extract*` pair) rather than throwing. Character handling is unicode-aware: the
converters, `truncate`, `initials` and `mask` count by code point, so emoji and non-Latin scripts
are never cut in half.

---

### `capitalize(value)` / `capitalizeWords(value)`

```ts
capitalize('hello world'); // 'Hello world'
capitalizeWords('hello vue world'); // 'Hello Vue World'
capitalizeWords('  spaced   out  '); // '  Spaced   Out  '
```

**Signatures** — `(value: string) => string`.

**Edge cases** — `capitalizeWords` preserves the original spacing and punctuation instead of
re-joining on single spaces. Neither lower-cases the rest of the word.

---

### `camelCase` / `pascalCase` / `kebabCase` / `snakeCase` / `constantCase`

One unicode-aware word splitter behind all five, so they agree with each other and round-trip.

```ts
function camelCase(value: string): string; // and the other four
```

| Input             | camel            | pascal           | kebab              | snake              | constant           |
| ----------------- | ---------------- | ---------------- | ------------------ | ------------------ | ------------------ |
| `user_first_name` | `userFirstName`  | `UserFirstName`  | `user-first-name`  | `user_first_name`  | `USER_FIRST_NAME`  |
| `XMLHttpRequest`  | `xmlHttpRequest` | `XmlHttpRequest` | `xml-http-request` | `xml_http_request` | `XML_HTTP_REQUEST` |
| `hello world 42`  | `helloWorld42`   | `HelloWorld42`   | `hello-world-42`   | `hello_world_42`   | `HELLO_WORLD_42`   |

**Edge cases** — acronym runs split correctly (`XMLHttp` → `XML`, `Http`); digits attach to the
preceding word (`user2` is one word); punctuation-only input returns `''`; the functions are
idempotent.

**TypeScript** — `mapKeys(apiResponse, camelCase)` is the usual pairing.

---

### `slugify(value, options?)`

```ts
function slugify(
  value: string,
  options?: { separator?: string; lower?: boolean; maxLength?: number },
): string;
```

```ts
slugify('Hello Vue World!'); // 'hello-vue-world'
slugify('Café & Bar — 2026'); // 'cafe-and-bar-2026'
slugify('Straße'); // 'strasse'
slugify('Hello World', { separator: '_' }); // 'hello_world'
slugify('one two three four', { maxLength: 11 }); // 'one-two'
```

**Edge cases** — diacritics are folded to ASCII, `&` becomes `and`, `ß`/`æ`/`œ`/`ø`/`ł`/`þ` are
transliterated, and punctuation and emoji are dropped. `maxLength` trims on a separator boundary
where possible. **Scripts with no ASCII equivalent** (Chinese, Arabic, Devanagari) reduce to `''`
— always keep a fallback such as the record id.

---

### `truncate(value, length, options?)` / `truncateWords(value, wordCount, options?)`

```ts
function truncate(
  value: string,
  length: number,
  options?: { omission?: string; separator?: string | RegExp },
): string;
function truncateWords(value: string, wordCount: number, options?: { omission?: string }): string;
```

```ts
truncate('The quick brown fox', 10); // 'The quick…'  (exactly 10 chars)
truncate('The quick brown fox', 10, { separator: ' ' }); // 'The…'
truncate('abcdefgh', 6, { omission: '...' }); // 'abc...'
truncateWords('The quick brown fox jumps', 3); // 'The quick brown…'
```

**Edge cases** — `length` **includes** the omission, so the result never exceeds the width you
budgeted. Strings already short enough are returned unchanged. A `length` of `0` or less returns
`''`. Emoji are never split. `truncateWords` trims the input and collapses whitespace when
counting.

---

### `initials(value, options?)`

```ts
function initials(value: string, options?: { max?: number; uppercase?: boolean }): string;
```

```ts
initials('Vishnu M'); // 'VM'
initials('john ronald reuel tolkien'); // 'JT'
initials('mary-jane watson'); // 'MW'
initials('Vishnu M', { max: 1 }); // 'V'
```

**Edge cases** — with the default `max: 2` it takes the **first and last** parts, skipping middle
names; `max: 1` takes the first. Splits on whitespace, `.`, `_` and `-`; leading punctuation is
stripped; punctuation-only or blank input returns `''`. Unicode-safe (`Ángel Ñuñez` → `ÁÑ`).

---

### `mask(value, options?)`

```ts
function mask(
  value: string,
  options?: {
    visible?: number; // default 4
    from?: 'start' | 'end'; // default 'end'
    maskChar?: string; // default '*'
    maskLength?: number; // fixed mask width
  },
): string;
```

```ts
mask('9876543210', { visible: 4 }); // '******3210'
mask('4111111111111111', { visible: 4, maskLength: 4 }); // '****1111'
mask('secret', { visible: 2, from: 'start' }); // 'se****'
```

**Edge cases** — when the value is shorter than `visible`, **everything** is masked rather than
leaking the value. Empty or non-string input returns `''`. This is a display helper, not
redaction: mask on the server before logging.

---

### `stripHtml` / `stripWhitespace` / `removeSpaces` / `normalizeWhitespace`

```ts
stripHtml('<p>Hello <b>world</b></p>'); // 'Hello world'
stripHtml('<script>alert(1)</script>Safe'); // 'Safe'
stripWhitespace(' 4111 1111 1111 1111 '); // '4111111111111111'
removeSpaces('a b\tc\nd'); // 'ab\tc\nd'
normalizeWhitespace('  Hello \n\t world  '); // 'Hello world'
```

**Edge cases** — `stripHtml` removes `<script>`/`<style>` **with** their contents and drops HTML
comments, but it is **not a sanitiser**: never feed its output back into `innerHTML`. `stripWhitespace`
removes every unicode space; `removeSpaces` removes only ASCII spaces, keeping line structure;
`normalizeWhitespace` collapses runs to one space and trims — the fix for text pasted from Word,
Slack or a PDF.

---

### `escapeHtml(value)` / `unescapeHtml(value)`

```ts
escapeHtml('<script>alert("x")</script>'); // '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
unescapeHtml('caf&#233;'); // 'café'
```

**Edge cases** — `escapeHtml` covers `&`, `<`, `>`, `"` and `'`. `unescapeHtml` also decodes
numeric entities (`&#38;`, `&#x26;`) and leaves unknown entities untouched. `&nbsp;` decodes to a
real non-breaking space (U+00A0) — follow with `normalizeWhitespace` if you want it collapsed.
The pair round-trips.

---

### `isEmail(value)` / `isUrl(value, options?)`

```ts
function isEmail(value: unknown): boolean;
function isUrl(
  value: unknown,
  options?: { protocols?: string[]; allowRelative?: boolean; requireTld?: boolean },
): boolean;
```

```ts
isEmail('vishnu+tag@example.co.in'); // true
isEmail('user@localhost'); // false — no TLD
isUrl('https://example.com/path?q=1'); // true
isUrl('javascript:alert(1)'); // false
isUrl('example.com', { allowRelative: true }); // true
```

**Edge cases** — `isEmail` is pragmatic, not RFC 5322: it accepts plus-addressing and unicode
locals, rejects spaces, consecutive dots, over-long locals (>64) and over-long addresses (>254),
and trims first. `isUrl` uses the platform `URL` parser, defaults to `http`/`https` only (so
`javascript:` and `data:` are rejected), and validates the hostname. Validation is not
verification.

---

### `extractNumbers(value)` / `extractEmails(value)`

```ts
extractNumbers('Order #123 total ₹1,299.50, -5 items'); // [123, 1299.5, -5]
extractEmails('Mail a@x.com or B@X.COM, also a@x.com'); // ['a@x.com', 'b@x.com']
```

**Edge cases** — `extractNumbers` understands thousands separators, decimals and negatives.
`extractEmails` strips trailing punctuation, lower-cases, de-duplicates and validates each match
with `isEmail`. Both return `[]` for non-strings and for no matches.

