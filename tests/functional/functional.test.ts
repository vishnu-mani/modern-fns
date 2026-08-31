import { describe, expect, it, vi } from 'vitest';
import {
  asyncTryCatch,
  compose,
  debounce,
  identity,
  memoize,
  noop,
  once,
  pipe,
  tap,
  throttle,
  tryCatch,
  unless,
  when,
} from '../../src/index.js';
import { removeSpaces, truncate } from '../../src/index.js';

describe('pipe / compose', () => {
  it('pipes left to right', () => {
    expect(
      pipe(
        (n: number) => n + 1,
        (n: number) => n * 2,
      )(1),
    ).toBe(4);
  });
  it('composes right to left', () => {
    expect(
      compose(
        (n: number) => n * 2,
        (n: number) => n + 1,
      )(1),
    ).toBe(4);
    expect(
      compose(
        (s: string) => `${s}!`,
        (s: string) => s.toUpperCase(),
      )('hey'),
    ).toBe('HEY!');
  });
  it('supports multiple initial arguments', () => {
    expect(
      pipe(
        (a: number, b: number) => a + b,
        (n: number) => n * 2,
      )(1, 2),
    ).toBe(6);
  });
  it('stays synchronous when no step is async', () => {
    const result = pipe((n: number) => n + 1)(1);
    expect(result).toBe(2);
    expect(result).not.toBeInstanceOf(Promise);
  });
  it('becomes async as soon as a step returns a promise', async () => {
    const result = pipe(
      (n: number) => Promise.resolve(n + 1),
      (n: number) => n * 2,
      (n: number) => Promise.resolve(n + 1),
    )(1);
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(5);
  });
  it('handles the empty pipeline', () => {
    expect(pipe()(1)).toBe(1);
    expect(compose()(1)).toBe(1);
  });
  it('builds the documented username normaliser', () => {
    const normalizeUsername = pipe(
      (s: string) => s.trim(),
      (s: string) => s.toLowerCase(),
      removeSpaces,
      (s: string) => truncate(s, 20),
    );
    expect(normalizeUsername('  Vishnu M  ')).toBe('vishnum');
  });
});

describe('identity / noop / tap', () => {
  it('behaves as documented', () => {
    const value = { a: 1 };
    expect(identity(value)).toBe(value);
    expect(noop()).toBeUndefined();
    const spy = vi.fn();
    expect(tap(value, spy)).toBe(value);
    expect(spy).toHaveBeenCalledWith(value);
  });
});

