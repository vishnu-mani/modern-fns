/**
 * Fall back when a value is `null`, `undefined` or `NaN` — the `??` operator plus the `NaN`
 * case it does not cover.
 *
 * `0`, `''` and `false` are kept.
 *
 * @example
 * defaultTo(props.count, 0);
 * defaultTo(Number('abc'), 0); // 0, where `??` would give NaN
 */
export function defaultTo<T, D>(value: T | null | undefined, defaultValue: D): NonNullable<T> | D {
  if (value == null) return defaultValue;
  if (typeof value === 'number' && Number.isNaN(value)) return defaultValue;
  return value;
}
export default defaultTo;
