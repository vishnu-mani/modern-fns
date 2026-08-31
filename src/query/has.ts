import { parseQuery } from '../internal/query.js';

/**
 * Is the key present, even with an empty value?
 *
 * @example
 * has('?q=&page=2', 'q');       // true
 * has('?page=2', 'q');          // false
 */
export function has(queryString: string, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(parseQuery(queryString), key);
}
export default has;
