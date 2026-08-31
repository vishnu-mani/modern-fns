import { functional } from 'modern-fns';
import { fn, json, num, text, type DemoModule } from './types';

export const functionalModule: DemoModule = {
  module: 'functional',
  blurb:
    'Composition, memoisation, rate limiting and safe execution. The stateful ones (debounce, throttle, memoize, once) have live widgets below the call.',
  specs: [
    {
      name: 'pipe',
      signature: 'pipe(...fns): (...args) => result',
      summary: 'Left to right, and async-aware: a promise anywhere makes the chain awaited.',
      inputs: [
        text('input', '  Vishnu M  '),
        fn('fns', '[(s) => s.trim(), (s) => s.toLowerCase(), (s) => s.replace(/ /g, "")]'),
      ],
      callOverride: (v) => `pipe(...${v[1]})(${JSON.stringify(v[0])})`,
      run: (input: never, fns: never) =>
        (functional.pipe as (...f: never[]) => (v: unknown) => unknown)(
          ...(fns as unknown as never[]),
        )(input),
    },
    {
      name: 'compose',
      signature: 'compose(...fns): (...args) => result',
      summary: 'Right to left — the mathematical order.',
      inputs: [text('input', 'hey'), fn('fns', '[(s) => s + "!", (s) => s.toUpperCase()]')],
      callOverride: (v) => `compose(...${v[1]})(${JSON.stringify(v[0])})`,
      run: (input: never, fns: never) =>
        (functional.compose as (...f: never[]) => (v: unknown) => unknown)(
          ...(fns as unknown as never[]),
        )(input),
    },
    {
      name: 'identity',
      signature: 'identity<T>(value: T): T',
      summary: 'Returns its input. The default iteratee, and a readable placeholder.',
      inputs: [json('value', '{ "a": 1 }')],
      run: functional.identity,
    },
    {
      name: 'noop',
      signature: 'noop(): void',
      summary: 'Does nothing, stably — a shared default callback that never re-allocates.',
      inputs: [],
      callOverride: () => 'noop()',
      run: () => ({
        returned: functional.noop(),
        stableReference: functional.noop === functional.noop,
      }),
    },
    {
      name: 'once',
      signature: 'once<T>(fn: T): T',
      summary: 'Runs at most once; later calls return the first result.',
      inputs: [],
      callOverride: () => 'const wrapped = once((label) => expensiveSetup(label))',
      run: () => 'Interactive — use the widget below.',
      widget: 'once',
    },
    {
      name: 'memoize',
      signature: 'memoize(fn, options?): fn & { cache }',
      summary: 'Caches by argument; the cache is exposed so you can inspect and clear it.',
      inputs: [],
      callOverride: () =>
        'const slug = memoize((input) => input.toLowerCase().split(" ").join("-"))',
      run: () => 'Interactive — use the widget below.',
      widget: 'memoize',
    },
    {
      name: 'debounce',
      signature: 'debounce(fn, wait, options?): Debounced',
      summary: 'Fires after the quiet period. Exposes cancel(), flush() and pending().',
      inputs: [num('wait (ms)', '400')],
      callOverride: (v) => `const search = debounce((value) => fetchResults(value), ${v[0]})`,
      run: () => 'Interactive — use the widget below.',
      widget: 'debounce',
    },
    {
      name: 'throttle',
      signature: 'throttle(fn, wait, options?): Debounced',
      summary: 'At most once per window, leading edge first.',
      inputs: [num('wait (ms)', '400')],
      callOverride: (v) => `const onScroll = throttle((value) => update(value), ${v[0]})`,
      run: () => 'Interactive — use the widget below.',
      widget: 'throttle',
    },
    {
      name: 'tryCatch',
      signature: 'tryCatch(fn, fallback?): T | F',
      summary: 'Returns a fallback instead of throwing. The fallback may receive the error.',
      inputs: [text('json to parse', '{bad json}'), json('fallback', '{ "parsed": false }')],
      callOverride: (v) => `tryCatch(() => JSON.parse(${JSON.stringify(v[0])}), ${v[1]})`,
      run: (raw: never, fallback: never) =>
        functional.tryCatch(() => JSON.parse(raw as unknown as string) as unknown, fallback),
    },
    {
      name: 'asyncTryCatch',
      signature: 'asyncTryCatch(fn, fallback?): Promise<T | F>',
      summary: 'Catches rejections and synchronous throws. Resolve the promise to see the value.',
      inputs: [json('shouldReject', 'true'), json('fallback', '"fell back"')],
      callOverride: (v) =>
        `await asyncTryCatch(() => (${v[0]} ? Promise.reject(new Error('boom')) : Promise.resolve('resolved')), ${v[1]})`,
      run: (shouldReject: never, fallback: never) =>
        functional.asyncTryCatch(
          () => (shouldReject ? Promise.reject(new Error('boom')) : Promise.resolve('resolved')),
          fallback,
        ),
    },
    {
      name: 'tap',
      signature: 'tap<T>(value, callback): T',
      summary: 'Runs a side effect and returns the value unchanged.',
      inputs: [json('value', '[1, 2, 3]')],
      callOverride: (v) => `tap(${v[0]}, (value) => console.log(value))`,
      run: (input: never) => {
        const seen: unknown[] = [];
        const returned = functional.tap(input, (v) => seen.push(v));
        return { returned, callbackSaw: seen, sameReference: returned === input };
      },
    },
    {
      name: 'when',
      signature: 'when(condition, valueOrFn, otherwise?)',
      summary: 'Lazy conditional: only the taken branch is evaluated.',
      inputs: [json('condition', 'true'), json('value', '"yes"'), json('otherwise', '"no"')],
      run: functional.when,
    },
    {
      name: 'unless',
      signature: 'unless(condition, valueOrFn, otherwise?)',
      summary: 'The inverse of when.',
      inputs: [json('condition', 'false'), json('value', '"shown"'), json('otherwise', '"hidden"')],
      run: functional.unless,
    },
  ],
};
