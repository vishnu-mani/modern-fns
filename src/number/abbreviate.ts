/** Options for {@link abbreviate}. */
export interface AbbreviateOptions {
  /** Maximum decimal places. Trailing zeros are dropped. Default `1`. */
  decimals?: number;
  /** Unit suffixes from thousands upward. Default `['K', 'M', 'B', 'T']`. */
  units?: string[];
  /** Insert a space before the unit. Default `false`. */
  space?: boolean;
}

const DEFAULT_UNITS = ['K', 'M', 'B', 'T'];

/**
 * Compact a number for dashboards and counters: `1500000` -> `'1.5M'`.
 *
 * Deliberately locale-independent so snapshots and tests are stable — use
 * `formatNumber(value, { notation: 'compact' })` when you need localised compact notation.
 * Rounds toward zero at the chosen precision so a count never reads higher than it is.
 *
 * @example
 * abbreviate(1500000);                    // '1.5M'
 * abbreviate(999);                        // '999'
 * abbreviate(-2500);                      // '-2.5K'
 * abbreviate(1234, { decimals: 2 });      // '1.23K'
 * abbreviate(1e6, { units: ['k', 'm'] }); // '1m'
 */
export function abbreviate(value: number, options: AbbreviateOptions = {}): string {
  const { decimals = 1, units = DEFAULT_UNITS, space = false } = options;
  if (!Number.isFinite(value)) return '';

  const sign = value < 0 ? '-' : '';
  let magnitude = Math.abs(value);
  if (magnitude < 1000) return sign + trimZeros(magnitude, decimals);

  let unitIndex = -1;
  while (magnitude >= 1000 && unitIndex < units.length - 1) {
    magnitude /= 1000;
    unitIndex += 1;
  }
  const factor = 10 ** Math.max(0, Math.trunc(decimals));
  const truncated = Math.floor(magnitude * factor) / factor;
  return `${sign}${trimZeros(truncated, decimals)}${space ? ' ' : ''}${units[unitIndex]}`;
}

function trimZeros(value: number, decimals: number): string {
  return String(Number(value.toFixed(Math.max(0, Math.trunc(decimals)))));
}
export default abbreviate;
