import { round } from './round.js';

/**
 * Compound interest: the **final amount**, `P(1 + r/n)^(n·t)`.
 *
 * @param principal - Starting amount.
 * @param rate - Annual rate as a percentage (`7.5`, not `0.075`).
 * @param periods - Compounding periods per year (`12` monthly, `4` quarterly, `1` annually).
 * @param years - Number of years; fractional years are allowed.
 * @param decimals - Rounding, default `2`.
 *
 * Subtract `principal` for the interest earned.
 *
 * @example
 * compoundInterest(100000, 7.5, 12, 10);           // 211206.46
 * compoundInterest(1000, 5, 1, 2);                 // 1102.5
 * compoundInterest(1000, 5, 1, 2) - 1000;          // 102.5 interest
 */
export function compoundInterest(
  principal: number,
  rate: number,
  periods: number,
  years: number,
  decimals = 2,
): number {
  if (![principal, rate, periods, years].every(Number.isFinite)) return NaN;
  if (periods <= 0) return NaN;
  return round(principal * (1 + rate / 100 / periods) ** (periods * years), decimals);
}
export default compoundInterest;
