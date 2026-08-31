/**
 * Remove HTML tags, keeping the text. `<script>` and `<style>` blocks are removed **with**
 * their contents, and HTML comments are dropped.
 *
 * This is a display helper for trusted-ish content (rendering an excerpt of a CMS field as
 * plain text). It is **not** a sanitiser: never feed its output back into `innerHTML`.
 *
 * @example
 * stripHtml('<p>Hello <b>world</b></p>');            // 'Hello world'
 * stripHtml('<script>alert(1)</script>Safe');        // 'Safe'
 */
export function stripHtml(value: string): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?[a-z][^>]*>/gi, '');
}
export default stripHtml;
