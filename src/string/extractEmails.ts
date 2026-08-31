import { isEmail } from './isEmail.js';

/**
 * Pull every email address out of free text, de-duplicated and lower-cased.
 *
 * Handy for parsing pasted recipient lists, CSV cells and support tickets.
 *
 * @example
 * extractEmails('Mail a@x.com or B@X.COM, also a@x.com'); // ['a@x.com', 'b@x.com']
 */
export function extractEmails(value: string): string[] {
  if (typeof value !== 'string') return [];
  const matches = value.match(
    /[^\s@,;<>()[\]\\"]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+/gi,
  );
  if (!matches) return [];
  const seen = new Set<string>();
  for (const match of matches) {
    const cleaned = match.replace(/[.,;:]+$/, '').toLowerCase();
    if (isEmail(cleaned)) seen.add(cleaned);
  }
  return [...seen];
}
export default extractEmails;