describe('once', () => {
  it('runs only the first time', () => {
    const spy = vi.fn((n: number) => n * 2);
    const wrapped = once(spy);
    expect(wrapped(2)).toBe(4);
    expect(wrapped(5)).toBe(4);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it('retries after a throw', () => {
    let calls = 0;
    const wrapped = once(() => {
      calls += 1;
      if (calls === 1) throw new Error('boom');
      return calls;
    });
    expect(() => wrapped()).toThrow('boom');
    expect(wrapped()).toBe(2);
  });
  it('preserves `this`', () => {
    const object = {
      n: 5,
      get: once(function (this: { n: number }) {
        return this.n;
      }),
    };
    expect(object.get()).toBe(5);
  });
});

describe('memoize', () => {
  it('caches by argument', () => {
    const spy = vi.fn((n: number) => n * 2);
    const wrapped = memoize(spy);
    expect(wrapped(2)).toBe(4);
    expect(wrapped(2)).toBe(4);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapped(3)).toBe(6);
    expect(spy).toHaveBeenCalledTimes(2);
  });
  it('keys multi-argument calls by their serialisation', () => {
    const spy = vi.fn((a: number, b: number) => a + b);
    const wrapped = memoize(spy);
    expect(wrapped(1, 2)).toBe(3);
    expect(wrapped(1, 2)).toBe(3);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it('supports a resolver and an exposed cache', () => {
    const wrapped = memoize((user: { id: number }) => user.id, { resolver: (u) => u.id });
    expect(wrapped({ id: 1 })).toBe(1);
    expect(wrapped({ id: 1 })).toBe(1);
    expect(wrapped.cache.size).toBe(1);
    wrapped.cache.clear();
    expect(wrapped.cache.size).toBe(0);
  });
  it('evicts beyond maxSize', () => {
    const wrapped = memoize((n: number) => n, { maxSize: 2 });
    wrapped(1);
    wrapped(2);
    wrapped(3);
    expect(wrapped.cache.size).toBe(2);
    expect(wrapped.cache.has(1)).toBe(false);
  });
  it('caches undefined results', () => {
    const spy = vi.fn(() => undefined);
    const wrapped = memoize(spy);
    wrapped();
    wrapped();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('debounce', () => {
  it('invokes once after the quiet period', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debounced = debounce(spy, 100);
    debounced(1);
    debounced(2);
    debounced(3);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(3);
    vi.useRealTimers();
  });
  it('supports the leading edge', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debounced = debounce(spy, 100, { leading: true, trailing: false });
    debounced();
    expect(spy).toHaveBeenCalledTimes(1);
    debounced();
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it('cancels, flushes and reports pending state', () => {
    vi.useFakeTimers();
    const spy = vi.fn(() => 'done');
    const debounced = debounce(spy, 100);
    debounced();
    expect(debounced.pending()).toBe(true);
    debounced.cancel();
    vi.advanceTimersByTime(200);
    expect(spy).not.toHaveBeenCalled();
    expect(debounced.pending()).toBe(false);

    debounced();
    expect(debounced.flush()).toBe('done');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(debounced.flush()).toBe('done');
    expect(spy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it('guarantees progress with maxWait', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debounced = debounce(spy, 100, { maxWait: 250 });
    for (let i = 0; i < 5; i += 1) {
      debounced(i);
      vi.advanceTimersByTime(80);
    }
    expect(spy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it('preserves `this`', () => {
    vi.useFakeTimers();
    const object = {
      n: 7,
      seen: 0,
      run: debounce(function (this: { n: number; seen: number }) {
        this.seen = this.n;
      }, 10),
    };
    object.run();
    vi.advanceTimersByTime(10);
    expect(object.seen).toBe(7);
    vi.useRealTimers();
  });
});

describe('throttle', () => {
  it('fires on the leading edge and at most once per window', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const throttled = throttle(spy, 100);
    throttled(1);
    expect(spy).toHaveBeenCalledTimes(1);
    throttled(2);
    throttled(3);
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(3);
    vi.useRealTimers();
  });
  it('exposes the debounce controls', () => {
    const throttled = throttle(() => 1, 50);
    expect(typeof throttled.cancel).toBe('function');
    expect(typeof throttled.flush).toBe('function');
    throttled.cancel();
  });
});

describe('tryCatch / asyncTryCatch', () => {
  it('returns the value or the fallback', () => {
    expect(tryCatch(() => JSON.parse('{"a":1}') as unknown)).toEqual({ a: 1 });
    expect(tryCatch(() => JSON.parse('nope') as unknown, {})).toEqual({});
    expect(
      tryCatch(() => {
        throw new Error('x');
      }),
    ).toBeUndefined();
  });
  it('supports a fallback function receiving the error', () => {
    expect(
      tryCatch(
        () => {
          throw new Error('boom');
        },
        (error) => (error as Error).message,
      ),
    ).toBe('boom');
  });
  it('handles async success, rejection and synchronous throws', async () => {
    await expect(asyncTryCatch(() => Promise.resolve(1))).resolves.toBe(1);
    await expect(asyncTryCatch(() => Promise.reject(new Error('x')), 'fallback')).resolves.toBe(
      'fallback',
    );
    await expect(
      asyncTryCatch((): number => {
        throw new Error('sync');
      }, 'fallback'),
    ).resolves.toBe('fallback');
    await expect(asyncTryCatch(() => Promise.reject(new Error('x')))).resolves.toBeUndefined();
    await expect(
      asyncTryCatch(
        () => Promise.reject(new Error('x')),
        (e) => (e as Error).message,
      ),
    ).resolves.toBe('x');
  });
});

describe('when / unless', () => {
  it('returns a value only when the condition holds', () => {
    expect(when(true, 'yes')).toBe('yes');
    expect(when(false, 'yes')).toBeUndefined();
    expect(when(false, 'yes', 'no')).toBe('no');
    expect(when(1, () => 'lazy')).toBe('lazy');
    expect(when(() => true, 'yes')).toBe('yes');
    expect(when(0, 'yes', () => 'no')).toBe('no');
  });
  it('does not evaluate the branch not taken', () => {
    const spy = vi.fn(() => 'x');
    when(false, spy, 'other');
    expect(spy).not.toHaveBeenCalled();
  });
  it('inverts with unless', () => {
    expect(unless(false, 'yes')).toBe('yes');
    expect(unless(true, 'yes')).toBeUndefined();
    expect(unless(true, 'yes', 'no')).toBe('no');
    expect(unless(() => false, 'yes')).toBe('yes');
  });
});
