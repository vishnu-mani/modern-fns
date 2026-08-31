/**
 * Relative change from `oldValue` to `newValue`, as a percentage. Negative means a decrease.
 *
 * Edge cases, all deliberate:
 * - both values `0` -> `0` (nothing changed)
 * - `oldValue` `0`, `newValue` non-zero -> `Infinity` / `-Infinity` (growth from nothing is
 *   undefined; check with `Number.isFinite` and render "new" in your UI)
 * - non-finite input -> `NaN`
 *
 * @example
 * percentageChange(200, 250); // 25
 * percentageChange(250, 200); // -20
 * percentageChange(0, 10);    // Infinity
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (!Number.isFinite(oldValue) || !Number.isFinite(newValue)) return NaN;
  if (oldValue === 0) return newValue === 0 ? 0 : newValue > 0 ? Infinity : -Infinity;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}
export default percentageChange;
