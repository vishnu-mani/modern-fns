import {
  parseQuery,
  stringifyQuery,
  type QueryValue,
  type StringifyOptions,
} from '../internal/query.js';
import { hadPrefix, withPrefix } from './internal.js';

/** Options for {@link toggle}. */
export interface ToggleOptions extends StringifyOptions {
  /** Value written when the key is being switched on. Default `true`. */
  value?: QueryValue;
}

/**
 * Flip a key on or off — the exact operation behind "toggle this filter chip" URLs.
 *
 * @example
 * toggle('?page=2', 'inStock');            // '?page=2&inStock=true'
 * toggle('?page=2&inStock=true', 'inStock') // '?page=2'
 * toggle('', 'dark', { value: 1 });        // 'dark=1'
 */
export function toggle(queryString: string, key: string, options: ToggleOptions = {}): string {
  const { value = true, ...stringifyOptions } = options;
  const parsed = parseQuery(queryString);
  if (Object.prototype.hasOwnProperty.call(parsed, key)) delete parsed[key];
  else parsed[key] = value;
  return withPrefix(stringifyQuery(parsed, stringifyOptions), hadPrefix(queryString));
}
export default toggle;
