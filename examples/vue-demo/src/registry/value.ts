import { value } from 'modern-fns';
import { json, text, type DemoModule } from './types';

const guard = (name: string, summary: string, sample: string, run: (v: never) => unknown) => ({
  name,
  signature: `${name}(value: unknown): boolean`,
  summary,
  inputs: [json('value', sample)],
  run,
});

export const valueModule: DemoModule = {
  module: 'value',
  blurb: 'Coercion and type guards for untrusted input. Nothing throws; unusable input falls back.',
  specs: [
    {
      name: 'toString',
      signature: 'toString(value, defaultValue?): string',
      summary: 'Never produces "null", "undefined" or "[object Object]".',
      inputs: [json('value', '{ "a": 1 }'), text('defaultValue', '')],
      run: value.toString,
    },
    {
      name: 'toNumber',
      signature: 'toNumber(value, defaultValue?): number',
      summary: 'Currency symbols, thousands separators and European decimals all parse.',
      inputs: [text('value', '₹1,299.50'), json('defaultValue', 'null')],
      run: value.toNumber,
    },
    {
      name: 'toBoolean',
      signature: 'toBoolean(value, defaultValue?): boolean',
      summary: 'Understands "false", "0", "no", "off" — where Boolean("false") is true.',
      inputs: [text('value', 'false'), json('defaultValue', 'false')],
      run: value.toBoolean,
    },
    {
      name: 'toArray',
      signature: 'toArray<T>(value): T[]',
      summary: 'One-or-many to array. Strings are wrapped, not split into characters.',
      inputs: [json('value', '"abc"')],
      run: value.toArray,
    },
    {
      name: 'toDate',
      signature: 'toDate(value, defaultValue?): Date | undefined',
      summary: 'ISO strings, epoch ms, and 10-digit epoch seconds (auto-detected).',
      inputs: [text('value', '2026-08-31')],
      callOverride: (v) => `toDate(${JSON.stringify(v[0])})?.toISOString()`,
      run: (input: never) => {
        const date = value.toDate(input);
        return date ? date.toISOString() : undefined;
      },
    },
    {
      name: 'toObject',
      signature: 'toObject(value, defaultValue?): Record<string, unknown>',
      summary: 'JSON strings, Maps, URLSearchParams and entry pairs become plain objects.',
      inputs: [text('value', '{"a":1}')],
      run: value.toObject,
    },
    guard('isNull', 'Only null, never undefined.', 'null', value.isNull),
    guard('isUndefined', 'Only undefined, never null.', 'null', value.isUndefined),
    guard('isNil', 'null or undefined — the check you usually want.', '0', value.isNil),
    guard('isString', 'String primitives only.', '"abc"', value.isString),
    guard('isNumber', 'Finite numbers only: NaN and Infinity are false.', '42', value.isNumber),
    guard('isBoolean', 'Boolean primitives.', 'false', value.isBoolean),
    guard('isArray', 'Typed Array.isArray.', '[1, 2]', value.isArray),
    guard(
      'isObject',
      'Plain objects only: not arrays, Date, Map or class instances.',
      '{ "a": 1 }',
      value.isObject,
    ),
    {
      name: 'isFunction',
      signature: 'isFunction(value: unknown): boolean',
      summary: 'Anything callable, including classes and async functions.',
      inputs: [{ label: 'value', kind: 'fn', value: '() => 1' }],
      run: value.isFunction,
    },
    guard('isEmpty', '0 and false are values, not absences.', '"   "', value.isEmpty),
    {
      name: 'defaultTo',
      signature: 'defaultTo<T, D>(value, defaultValue): T | D',
      summary: 'Like ?? but it also catches NaN. Keeps 0, "" and false.',
      inputs: [json('value', 'null'), json('defaultValue', '0')],
      run: value.defaultTo,
    },
    {
      name: 'nullable',
      signature: 'nullable<T>(value): T | null',
      summary: 'Blank strings and undefined become null, so a cleared field reaches the API.',
      inputs: [text('value', '   ')],
      run: value.nullable,
    },
    {
      name: 'coalesce',
      signature: 'coalesce<T>(...values): T | undefined',
      summary: 'First non-nullish value. A variadic ??.',
      inputs: [json('a', 'null'), json('b', '0'), json('c', '"fallback"')],
      run: value.coalesce,
    },
  ],
};
