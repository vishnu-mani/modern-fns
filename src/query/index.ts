/**
 * Query-string utilities.
 *
 * These names (`get`, `set`, `parse`, …) are intentionally **not** flat-exported from the
 * package root, where they would collide with the `object` module. Use the namespace or a
 * subpath import:
 *
 * ```ts
 * import { query } from 'modern-fns';
 * import parse from 'modern-fns/query/parse';
 * ```
 *
 * @module query
 */
export { parse } from './parse.js';
export { stringify } from './stringify.js';
export { get } from './get.js';
export { set } from './set.js';
export { remove } from './remove.js';
export { merge } from './merge.js';
export { has } from './has.js';
export { toggle, type ToggleOptions } from './toggle.js';
export { parseNumber } from './parseNumber.js';
export { parseBoolean } from './parseBoolean.js';
export { parseArray, type ParseArrayOptions } from './parseArray.js';
export type {
  QueryObject,
  QueryValue,
  ParseOptions,
  StringifyOptions,
  ArrayFormat,
} from '../internal/query.js';
