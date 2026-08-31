import { words } from '../internal/words.js';

/**
 * Convert any casing to `PascalCase`.
 *
 * @example
 * pascalCase('user_first_name'); // 'UserFirstName'
 * pascalCase('my-component');    // 'MyComponent'
 */
export function pascalCase(value: string): string {
  if (typeof value !== 'string') return '';
  return words(value)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
export default pascalCase;
