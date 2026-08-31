/** Internal unicode-aware word splitter shared by the string case converters. */

/**
 * Matches, in priority order:
 *  - acronym runs followed by a capitalised word (`HTTPServer` -> `HTTP`, `Server`)
 *  - capitalised or lowercase words, including trailing digits (`user2`)
 *  - standalone digit runs
 */
const WORD_RE = /\p{Lu}+(?=\p{Lu}\p{Ll})|\p{Lu}?[\p{Ll}\p{M}]+[\p{N}]*|\p{Lu}+[\p{N}]*|[\p{N}]+/gu;

/**
 * Split any casing style into its constituent words.
 *
 * `"XMLHttpRequest"` -> `['XML', 'Http', 'Request']`
 * `"hello_world-42"` -> `['hello', 'world', '42']`
 */
export function words(value: string): string[] {
  return value.match(WORD_RE) ?? [];
}
