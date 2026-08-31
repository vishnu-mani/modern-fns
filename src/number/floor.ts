import { shiftRound } from './round.js';

/**
 * Decimal-safe `Math.floor`.
 *
 * @example
 * floor(1.999, 2); // 1.99
 * floor(-1.001, 2); // -1.01
 */
export function floor(value: number, decimals = 0): number {
  return shiftRound(value, decimals, Math.floor);
}
export default floor;
