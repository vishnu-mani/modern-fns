/**
 * What percentage is `value` of `total`?
 *
 * Returns `0` when `total` is `0` instead of `NaN`/`Infinity`, because a progress bar of
 * "0 out of 0" is 0%, not a crash.
 *
 * @example
 * percentage(25, 200);    // 12.5
 * percentage(1, 3, 2);    // 33.33
 * percentage(5, 0);       // 0
 */
export function percentage(value: number, total: number, decimals?: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0) return 0;
  const result = (value / total) * 100;
  if (decimals === undefined) return result;
  const factor = 10 ** Math.trunc(decimals);
  return Math.round(result * factor) / factor;
}
export default percentage;
