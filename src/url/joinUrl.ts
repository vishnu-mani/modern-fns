/**
 * Join URL segments with exactly one slash between them — no `//` in the middle, no missing
 * slash, no accidental loss of the protocol.
 *
 * Empty and nullish parts are skipped. A query or hash on any part is moved to the end, so
 * `joinUrl(base, '/search?q=1')` works. A trailing slash on the final part is preserved.
 *
 * @example
 * joinUrl('https://api.com/', '/v1/', 'users');  // 'https://api.com/v1/users'
 * joinUrl('/base', 'a', 'b/');                   // '/base/a/b/'
 * joinUrl('https://api.com', 'search?q=1');      // 'https://api.com/search?q=1'
 */
export function joinUrl(...parts: Array<string | number | null | undefined>): string {
  const segments = parts
    .filter((part): part is string | number => part !== null && part !== undefined && part !== '')
    .map(String);
  if (segments.length === 0) return '';

  let query = '';
  let hash = '';
  const cleaned: string[] = [];

  segments.forEach((segment) => {
    let value = segment;
    const hashIndex = value.indexOf('#');
    if (hashIndex !== -1) {
      hash = value.slice(hashIndex) + hash.replace(/^#/, '');
      value = value.slice(0, hashIndex);
    }
    const queryIndex = value.indexOf('?');
    if (queryIndex !== -1) {
      const found = value.slice(queryIndex + 1);
      query = query === '' ? found : `${query}&${found}`;
      value = value.slice(0, queryIndex);
    }
    cleaned.push(value);
  });

  const first = cleaned[0];
  const keepTrailingSlash = cleaned[cleaned.length - 1].endsWith('/') && cleaned.length > 0;

  const joined = cleaned
    .map((segment, index) =>
      index === 0 ? segment.replace(/\/+$/, '') : segment.replace(/^\/+|\/+$/g, ''),
    )
    .filter((segment, index) => segment !== '' || index === 0)
    .join('/');

  let result = joined;
  if (first.startsWith('/') && !result.startsWith('/')) result = `/${result}`;
  if (keepTrailingSlash && !result.endsWith('/')) result += '/';
  if (query !== '') result += `?${query}`;
  if (hash !== '') result += hash;
  return result;
}
export default joinUrl;
