import { describe, expect, it } from 'vitest';
import {
  abbreviate,
  ceil,
  clamp,
  compoundInterest,
  currency,
  discount,
  floor,
  formatNumber,
  isNumeric,
  percentage,
  percentageChange,
  random,
  round,
  tax,
} from '../../src/index.js';
import { range as numberRange } from '../../src/number/range.js';
import { toNumber as numberToNumber } from '../../src/number/toNumber.js';

describe('clamp', () => {
  it('constrains to the range', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(42, 0, 100)).toBe(42);
  });
  it('handles swapped bounds and NaN', () => {
    expect(clamp(50, 100, 0)).toBe(50);
    expect(clamp(NaN, 0, 1)).toBeNaN();
    expect(clamp(Infinity, 0, 1)).toBe(1);
  });
});

describe('round / floor / ceil', () => {
  it('is decimal-safe', () => {
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(2.675, 2)).toBe(2.68);
    expect(round(2.5)).toBe(3);
    expect(round(-2.5)).toBe(-2);
  });
  it('rounds to tens with negative decimals', () => {
    expect(round(1234, -2)).toBe(1200);
    expect(round(1250, -2)).toBe(1300);
  });
  it('floors and ceils', () => {
    expect(floor(1.999, 2)).toBe(1.99);
    expect(ceil(1.001, 2)).toBe(1.01);
    expect(floor(1.9)).toBe(1);
    expect(ceil(1.1)).toBe(2);
  });
  it('passes through non-finite values', () => {
    expect(round(Infinity, 2)).toBe(Infinity);
    expect(round(NaN, 2)).toBeNaN();
    expect(floor(NaN)).toBeNaN();
  });
});

describe('percentage / percentageChange', () => {
  it('computes percentages', () => {
    expect(percentage(25, 200)).toBe(12.5);
    expect(percentage(1, 3, 2)).toBe(33.33);
    expect(percentage(0, 100)).toBe(0);
  });
  it('returns 0 rather than NaN for a zero total', () => {
    expect(percentage(5, 0)).toBe(0);
    expect(percentage(NaN, 10)).toBe(0);
  });
  it('computes relative change', () => {
    expect(percentageChange(200, 250)).toBe(25);
    expect(percentageChange(250, 200)).toBe(-20);
    expect(percentageChange(-100, -50)).toBe(50);
  });
  it('documents its zero and non-finite behaviour', () => {
    expect(percentageChange(0, 0)).toBe(0);
    expect(percentageChange(0, 10)).toBe(Infinity);
    expect(percentageChange(0, -10)).toBe(-Infinity);
    expect(percentageChange(NaN, 1)).toBeNaN();
  });
});

describe('formatNumber / abbreviate / currency', () => {
  it('formats with Intl', () => {
    expect(formatNumber(1234567.891, { locale: 'en-US' })).toBe('1,234,567.891');
    expect(formatNumber(1234567.891, { locale: 'en-US', decimals: 2 })).toBe('1,234,567.89');
    expect(formatNumber(1234567, { locale: 'en-IN' })).toBe('12,34,567');
    expect(formatNumber(0.256, { locale: 'en-US', style: 'percent' })).toBe('26%');
  });
  it('falls back for unusable values', () => {
    expect(formatNumber(null, { fallback: '—' })).toBe('—');
    expect(formatNumber(undefined)).toBe('');
    expect(formatNumber(NaN)).toBe('');
    expect(formatNumber('abc')).toBe('');
    expect(formatNumber('')).toBe('');
    expect(formatNumber('42', { locale: 'en-US' })).toBe('42');
  });
  it('abbreviates deterministically', () => {
    expect(abbreviate(1500000)).toBe('1.5M');
    expect(abbreviate(999)).toBe('999');
    expect(abbreviate(1000)).toBe('1K');
    expect(abbreviate(-2500)).toBe('-2.5K');
    expect(abbreviate(1234, { decimals: 2 })).toBe('1.23K');
    expect(abbreviate(1e12)).toBe('1T');
    expect(abbreviate(1e15)).toBe('1000T');
    expect(abbreviate(1e6, { units: ['k', 'm'] })).toBe('1m');
    expect(abbreviate(1500, { space: true })).toBe('1.5 K');
    expect(abbreviate(0)).toBe('0');
    expect(abbreviate(NaN)).toBe('');
  });
  it('never rounds a count up', () => {
    expect(abbreviate(1999)).toBe('1.9K');
  });
  it('formats currency', () => {
    expect(currency(1299.5, 'INR', 'en-IN')).toBe('₹1,299.50');
    expect(currency(1299.5, 'USD', 'en-US')).toBe('$1,299.50');
    expect(currency(1000, 'JPY', 'en-US')).toBe('¥1,000');
    expect(currency(null, 'USD')).toBe('');
    expect(currency(NaN, 'USD', 'en-US', { fallback: 'n/a' })).toBe('n/a');
    expect(currency(1, 'NOPE', 'en-US', { fallback: 'x' })).toBe('x');
  });
});

