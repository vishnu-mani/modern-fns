/** Options for {@link currency}. */
export interface CurrencyOptions extends Omit<Intl.NumberFormatOptions, 'style' | 'currency'> {
  /** Returned when the value is not a finite number. Default `''`. */
  fallback?: string;
}

/**
 * Format money with the right symbol, grouping and decimal places for the locale.
 *
 * Defaults to the runtime locale; pass one explicitly whenever the output must be stable
 * (tests, PDFs, emails). Zero-decimal currencies such as JPY are handled by `Intl`.
 *
 * @example
 * currency(1299.5, 'INR');            // '₹1,299.50'
 * currency(1299.5, 'INR', 'en-IN');   // '₹1,299.50'
 * currency(1299.5, 'USD', 'de-DE');   // '1.299,50 $'
 * currency(null, 'USD');              // ''
 */
export function currency(
  value: unknown,
  currencyCode: string,
  locale?: string | string[],
  options: CurrencyOptions = {},
): string {
  const { fallback = '', ...intlOptions } = options;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (value === null || value === '' || !Number.isFinite(numeric)) return fallback;
  try {
    return new Intl.NumberFormat(locale, {
      ...intlOptions,
      style: 'currency',
      currency: currencyCode,
    }).format(numeric);
  } catch {
    return fallback;
  }
}
export default currency;
