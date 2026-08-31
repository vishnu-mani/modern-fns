/**
 * Pull every number out of free text, including decimals, negatives and thousands separators.
 *
 * Useful for parsing pasted invoices, log lines, addresses and OCR output.
 *
 * @example
 * extractNumbers('Order #123 total ₹1,299.50, -5 items'); // [123, 1299.5, -5]
 * extractNumbers('no digits here');                        // []
 */
export function extractNumbers(value: string): number[] {
  if (typeof value !== 'string') return [];
  const matches = value.match(/-?\d{1,3}(?:,\d{3})+(?:\.\d+)?|-?\d+(?:\.\d+)?/g);
  if (!matches) return [];
  return matches
    .map((match) => Number(match.replace(/,/g, '')))
    .filter((number) => Number.isFinite(number));
}
export default extractNumbers;
