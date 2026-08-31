/**
 * Round to a fixed number of decimals, without the floating-point surprises.
 *
 * `Math.round(1.005 * 100) / 100` gives `1` because `1.005` is really `1.00499…`. This uses
 * exponent-shifted rounding, so `round(1.005, 2)` is `1.01`. Negative `decimals` round to tens,
 * hundreds and so on.
 *
 * @example
 * round(1.005, 2);   // 1.01
 * round(2.5);        // 3
 * round(1234, -2);   // 1200
 */
export function round(value: number, decimals = 0): number {
  return shiftRound(value, decimals, Math.round);
}

/** Shared decimal-safe rounding used by `round`, `floor` and `ceil`. */
export function shiftRound(
  value: number,
  decimals: number,
  operation: (n: number) => number,
): number {
  if (!Number.isFinite(value)) return value;
  const places = Math.trunc(decimals) || 0;
  if (places === 0) return operation(value);
  const [mantissa, exponent = '0'] = value.toExponential().split('e');
  const shifted = operation(Number(`${mantissa}e${Number(exponent) + places}`));
  const [resultMantissa, resultExponent = '0'] = shifted.toExponential().split('e');
  return Number(`${resultMantissa}e${Number(resultExponent) - places}`);
}
export default round;
