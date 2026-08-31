import { round } from './round.js';

/**
 * Subtract a discount percentage and return the **net** amount.
 *
 * Rounded to `decimals` (default `2`). A discount above 100% clamps at `0` rather than
 * producing a negative price.
 *
 * @example
 * discount(1000, 10);  // 900
 * discount(59.99, 33); // 40.19
 * discount(100, 150);  // 0
 */
export function discount(value: number, percentage: number, decimals = 2): number {
  if (!Number.isFinite(value) || !Number.isFinite(percentage)) return NaN;
  const result = value - (value * percentage) / 100;
  return round(value >= 0 ? Math.max(0, result) : result, decimals);
}
export default discount;
