/** Internal query-string engine shared by the `query` and `url` modules. */

import { isPlainObject } from './types.js';

/** A parsed query value. */
export type QueryValue =
  string | number | boolean | null | QueryValue[] | { [key: string]: QueryValue };

/** A parsed query object. */
export type QueryObject = Record<string, QueryValue>;

/** How repeated/array values are represented in the string form. */
export type ArrayFormat = 'repeat' | 'bracket' | 'comma' | 'index';

/** Options for parsing a query string. */
export interface ParseOptions {
  /** Convert clean numeric strings to numbers. Default `true`. */
  parseNumbers?: boolean;
  /** Convert `'true'`/`'false'` to booleans. Default `true`. */
  parseBooleans?: boolean;
  /** Interpret `a[b]=1` as a nested object. Default `true`. */
  nested?: boolean;
  /** Percent-decode keys and values. Default `true`. */
  decode?: boolean;
  /** Split values on commas into arrays. Default `false`. */
  comma?: boolean;
}

/** Options for serialising a query object. */
export interface StringifyOptions {
  /** Array representation. Default `'repeat'`. */
  arrayFormat?: ArrayFormat;
  /** Emit nested objects as `a[b]=1`. Default `true`. When `false`, objects are JSON-encoded. */
  nested?: boolean;
  /** Percent-encode keys and values. Default `true`. */
  encode?: boolean;
  /** Drop `null` values entirely instead of emitting `key=`. Default `false`. */
  skipNull?: boolean;
  /** Drop `''` values entirely. Default `false`. */
  skipEmpty?: boolean;
  /** Sort keys alphabetically — useful for cache keys and stable snapshots. Default `false`. */
  sort?: boolean;
  /** Prefix the result with `?` when non-empty. Default `false`. */
  addQueryPrefix?: boolean;
}

const NUMERIC_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

/** Strip `?`/`#` prefixes and any URL parts around the query. */
export function normalizeQueryString(input: string): string {
  if (typeof input !== 'string') return '';
  let value = input.trim();
  const hashIndex = value.indexOf('#');
  if (hashIndex !== -1) value = value.slice(0, hashIndex);
  const questionIndex = value.indexOf('?');
  if (questionIndex !== -1) value = value.slice(questionIndex + 1);
  else if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) || value.startsWith('/')) return '';
  return value.replace(/^[?&]+/, '');
}

function decodeComponent(value: string, decode: boolean): string {
  if (!decode) return value;
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function coerce(raw: string, options: ParseOptions): QueryValue {
  const { parseNumbers = true, parseBooleans = true } = options;
  if (parseBooleans) {
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  }
  if (parseNumbers && NUMERIC_RE.test(raw)) {
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && String(numeric) === raw) return numeric;
  }
  return raw;
}

/** Split `a[b][]` into `['a', 'b', '']`. */
function keySegments(key: string): string[] {
  const match = /^([^[\]]*)((?:\[[^[\]]*\])*)$/.exec(key);
  if (!match) return [key];
  const segments = [match[1]];
  const rest = match[2];
  if (rest) {
    const inner = rest.match(/\[([^[\]]*)\]/g) ?? [];
    for (const part of inner) segments.push(part.slice(1, -1));
  }
  return segments;
}

function assign(target: QueryObject, segments: string[], value: QueryValue): void {
  let cursor: Record<string, QueryValue> | QueryValue[] = target;

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;
    const nextSegment = segments[i + 1];

    if (segment === '' && Array.isArray(cursor)) {
      // `a[][b]` style — push a fresh container.
      const container: QueryValue = isLast
        ? value
        : nextSegment === '' || /^\d+$/.test(nextSegment)
          ? []
          : {};
      cursor.push(container);
      if (!isLast) cursor = container as Record<string, QueryValue> | QueryValue[];
      continue;
    }

    const key: string =
      segment === '' ? String(Array.isArray(cursor) ? cursor.length : 0) : segment;

    if (isLast) {
      const existing = (cursor as Record<string, QueryValue>)[key];
      if (existing === undefined) (cursor as Record<string, QueryValue>)[key] = value;
      else if (Array.isArray(existing)) existing.push(value);
      else (cursor as Record<string, QueryValue>)[key] = [existing, value];
      continue;
    }

    let child: QueryValue | undefined = (cursor as Record<string, QueryValue>)[key];
    if (child === undefined || (typeof child !== 'object' && child !== null) || child === null) {
      child = nextSegment === '' || /^\d+$/.test(nextSegment) ? [] : {};
      (cursor as Record<string, QueryValue>)[key] = child;
    }
    cursor = child;
  }
}

