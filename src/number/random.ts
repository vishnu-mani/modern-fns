/** Options for {@link random}. */
export interface RandomOptions {
  /** Return a float instead of an integer. Default `false`. */
  float?: boolean;
  /** Custom source of randomness in `[0, 1)`. Default `Math.random`. Injectable for tests. */
  source?: () => number;
}

/**
 * Random number in `[min, max]` — **inclusive** at both ends for integers, which is what
 * "pick a number between 1 and 6" means (and what `Math.floor(Math.random() * max)` gets wrong).
 *
 * Not cryptographically secure; use `crypto.getRandomValues` for tokens.
 *
 * @example
 * random(1, 6);                        // 1..6 inclusive
 * random(0, 1, { float: true });       // 0.something
 * random(1, 6, { source: () => 0.5 }); // deterministic in tests
 */
export function random(min = 0, max = 1, options: RandomOptions = {}): number {
  const { float = false, source = Math.random } = options;
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return NaN;
  if (float) return low + source() * (high - low);
  const lowInt = Math.ceil(low);
  const highInt = Math.floor(high);
  if (lowInt > highInt) return NaN;
  return lowInt + Math.floor(source() * (highInt - lowInt + 1));
}
export default random;
