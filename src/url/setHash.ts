import { formatAny, parseAny } from '../internal/url.js';

/**
 * Set the fragment. The `#` is optional and never doubled; an empty string removes it.
 *
 * @example
 * setHash('/docs?page=2', 'install');  // '/docs?page=2#install'
 * setHash('/docs#old', '#new');        // '/docs#new'
 * setHash('/docs#old', '');            // '/docs'
 */
export function setHash(url: string, hash: string): string {
  const parts = parseAny(url);
  const value = typeof hash === 'string' ? hash.replace(/^#+/, '') : '';
  parts.url.hash = value === '' ? '' : `#${value}`;
  return formatAny(parts, url);
}
export default setHash;
