import { round } from './round.js';

/**
 * Add a tax percentage to an amount and return the **gross** total.
 *
 * Returns a value rounded to `decimals` (default `2`) so repeated line-item maths does not
 * accumulate floating-point dust. Use `tax(value, rate) - value` for the tax component.
 *
 * @example
 * tax(1000, 18);      // 1180
 * tax(99.99, 7.5);    // 107.49
 * tax(1000, 0);       // 1000
 */
export function tax(value: number, percentage: number, decimals = 2): number {
  if (!Number.isFinite(value) || !Number.isFinite(percentage)) return NaN;
  return round(value + (value * percentage) / 100, decimals);
}
export default tax;
