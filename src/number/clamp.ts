/**
 * Constrain a number to an inclusive range.
 *
 * If `min > max` the bounds are swapped rather than returning nonsense. `NaN` input yields
 * `NaN`.
 *
 * @example
 * clamp(150, 0, 100); // 100
 * clamp(-5, 0, 100);  // 0
 * clamp(42, 0, 100);  // 42
 */
export function clamp(value: number, min: number, max: number): number {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  if (Number.isNaN(value)) return NaN;
  return Math.min(Math.max(value, low), high);
}
export default clamp;
