/**
 * modern-fns — modular, immutable, tree-shakeable utilities for JavaScript and TypeScript.
 *
 * Three ways to import, all tree-shakeable:
 *
 * ```ts
 * import { chunk, groupBy, diff } from 'modern-fns';        // recommended
 * import chunk from 'modern-fns/array/chunk';               // maximally explicit
 * import { array, query } from 'modern-fns';                // namespaces
 * ```
 *
 * The `query` module is namespace-only at the root: its `get`/`set`/`parse` names would
 * collide with the `object` module. Reach it via `query.parse(...)` or
 * `modern-fns/query/parse`.
 *
 * @packageDocumentation
 */

/* ── namespaces ─────────────────────────────────────────────────────────────────────── */
export * as array from './array/index.js';
export * as object from './object/index.js';
export * as string from './string/index.js';
export * as number from './number/index.js';
export * as url from './url/index.js';
export * as query from './query/index.js';
export * as value from './value/index.js';
export * as functional from './functional/index.js';
export * as collection from './collection/index.js';

/* ── array ──────────────────────────────────────────────────────────────────────────── */
export { chunk } from './array/chunk.js';
export { unique } from './array/unique.js';
export { uniqueBy } from './array/uniqueBy.js';
export { groupBy } from './array/groupBy.js';
export { indexBy } from './array/indexBy.js';
export { partition } from './array/partition.js';
export { sortBy } from './array/sortBy.js';
export { orderBy } from './array/orderBy.js';
export { flatten } from './array/flatten.js';
export { flattenDeep } from './array/flattenDeep.js';
export { compact } from './array/compact.js';
export { difference } from './array/difference.js';
export { intersection } from './array/intersection.js';
export { union } from './array/union.js';
export { zip, type Zipped } from './array/zip.js';
export { unzip } from './array/unzip.js';
export { take } from './array/take.js';
export { takeRight } from './array/takeRight.js';
export { drop } from './array/drop.js';
export { dropRight } from './array/dropRight.js';
export { range } from './array/range.js';
export { window, slidingWindow } from './array/window.js';
export {
  diffArray,
  type ArrayDiff,
  type UpdatedEntry,
  type DiffArrayOptions,
} from './array/diffArray.js';

/* ── object ─────────────────────────────────────────────────────────────────────────── */
export { get } from './object/get.js';
export { set } from './object/set.js';
export { has } from './object/has.js';
export { unset } from './object/unset.js';
export { pick } from './object/pick.js';
export { omit } from './object/omit.js';
export { deepClone } from './object/deepClone.js';
export { deepMerge, deepMergeWith, type DeepMergeOptions } from './object/deepMerge.js';
export { mapValues } from './object/mapValues.js';
export { mapKeys } from './object/mapKeys.js';
export { isEqual } from './object/isEqual.js';
export { flattenObject, type FlattenOptions } from './object/flattenObject.js';
export { unflattenObject } from './object/unflattenObject.js';

/* ── diff ───────────────────────────────────────────────────────────────────────────── */
export { diff, type DiffOptions } from './diff/diff.js';
export { changed } from './diff/changed.js';
export { patch, invert } from './diff/patch.js';

/* ── string ─────────────────────────────────────────────────────────────────────────── */
export { capitalize } from './string/capitalize.js';
export { capitalizeWords } from './string/capitalizeWords.js';
export { camelCase } from './string/camelCase.js';
export { pascalCase } from './string/pascalCase.js';
export { kebabCase } from './string/kebabCase.js';
export { snakeCase } from './string/snakeCase.js';
export { constantCase } from './string/constantCase.js';
export { slugify, type SlugifyOptions } from './string/slugify.js';
export { truncate, type TruncateOptions } from './string/truncate.js';
export { truncateWords } from './string/truncateWords.js';
export { initials, type InitialsOptions } from './string/initials.js';
export { mask, type MaskOptions } from './string/mask.js';
export { stripHtml } from './string/stripHtml.js';
export { stripWhitespace } from './string/stripWhitespace.js';
export { removeSpaces } from './string/removeSpaces.js';
export { normalizeWhitespace } from './string/normalizeWhitespace.js';
export { escapeHtml } from './string/escapeHtml.js';
export { unescapeHtml } from './string/unescapeHtml.js';
export { isEmail } from './string/isEmail.js';
export { isUrl, type IsUrlOptions } from './string/isUrl.js';
export { extractNumbers } from './string/extractNumbers.js';
export { extractEmails } from './string/extractEmails.js';

