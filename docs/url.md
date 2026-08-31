# `url`

```ts
import { setQuery, mergeQuery, parseUrl, joinUrl } from 'modern-fns';
import setQuery from 'modern-fns/url/setQuery';
```

Every function accepts **absolute**, **protocol-relative** and **relative** URLs, and returns the
same shape it received — a relative URL in, a relative URL out. `new URL()` throws on relative
input; these do not.

Query values are parsed and serialised by the [`query`](./query.md) engine, so arrays, nested
objects and encoding behave identically in both modules.

---

### `parseUrl(url, options?)`

Decompose a URL, with the query already parsed.

```ts
function parseUrl(url: string, options?: ParseOptions): ParsedUrl;

interface ParsedUrl {
  protocol: string; // 'https' — no colon; '' when relative
  hostname: string;
  port: string;
  host: string; // 'shop.com:8080'
  origin: string;
  pathname: string; // always starts with '/'
  search: string; // '?a=1' or ''
  query: QueryObject; // { a: 1 }
  hash: string; // '#top' or ''
  username: string;
  password: string;
  isAbsolute: boolean;
  href: string;
}
```

```ts
parseUrl('https://shop.com:8080/p?page=2&tags=a&tags=b#reviews');
// { protocol: 'https', hostname: 'shop.com', port: '8080', pathname: '/p',
//   query: { page: 2, tags: ['a', 'b'] }, hash: '#reviews', isAbsolute: true, ... }

parseUrl('/products?page=2').isAbsolute; // false
```

**Edge cases** — protocol-relative input (`//cdn.com/a.js`) is absolute with an empty `protocol`.
Malformed input degrades to a relative path instead of throwing. `''` yields `pathname: '/'`.

---

### `buildUrl(options)`

```ts
function buildUrl(options: {
  protocol?: string;
  host?: string;
  port?: string | number;
  path?: string;
  query?: Record<string, unknown>;
  hash?: string;
  base?: string;
  queryOptions?: StringifyOptions;
}): string;
```

```ts
buildUrl({ host: 'api.shop.com', path: '/v1/products', query: { page: 2, tags: ['a', 'b'] } });
// 'https://api.shop.com/v1/products?page=2&tags=a&tags=b'

buildUrl({ path: '/products', query: { page: 2 }, hash: 'top' }); // '/products?page=2#top'
buildUrl({ base: 'https://api.com/v1', path: 'users', query: { a: 1 } });
// 'https://api.com/v1/users?a=1'
```

**Edge cases** — `protocol` defaults to `https` when a `host` is given; without a host the result
is relative. `base` wins over `protocol`/`host` and resolves `path` against it. A `port` is
ignored when `host` already includes one. `{}` returns `''`.

---

### `getQuery(url, key, options?)` / `getQueryParams(url, options?)`

```ts
getQuery('/products?page=2', 'page'); // 2
getQueryParams('/products?page=2&tags=a&tags=b'); // { page: 2, tags: ['a', 'b'] }
```

**Edge cases** — missing keys are `undefined`; a URL with no query yields `{}`. Values are
coerced by the [`query` parse rules](./query.md#parsequerystring-options).

---

### `setQuery(url, key, value, options?)` / `setQueryParams(url, params, options?)`

```ts
setQuery('/products?page=2', 'sort', 'price'); // '/products?page=2&sort=price'
setQuery('/products?page=2', 'page', 3); // '/products?page=3'
setQuery('/p#top', 'a', 1); // '/p?a=1#top'
setQuery('/p', 'tags', ['a', 'b']); // '/p?tags=a&tags=b'
setQueryParams('/products?page=2&sort=price', { page: 1 }); // '/products?page=1'
```

**Edge cases** — `setQuery` keeps the path, the other parameters, their order and the hash;
existing keys are replaced in place, new keys appended. Passing `undefined` removes the key.
`setQueryParams` **replaces** the whole query (`{}` clears it) — use `mergeQuery` to keep the
rest.

---

### `mergeQuery(url, params, options?)`

```ts
mergeQuery('/p?page=2&sort=price', { page: 3, q: 'shoes' }); // '/p?page=3&sort=price&q=shoes'
mergeQuery('/p?page=2&sort=price', { sort: undefined }); // '/p?page=2'
```

**Edge cases** — `undefined` values delete their key, which makes "apply this filter patch to the
current URL" one call. A nullish `params` is a no-op.

---

### `removeQuery(url, key)` / `hasQuery(url, key)`

```ts
removeQuery('/p?page=2&sort=price', 'sort'); // '/p?page=2'
removeQuery('/p?a=1&b=2&c=3', ['a', 'c']); // '/p?b=2'
hasQuery('/p?q=', 'q'); // true — present but empty
```

**Edge cases** — removing the last parameter drops the `?` entirely. Removing a missing key is a
no-op.

---

### `setHash(url, hash)` / `removeHash(url)`

```ts
setHash('/docs?page=2', 'install'); // '/docs?page=2#install'
setHash('/docs#old', '#new'); // '/docs#new'
removeHash('/docs?page=2#install'); // '/docs?page=2'
```

**Edge cases** — the leading `#` is optional and never doubled; an empty string removes the
fragment.

---

### `isSameUrl(urlA, urlB, options?)`

Compare URLs semantically rather than as strings.

```ts
function isSameUrl(
  urlA: string,
  urlB: string,
  options?: {
    ignoreQueryOrder?: boolean; // default true
    ignoreTrailingSlash?: boolean; // default true
    ignoreHash?: boolean; // default false
    ignoreQuery?: boolean; // default false
  },
): boolean;
```

```ts
isSameUrl('/p?a=1&b=2', '/p/?b=2&a=1'); // true
isSameUrl('https://x.com/p', 'https://x.com:443/p'); // true — default port
isSameUrl('/p#a', '/p#b'); // false
isSameUrl('/p#a', '/p#b', { ignoreHash: true }); // true
```

**Edge cases** — a relative URL never equals an absolute one, even if the paths match. Origins are
compared including protocol and normalised port. Non-string input returns `false`.

**Use it for** — active-nav-link checks and "did the route really change?" guards.

---

### `joinUrl(...parts)`

```ts
function joinUrl(...parts: Array<string | number | null | undefined>): string;
```

```ts
joinUrl('https://api.com/', '/v1/', 'users'); // 'https://api.com/v1/users'
joinUrl('/base', 'a', 'b/'); // '/base/a/b/'
joinUrl('https://api.com', 'search?q=1'); // 'https://api.com/search?q=1'
joinUrl('/a?x=1', 'b?y=2'); // '/a/b?x=1&y=2'
```

**Edge cases** — exactly one slash between parts, never a doubled one and never a missing one.
Empty and nullish parts are skipped. Query strings and fragments found on any part are collected
and moved to the end. A trailing slash on the final part is preserved. No parts returns `''`.
