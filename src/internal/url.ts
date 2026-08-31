/** Internal relative-safe URL parsing shared by the `url` module. */

/** Sentinel origin used to parse relative URLs with the platform parser. */
export const RELATIVE_BASE = 'http://modern-fns.invalid';

/** A parsed URL that remembers whether it was relative. */
export interface UrlParts {
  url: URL;
  /** `true` when the input had no scheme and no authority. */
  isRelative: boolean;
  /** `true` when the input started with `//`. */
  isProtocolRelative: boolean;
}

/**
 * Parse absolute, protocol-relative and relative URLs. Throws only when the input is not a
 * string; malformed input degrades to a path.
 */
export function parseAny(input: string): UrlParts {
  const value = typeof input === 'string' ? input.trim() : '';
  const isProtocolRelative = value.startsWith('//');
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value);

  if (hasScheme) {
    try {
      return { url: new URL(value), isRelative: false, isProtocolRelative: false };
    } catch {
      /* fall through to relative handling */
    }
  }
  if (isProtocolRelative) {
    try {
      return { url: new URL(`http:${value}`), isRelative: false, isProtocolRelative: true };
    } catch {
      /* fall through */
    }
  }
  // Collapse leading slashes so an input like '//' cannot be read as an empty authority.
  const base = `/${value.replace(/^\/+/, '')}`;
  try {
    return { url: new URL(base, RELATIVE_BASE), isRelative: true, isProtocolRelative: false };
  } catch {
    return {
      url: new URL(`/${encodeURIComponent(value)}`, RELATIVE_BASE),
      isRelative: true,
      isProtocolRelative: false,
    };
  }
}

/** Render a parsed URL back to the same shape (relative in, relative out). */
export function formatAny(parts: UrlParts, original: string): string {
  const { url, isRelative, isProtocolRelative } = parts;
  if (isProtocolRelative) return url.href.replace(/^https?:/, '');
  if (!isRelative) return url.href;

  const trimmed = typeof original === 'string' ? original.trim() : '';
  const startedWithSlash = trimmed.startsWith('/');
  let path = `${url.pathname}${url.search}${url.hash}`;
  if (!startedWithSlash) path = path.replace(/^\//, '');
  return path;
}
