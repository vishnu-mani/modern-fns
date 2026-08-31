/**
 * Return the input unchanged. The default iteratee for grouping/sorting helpers and a readable
 * placeholder in a pipeline.
 *
 * @example
 * groupBy(tags, identity);
 */
export function identity<T>(value: T): T {
  return value;
}
export default identity;
