---
'modern-fns': minor
---

Initial release: 145 utilities across ten modules, with zero runtime dependencies, ESM + CJS
builds, per-function subpath exports and complete TypeScript declarations.

- **array** — `chunk`, `unique`, `uniqueBy`, `groupBy`, `indexBy`, `partition`, `sortBy`,
  `orderBy`, `flatten`, `flattenDeep`, `compact`, `difference`, `intersection`, `union`, `zip`,
  `unzip`, `first`, `last`, `take`, `takeRight`, `drop`, `dropRight`, `range`, `window`
  (`slidingWindow`), `diffArray`
- **object** — `get`, `set`, `has`, `unset`, `pick`, `omit`, `deepClone`, `deepMerge`,
  `deepMergeWith`, `mapValues`, `mapKeys`, `isEqual`, `isEmpty`, `flattenObject`,
  `unflattenObject`
- **diff** — `diff`, `changed`, `patch`, `invert`
- **string** — `capitalize`, `capitalizeWords`, `camelCase`, `pascalCase`, `kebabCase`,
  `snakeCase`, `constantCase`, `slugify`, `truncate`, `truncateWords`, `initials`, `mask`,
  `stripHtml`, `stripWhitespace`, `removeSpaces`, `normalizeWhitespace`, `escapeHtml`,
  `unescapeHtml`, `isEmail`, `isUrl`, `extractNumbers`, `extractEmails`
- **number** — `clamp`, `round`, `floor`, `ceil`, `percentage`, `percentageChange`,
  `formatNumber`, `abbreviate`, `currency`, `random`, `range`, `isNumeric`, `toNumber`, `tax`,
  `discount`, `compoundInterest`
- **url** — `parseUrl`, `buildUrl`, `getQuery`, `getQueryParams`, `setQuery`, `setQueryParams`,
  `removeQuery`, `mergeQuery`, `hasQuery`, `setHash`, `removeHash`, `isSameUrl`, `joinUrl`
- **query** — `parse`, `stringify`, `get`, `set`, `remove`, `merge`, `has`, `toggle`,
  `parseNumber`, `parseBoolean`, `parseArray` (namespace and subpath imports only)
- **value** — `toString`, `toNumber`, `toBoolean`, `toArray`, `toDate`, `toObject`, `isNull`,
  `isUndefined`, `isNil`, `isString`, `isNumber`, `isBoolean`, `isArray`, `isObject`,
  `isFunction`, `isEmpty`, `defaultTo`, `nullable`, `coalesce`
- **functional** — `pipe`, `compose`, `identity`, `noop`, `once`, `memoize`, `debounce`,
  `throttle`, `tryCatch`, `asyncTryCatch`, `tap`, `when`, `unless`
- **collection** — `size`, `first`, `last`, `isEmpty`, `each`, `map`, `filter`, `find`, `some`,
  `every`