/** Parse a query string into a structured object. */
export function parseQuery(input: string, options: ParseOptions = {}): QueryObject {
  const { nested = true, decode = true, comma = false } = options;
  const result: QueryObject = {};
  const source = normalizeQueryString(input);
  if (source === '') return result;

  for (const pair of source.split('&')) {
    if (pair === '') continue;
    const separator = pair.indexOf('=');
    const rawKey = separator === -1 ? pair : pair.slice(0, separator);
    const rawValue = separator === -1 ? '' : pair.slice(separator + 1);
    const key = decodeComponent(rawKey, decode);
    if (key === '') continue;
    const decoded = decodeComponent(rawValue, decode);
    const value: QueryValue =
      comma && decoded.includes(',')
        ? decoded.split(',').map((part) => coerce(part, options))
        : coerce(decoded, options);

    if (!nested) {
      const existing = result[key];
      if (existing === undefined) result[key] = value;
      else if (Array.isArray(existing)) existing.push(value);
      else result[key] = [existing, value];
      continue;
    }
    assign(result, keySegments(key), value);
  }
  return result;
}

function encodeComponent(value: string, encode: boolean): string {
  return encode ? encodeURIComponent(value) : value;
}

function scalarToString(value: string | number | boolean | null): string {
  return value === null ? '' : String(value);
}

/** Serialise a structured object into a query string. */
export function stringifyQuery(object: unknown, options: StringifyOptions = {}): string {
  const {
    arrayFormat = 'repeat',
    nested = true,
    encode = true,
    skipNull = false,
    skipEmpty = false,
    sort = false,
    addQueryPrefix = false,
  } = options;

  if (object == null || typeof object !== 'object') return '';
  const pairs: string[] = [];

  const push = (key: string, value: string | number | boolean | null): void => {
    if (value === null && skipNull) return;
    const stringValue = scalarToString(value);
    if (stringValue === '' && skipEmpty) return;
    pairs.push(`${encodeKey(key, encode)}=${encodeComponent(stringValue, encode)}`);
  };

  const walk = (key: string, value: unknown): void => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      if (arrayFormat === 'comma') {
        const flat = value
          .filter((item) => item !== undefined && item !== null)
          .map((item) => scalarToString(item as string | number | boolean));
        if (flat.length > 0)
          pairs.push(
            `${encodeKey(key, encode)}=${flat.map((v) => encodeComponent(v, encode)).join(',')}`,
          );
        return;
      }
      value.forEach((item, index) => {
        const childKey =
          arrayFormat === 'bracket'
            ? `${key}[]`
            : arrayFormat === 'index'
              ? `${key}[${index}]`
              : key;
        walk(childKey, item);
      });
      return;
    }
    if (isPlainObject(value)) {
      if (!nested) {
        push(key, JSON.stringify(value));
        return;
      }
      for (const childKey of Object.keys(value)) walk(`${key}[${childKey}]`, value[childKey]);
      return;
    }
    if (value instanceof Date) {
      push(key, value.toISOString());
      return;
    }
    push(key, value as string | number | boolean | null);
  };

  const keys = Object.keys(object);
  if (sort) keys.sort();
  for (const key of keys) walk(key, (object as Record<string, unknown>)[key]);

  const query = pairs.join('&');
  return addQueryPrefix && query !== '' ? `?${query}` : query;
}

/** Encode a key but keep `[` and `]` readable. */
function encodeKey(key: string, encode: boolean): string {
  if (!encode) return key;
  return encodeURIComponent(key).replace(/%5B/g, '[').replace(/%5D/g, ']');
}
