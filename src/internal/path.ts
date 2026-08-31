/** Internal property-path tokeniser shared by the `object` and `diff` modules. */

import type { Path } from '../types.js';

export type PathSegment = string | number;

const TOKEN_RE =
  /\[\s*(-?\d+)\s*\]|\[\s*'((?:\\.|[^'\\])*)'\s*\]|\[\s*"((?:\\.|[^"\\])*)"\s*\]|([^.[\]]+)/g;

const cache = new Map<string, PathSegment[]>();
const CACHE_LIMIT = 512;

/**
 * Turn `"users[0].address['zip.code']"` into `['users', 0, 'address', 'zip.code']`.
 * Array input is returned as a defensive copy.
 */
export function parsePath(path: Path): PathSegment[] {
  if (Array.isArray(path)) return path.slice() as PathSegment[];
  const source = path as string;
  if (source === '') return [];

  const cached = cache.get(source);
  if (cached) return cached.slice();

  const segments: PathSegment[] = [];
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(source)) !== null) {
    if (match[1] !== undefined) segments.push(Number(match[1]));
    else if (match[2] !== undefined) segments.push(match[2].replace(/\\(.)/g, '$1'));
    else if (match[3] !== undefined) segments.push(match[3].replace(/\\(.)/g, '$1'));
    else if (match[4] !== undefined) segments.push(match[4].trim());
  }

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(source, segments);
  return segments.slice();
}

/** Inverse of {@link parsePath}: `['a', 0, 'b']` becomes `"a[0].b"`. */
export function formatPath(segments: readonly PathSegment[]): string {
  let out = '';
  for (const segment of segments) {
    if (typeof segment === 'number') {
      out += `[${segment}]`;
    } else if (/^[A-Za-z_$][\w$]*$/.test(segment)) {
      out += out === '' ? segment : `.${segment}`;
    } else {
      out += `['${segment.replace(/(['\\])/g, '\\$1')}']`;
    }
  }
  return out;
}

/** Append one segment to a formatted path string. */
export function joinPath(base: string, segment: PathSegment): string {
  if (typeof segment === 'number') return `${base}[${segment}]`;
  if (base === '') return formatPath([segment]);
  return /^[A-Za-z_$][\w$]*$/.test(segment)
    ? `${base}.${segment}`
    : `${base}['${segment.replace(/(['\\])/g, '\\$1')}']`;
}