describe('random', () => {
  it('is inclusive at both ends', () => {
    expect(random(1, 6, { source: () => 0 })).toBe(1);
    expect(random(1, 6, { source: () => 0.999999 })).toBe(6);
  });
  it('stays in range over many draws', () => {
    for (let i = 0; i < 500; i += 1) {
      const value = random(1, 3);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(3);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
  it('supports floats, swapped bounds and defaults', () => {
    expect(random(0, 1, { float: true, source: () => 0.5 })).toBe(0.5);
    expect(random(6, 1, { source: () => 0 })).toBe(1);
    expect(random(undefined, undefined, { source: () => 0 })).toBe(0);
  });
  it('returns NaN for impossible ranges', () => {
    expect(random(1.2, 1.8)).toBeNaN();
    expect(random(NaN, 1)).toBeNaN();
  });
});

describe('isNumeric', () => {
  it('accepts numbers and clean numeric strings', () => {
    expect(isNumeric(42)).toBe(true);
    expect(isNumeric('42')).toBe(true);
    expect(isNumeric(' 3.14 ')).toBe(true);
    expect(isNumeric('-1e3')).toBe(true);
  });
  it('rejects the values Number() silently coerces', () => {
    expect(isNumeric('')).toBe(false);
    expect(isNumeric('   ')).toBe(false);
    expect(isNumeric(null)).toBe(false);
    expect(isNumeric(undefined)).toBe(false);
    expect(isNumeric([])).toBe(false);
    expect(isNumeric(true)).toBe(false);
    expect(isNumeric(NaN)).toBe(false);
    expect(isNumeric(Infinity)).toBe(false);
    expect(isNumeric('1,000')).toBe(false);
  });
});

describe('business maths', () => {
  it('adds tax and subtracts discount', () => {
    expect(tax(1000, 18)).toBe(1180);
    expect(tax(99.99, 7.5)).toBe(107.49);
    expect(tax(1000, 0)).toBe(1000);
    expect(discount(1000, 10)).toBe(900);
    expect(discount(59.99, 33)).toBe(40.19);
    expect(discount(100, 150)).toBe(0);
    expect(discount(100, 0)).toBe(100);
  });
  it('rounds to the requested precision', () => {
    expect(tax(10, 8.25, 4)).toBe(10.825);
    expect(discount(10, 8.25, 4)).toBe(9.175);
  });
  it('returns NaN for non-finite input', () => {
    expect(tax(NaN, 1)).toBeNaN();
    expect(discount(1, NaN)).toBeNaN();
  });
  it('computes compound interest', () => {
    expect(compoundInterest(1000, 5, 1, 2)).toBe(1102.5);
    expect(compoundInterest(100000, 7.5, 12, 10)).toBe(211206.46);
    expect(compoundInterest(1000, 0, 12, 5)).toBe(1000);
    expect(compoundInterest(1000, 5, 0, 1)).toBeNaN();
    expect(compoundInterest(NaN, 5, 1, 1)).toBeNaN();
  });
});

describe('re-exports', () => {
  it('shares one implementation with array/range and value/toNumber', () => {
    expect(numberRange(1, 4)).toEqual([1, 2, 3]);
    expect(numberToNumber('₹1,299.50')).toBe(1299.5);
  });
});
