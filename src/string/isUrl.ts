/** Options for {@link isUrl}. */
export interface IsUrlOptions {
  /** Allowed protocols, without the colon. Default `['http', 'https']`. */
  protocols?: string[];
  /** Accept protocol-relative (`//host`) and scheme-less (`example.com`) input. Default `false`. */
  allowRelative?: boolean;
  /** Require a dot in the hostname, rejecting `http://localhost`. Default `false`. */
  requireTld?: boolean;
}

/**
 * Validate a URL using the platform `URL` parser rather than a fragile regex.
 *
 * By default only absolute `http(s)` URLs pass, which is what "is this link safe to render?"
 * usually means — `javascript:` and `data:` URLs are rejected.
 *
 * @example
 * isUrl('https://example.com/path?q=1');           // true
 * isUrl('javascript:alert(1)');                    // false
 * isUrl('ftp://example.com', { protocols: ['ftp'] }); // true
 * isUrl('example.com', { allowRelative: true });   // true
 */
export function isUrl(value: unknown, options: IsUrlOptions = {}): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed === '' || /\s/.test(trimmed)) return false;

  const { protocols = ['http', 'https'], allowRelative = false, requireTld = false } = options;
  const candidate =
    allowRelative && !/^[a-z][a-z0-9+.-]*:/i.test(trimmed)
      ? `https://${trimmed.replace(/^\/\//, '')}`
      : trimmed;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return false;
  }
  if (!protocols.includes(url.protocol.replace(/:$/, ''))) return false;
  if (url.hostname === '') return false;
  if (requireTld && !url.hostname.includes('.')) return false;
  return true;
}
export default isUrl;
