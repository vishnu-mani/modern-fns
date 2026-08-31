import { shiftRound } from './round.js';

/**
 * Decimal-safe `Math.ceil`.
 *
 * @example
 * ceil(1.001, 2); // 1.01
 */
export function ceil(value: number, decimals = 0): number {
  return shiftRound(value, decimals, Math.ceil);
}
export default ceil;