/* ── number ─────────────────────────────────────────────────────────────────────────── */
export { clamp } from './number/clamp.js';
export { round } from './number/round.js';
export { floor } from './number/floor.js';
export { ceil } from './number/ceil.js';
export { percentage } from './number/percentage.js';
export { percentageChange } from './number/percentageChange.js';
export { formatNumber, type FormatNumberOptions } from './number/formatNumber.js';
export { abbreviate, type AbbreviateOptions } from './number/abbreviate.js';
export { currency, type CurrencyOptions } from './number/currency.js';
export { random, type RandomOptions } from './number/random.js';
export { isNumeric } from './number/isNumeric.js';
export { tax } from './number/tax.js';
export { discount } from './number/discount.js';
export { compoundInterest } from './number/compoundInterest.js';

/* ── url ────────────────────────────────────────────────────────────────────────────── */
export { parseUrl, type ParsedUrl } from './url/parseUrl.js';
export { buildUrl, type BuildUrlOptions } from './url/buildUrl.js';
export { getQuery } from './url/getQuery.js';
export { getQueryParams } from './url/getQueryParams.js';
export { setQuery } from './url/setQuery.js';
export { setQueryParams } from './url/setQueryParams.js';
export { removeQuery } from './url/removeQuery.js';
export { mergeQuery } from './url/mergeQuery.js';
export { hasQuery } from './url/hasQuery.js';
export { setHash } from './url/setHash.js';
export { removeHash } from './url/removeHash.js';
export { isSameUrl, type IsSameUrlOptions } from './url/isSameUrl.js';
export { joinUrl } from './url/joinUrl.js';

/* ── value ──────────────────────────────────────────────────────────────────────────── */
export { toString } from './value/toString.js';
export { toNumber } from './value/toNumber.js';
export { toBoolean } from './value/toBoolean.js';
export { toArray } from './value/toArray.js';
export { toDate } from './value/toDate.js';
export { toObject } from './value/toObject.js';
export { isNull } from './value/isNull.js';
export { isUndefined } from './value/isUndefined.js';
export { isNil } from './value/isNil.js';
export { isString } from './value/isString.js';
export { isNumber } from './value/isNumber.js';
export { isBoolean } from './value/isBoolean.js';
export { isArray } from './value/isArray.js';
export { isObject } from './value/isObject.js';
export { isFunction } from './value/isFunction.js';
export { defaultTo } from './value/defaultTo.js';
export { nullable } from './value/nullable.js';
export { coalesce } from './value/coalesce.js';

/* ── functional ─────────────────────────────────────────────────────────────────────── */
export { pipe } from './functional/pipe.js';
export { compose } from './functional/compose.js';
export { identity } from './functional/identity.js';
export { noop } from './functional/noop.js';
export { once } from './functional/once.js';
export { memoize, type MemoizeOptions, type Memoized } from './functional/memoize.js';
export { debounce, type DebounceOptions, type Debounced } from './functional/debounce.js';
export { throttle } from './functional/throttle.js';
export { tryCatch } from './functional/tryCatch.js';
export { asyncTryCatch } from './functional/asyncTryCatch.js';
export { tap } from './functional/tap.js';
export { when } from './functional/when.js';
export { unless } from './functional/unless.js';

/* ── collection (also provides `first`, `last`, `isEmpty`, `size`) ──────────────────── */
export { size } from './collection/size.js';
export { first } from './collection/first.js';
export { last } from './collection/last.js';
export { isEmpty } from './collection/isEmpty.js';
export { each } from './collection/each.js';
export { map } from './collection/map.js';
export { filter } from './collection/filter.js';
export { find } from './collection/find.js';
export { some } from './collection/some.js';
export { every } from './collection/every.js';
export type { Collection, CollectionKey } from './internal/collection.js';

/* ── shared types ───────────────────────────────────────────────────────────────────── */
export type {
  Path,
  Json,
  PlainObject,
  Selector,
  SortDirection,
  NestedArray,
  Change,
  ChangeType,
  AnyFunction,
} from './types.js';
export type { QueryObject, QueryValue } from './internal/query.js';
