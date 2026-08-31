/** Options for {@link truncate}. */
export interface TruncateOptions {
  /** Appended when the string is shortened. Default `'…'`. */
  omission?: string;
  /** Cut at the last occurrence of this separator before the limit (avoids mid-word cuts). */
  separator?: string | RegExp;
}

/**
 * Shorten a string to at most `length` characters **including** the omission marker, so the
 * result never exceeds the width you budgeted for it.
 *
 * Counts by code point, so emoji and astral characters are never cut in half.
 *
 * @example
 * truncate('The quick brown fox', 10);                      // 'The quick…'
 * truncate('The quick brown fox', 10, { separator: ' ' });   // 'The…'
 * truncate('Hi', 10);                                        // 'Hi'
 */
export function truncate(value: string, length: number, options: TruncateOptions = {}): string {
  if (typeof value !== 'string') return '';
  const limit = Math.trunc(length);
  if (!Number.isFinite(limit) || limit <= 0) return '';

  const chars = [...value];
  if (chars.length <= limit) return value;

  const { omission = '…', separator } = options;
  const omissionLength = [...omission].length;
  if (omissionLength >= limit) return omission.slice(0, limit);

  let head = chars.slice(0, limit - omissionLength).join('');
  if (separator !== undefined) {
    const index =
      typeof separator === 'string'
        ? head.lastIndexOf(separator)
        : lastIndexOfPattern(head, separator);
    if (index > 0) head = head.slice(0, index);
  }
  return head + omission;
}

function lastIndexOfPattern(value: string, pattern: RegExp): number {
  const re = new RegExp(
    pattern.source,
    pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`,
  );
  let index = -1;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value)) !== null) {
    index = match.index;
    if (match.index === re.lastIndex) re.lastIndex += 1;
  }
  return index;
}
export default truncate;
