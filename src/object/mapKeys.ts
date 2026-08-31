/**
 * Rename every key, keeping the values. The standard fix for snake_case APIs meeting
 * camelCase frontends.
 *
 * Later keys overwrite earlier ones if the iteratee collides.
 *
 * @example
 * mapKeys({ first_name: 'Vishnu' }, camelCase); // { firstName: 'Vishnu' }
 */
export function mapKeys<T extends object>(
  object: T,
  iteratee: (key: Extract<keyof T, string>, value: T[keyof T], object: T) => PropertyKey,
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  if (object == null || typeof object !== 'object') return result;
  for (const key of Object.keys(object) as Array<Extract<keyof T, string>>) {
    result[String(iteratee(key, object[key], object))] = object[key];
  }
  return result;
}

export default mapKeys;
