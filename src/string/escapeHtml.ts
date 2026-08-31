const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape the five characters that break HTML, so a value can be interpolated into markup.
 *
 * @example
 * escapeHtml('<script>alert("x")</script>');
 * // '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
 */
export function escapeHtml(value: string): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}
export default escapeHtml;
