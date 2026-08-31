/**
 * Collapse every run of whitespace into a single space and trim the ends.
 *
 * The fix for text pasted out of Word, Slack or a PDF, where non-breaking spaces and stray
 * newlines break layout and equality checks.
 *
 * @example
 * normalizeWhitespace('  Hello \n\t world  '); // 'Hello world'
 */
export function normalizeWhitespace(value: string): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/gu, ' ').trim();
}
export default normalizeWhitespace;
