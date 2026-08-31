/** Options for {@link formatNumber}. Extends the native `Intl.NumberFormat` options. */
export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  /** BCP 47 locale tag. Defaults to the runtime locale. */
  locale?: string | string[];
  /** Shorthand for `minimumFractionDigits` + `maximumFractionDigits`. */
  decimals?: number;
  /** Returned when the value is not a finite number. Default `''`. */
  fallback?: string;
}

/**
 * Locale-aware number formatting with a safe fallback for the `null`/`undefined`/`NaN` values
 * that reach every real UI.
 *
 * @example
 * formatNumber(1234567.891);                        // '1,234,567.891' (en-US)
 * formatNumber(1234567.891, { decimals: 2 });       // '1,234,567.89'
 * formatNumber(1234567, { locale: 'en-IN' });       // '12,34,567'
 * formatNumber(0.256, { style: 'percent' });        // '26%'
 * formatNumber(null, { fallback: '—' });            // '—'
 */
export function formatNumber(value: unknown, options: FormatNumberOptions = {}): string {
  const { locale, decimals, fallback = '', ...intlOptions } = options;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (value === null || value === '' || !Number.isFinite(numeric)) return fallback;

  if (decimals !== undefined) {
    intlOptions.minimumFractionDigits ??= decimals;
    intlOptions.maximumFractionDigits ??= decimals;
  }
  return new Intl.NumberFormat(locale, intlOptions).format(numeric);
}
export default formatNumber;
