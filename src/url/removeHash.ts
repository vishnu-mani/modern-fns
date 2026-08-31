import { setHash } from './setHash.js';

/**
 * Strip the fragment from a URL.
 *
 * @example
 * removeHash('/docs?page=2#install'); // '/docs?page=2'
 */
export function removeHash(url: string): string {
  return setHash(url, '');
}
export default removeHash;
