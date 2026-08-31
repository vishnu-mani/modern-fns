/**
 * Transform every value of an object, keeping the keys. The object equivalent of
 * `Array.prototype.map` — the single most-missed method on `Object`.
 *
 * @example
 * mapValues({ a: 1, b: 2 }, (n) => n * 2);         // { a: 2, b: 4 }
 * mapValues(form, (v, k) => `${k}:${String(v)}`);
 */
export function mapValues<T extends object, R>(
  object: T,
  iteratee: (value: T[keyof T], key: Extract<keyof T, string>, object: T) => R,
): { [K in keyof T]: R } {
  const result = {} as { [K in keyof T]: R };
  if (object == null || typeof object !== 'object') return result;
  for (const key of Object.keys(object) as Array<Extract<keyof T, string>>) {
    result[key] = iteratee(object[key], key, object);
  }
  return result;
}

export default mapValues;
