const EMAIL_RE =
  /^[^\s@,;<>()[\]\\"]+(?:\.[^\s@,;<>()[\]\\"]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

/**
 * Pragmatic email validation: catches the mistakes users actually make (missing `@`, missing
 * TLD, spaces, trailing dots) without rejecting valid addresses the way strict RFC 5322
 * regexes do to plus-addressing and unicode locals.
 *
 * Validation is not verification — only sending mail proves an address exists.
 *
 * @example
 * isEmail('vishnu+tag@example.co.in'); // true
 * isEmail('user@localhost');           // false (no TLD)
 * isEmail(' user@example.com ');       // true  (trimmed first)
 */
export function isEmail(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  if (trimmed.includes('..')) return false;
  const [local] = trimmed.split('@');
  if (local === undefined || local.length > 64) return false;
  return EMAIL_RE.test(trimmed);
}
export default isEmail;
