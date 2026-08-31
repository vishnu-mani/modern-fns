/** Shared prefix handling so query helpers round-trip `?` exactly as they received it. */

/** Did the input carry a leading `?`. */
export function hadPrefix(queryString: string): boolean {
  return typeof queryString === 'string' && queryString.trimStart().startsWith('?');
}

/** Re-apply a `?` prefix to a non-empty query string. */
export function withPrefix(queryString: string, prefix: boolean): string {
  if (!prefix || queryString === '') return queryString;
  return `?${queryString}`;
}
