import { getQueryParams } from './getQueryParams.js';

/**
 * Is a query parameter present, even with an empty value?
 *
 * @example
 * hasQuery('/p?q=', 'q');    // true
 * hasQuery('/p?a=1', 'q');   // false
 */
export function hasQuery(url: string, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(getQueryParams(url), key);
}
export default hasQuery;
