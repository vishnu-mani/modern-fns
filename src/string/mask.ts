/** Options for {@link mask}. */
export interface MaskOptions {
  /** How many characters to leave visible. Default `4`. */
  visible?: number;
  /** Which end stays visible. Default `'end'`. */
  from?: 'start' | 'end';
  /** Character used for masking. Default `'*'`. */
  maskChar?: string;
  /** Fixed number of mask characters, instead of one per hidden character. */
  maskLength?: number;
}

/**
 * Mask sensitive values for display — phone numbers, card numbers, emails, tokens.
 *
 * When the value is shorter than `visible`, everything is masked rather than leaking the whole
 * value. Counts by code point, so it is safe on unicode.
 *
 * @example
 * mask('9876543210', { visible: 4 });                  // '******3210'
 * mask('4111111111111111', { visible: 4, maskLength: 4 }); // '****1111'
 * mask('secret', { visible: 2, from: 'start' });       // 'se****'
 * mask('12', { visible: 4 });                          // '**'
 */
export function mask(value: string, options: MaskOptions = {}): string {
  if (typeof value !== 'string' || value === '') return '';
  const { visible = 4, from = 'end', maskChar = '*', maskLength } = options;

  const chars = [...value];
  const keep = Math.max(0, Math.trunc(visible));
  if (keep >= chars.length) return maskChar.repeat(chars.length);

  const hiddenCount = maskLength ?? chars.length - keep;
  const hidden = maskChar.repeat(Math.max(0, hiddenCount));
  return from === 'start'
    ? chars.slice(0, keep).join('') + hidden
    : hidden + chars.slice(-keep).join('');
}
export default mask;
