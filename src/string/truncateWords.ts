import type { TruncateOptions } from './truncate.js';

/**
 * Keep the first `wordCount` whitespace-separated words. The natural choice for previews and
 * excerpts, where a character limit cuts awkwardly.
 *
 * @example
 * truncateWords('The quick brown fox jumps', 3); // 'The quick brown…'
 * truncateWords('One two', 5);                   // 'One two'
 */
export function truncateWords(
  value: string,
  wordCount: number,
  options: Pick<TruncateOptions, 'omission'> = {},
): string {
  if (typeof value !== 'string') return '';
  const limit = Math.trunc(wordCount);
  if (!Number.isFinite(limit) || limit <= 0) return '';

  const parts = value.trim().split(/\s+/u).filter(Boolean);
  if (parts.length <= limit) return value.trim();
  return parts.slice(0, limit).join(' ') + (options.omission ?? '…');
}
export default truncateWords;
