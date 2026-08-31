/**
 * Build a numeric range, end-exclusive.
 *
 * With one argument the range starts at `0`. A negative `step` counts down. A `step` of `0`,
 * or a direction that can never reach `end`, yields `[]` instead of hanging.
 *
 * @example
 * range(4);          // [0, 1, 2, 3]
 * range(1, 4);       // [1, 2, 3]
 * range(0, 10, 2.5); // [0, 2.5, 5, 7.5]
 * range(3, 0, -1);   // [3, 2, 1]
 */
export function range(start: number, end?: number, step?: number): number[] {
  let from = Number(start);
  const to = end === undefined ? from : Number(end);
  if (end === undefined) from = 0;
  if (!Number.isFinite(from) || !Number.isFinite(to)) return [];

  const increment = step === undefined ? (to < from ? -1 : 1) : Number(step);
  if (!Number.isFinite(increment) || increment === 0) return [];
  if (increment > 0 && to < from) return [];
  if (increment < 0 && to > from) return [];

  const length = Math.max(0, Math.ceil((to - from) / increment));
  const result: number[] = new Array(length);
  for (let i = 0; i < length; i += 1) result[i] = from + i * increment;
  return result;
}

export default range;
