import { object, diff as diffFn, changed, patch, invert } from 'modern-fns';
import { fn, json, text, type DemoModule } from './types';

const USER = `{
  "id": 1,
  "name": "Vishnu",
  "company": { "address": { "city": "Kochi", "zip": null } },
  "users": [{ "address": { "city": "Delhi" } }]
}`;

export const objectModule: DemoModule = {
  module: 'object',
  blurb: 'Path access and immutable updates. Paths accept a.b.c, a[0].b and a["dotted.key"].',
  specs: [
    {
      name: 'get',
      signature: 'get<T>(object, path, defaultValue?): T | undefined',
      summary: 'Read a nested value. A stored null is returned, not replaced by the default.',
      inputs: [
        json('object', USER, 6),
        text('path', 'company.address.city'),
        json('default', '"n/a"'),
      ],
      run: object.get,
    },
    {
      name: 'set',
      signature: 'set<T>(object, path, value): T',
      summary: 'Immutable write. Untouched branches keep their reference.',
      inputs: [
        json('object', USER, 6),
        text('path', 'company.address.city'),
        json('value', '"Delhi"'),
      ],
      run: object.set,
    },
    {
      name: 'has',
      signature: 'has(object, path): boolean',
      summary: 'Distinguishes absent from present-and-undefined.',
      inputs: [
        json('object', '{ "a": { "b": undefined } }'.replace('undefined', 'null')),
        text('path', 'a.b'),
      ],
      run: object.has,
    },
    {
      name: 'unset',
      signature: 'unset<T>(object, path): T',
      summary: 'Immutable remove; array indices are spliced, not holed.',
      inputs: [json('object', '{ "list": [1, 2, 3], "keep": true }'), text('path', 'list[1]')],
      run: object.unset,
    },
    {
      name: 'pick',
      signature: 'pick<T, K>(object, paths): Pick<T, K>',
      summary: 'Keep listed keys. Absent keys are skipped, not set to undefined.',
      inputs: [json('object', USER, 6), json('paths', '["id", "company.address.city"]')],
      run: object.pick,
    },
    {
      name: 'omit',
      signature: 'omit<T, K>(object, paths): Omit<T, K>',
      summary: 'Drop listed keys, immutably. Dotted paths remove nested keys.',
      inputs: [json('object', USER, 6), json('paths', '["company.address.zip"]')],
      run: object.omit,
    },
    {
      name: 'deepClone',
      signature: 'deepClone<T>(value: T): T',
      summary: 'Handles Date, RegExp, Map, Set, typed arrays, class prototypes and cycles.',
      inputs: [json('value', '{ "a": { "b": [1, { "c": 2 }] } }')],
      callOverride: (v) => `const clone = deepClone(${v[0]}); clone === original`,
      run: (value: never) => {
        const copy = object.deepClone(value) as Record<string, unknown>;
        return { clone: copy, isSameReference: copy === value };
      },
    },
    {
      name: 'deepMerge',
      signature: 'deepMerge(...objects): merged',
      summary: 'Recursive merge of plain objects; arrays replaced, later sources win.',
      inputs: [
        json('a', '{ "a": { "b": 1, "c": 2 }, "list": [1, 2] }'),
        json('b', '{ "a": { "c": 3 }, "list": [9] }'),
      ],
      run: object.deepMerge,
    },
    {
      name: 'deepMergeWith',
      signature: 'deepMergeWith(options, ...objects): merged',
      summary: 'deepMerge with array strategy control: replace, concat or merge.',
      inputs: [
        json('options', '{ "arrays": "concat" }'),
        json('a', '{ "list": [1, 2] }'),
        json('b', '{ "list": [3] }'),
      ],
      run: object.deepMergeWith,
    },
    {
      name: 'mapValues',
      signature: 'mapValues<T, R>(object, iteratee): Record<keyof T, R>',
      summary: 'Array.map for object values.',
      inputs: [json('object', '{ "a": 1, "b": 2 }'), fn('iteratee', '(n) => n * 10')],
      run: object.mapValues,
    },
    {
      name: 'mapKeys',
      signature: 'mapKeys<T>(object, iteratee): Record<string, T[keyof T]>',
      summary: 'Rename every key — snake_case APIs meeting camelCase frontends.',
      inputs: [
        json('object', '{ "first_name": "Vishnu", "last_name": "M" }'),
        fn('iteratee', '(key) => key.replace(/_(.)/g, (_, c) => c.toUpperCase())'),
      ],
      run: object.mapKeys,
    },
    {
      name: 'isEqual',
      signature: 'isEqual(a, b): boolean',
      summary: 'Deep structural equality: NaN equals NaN, Map/Set by content, cycles handled.',
      inputs: [json('a', '{ "a": [1, { "b": 2 }] }'), json('b', '{ "a": [1, { "b": 2 }] }')],
      run: object.isEqual,
    },
    {
      name: 'isEmpty',
      signature: 'isEmpty(value): boolean',
      summary: 'Shared with value/isEmpty: 0 and false are values, not absences.',
      inputs: [json('value', '{}')],
      run: object.isEmpty,
    },
    {
      name: 'flattenObject',
      signature: 'flattenObject(object, options?): Record<string, unknown>',
      summary: 'Nested structure to path -> value. Round-trips with unflattenObject.',
      inputs: [
        json('object', '{ "user": { "name": "V", "tags": ["a", "b"] } }'),
        json('options', '{ "delimiter": "." }'),
      ],
      run: object.flattenObject,
    },
    {
      name: 'unflattenObject',
      signature: 'unflattenObject(object, options?): Record<string, unknown>',
      summary: 'Rebuild nested structures from flat path keys.',
      inputs: [json('object', '{ "user.name": "V", "user.tags[0]": "a" }')],
      run: object.unflattenObject,
    },
  ],
};

export const diffModule: DemoModule = {
  module: 'diff',
  blurb: 'Structural change sets for dirty checking, audit logs, PATCH bodies and undo/redo.',
  specs: [
    {
      name: 'diff',
      signature: 'diff(oldObject, newObject, options?): Change[]',
      summary: 'Flat, serialisable list of added / removed / changed paths.',
      inputs: [
        json('oldObject', '{ "name": "John", "age": 28, "address": { "country": "IN" } }', 3),
        json(
          'newObject',
          '{ "name": "Vishnu", "age": 29, "address": { "country": "IN", "city": "Kochi" } }',
          3,
        ),
        json('options', '{ "arrays": "index" }'),
      ],
      run: diffFn,
    },
    {
      name: 'changed',
      signature: 'changed(oldObject, newObject, options?): boolean',
      summary: 'Is this form dirty? Short-circuits on the first difference.',
      inputs: [
        json('oldObject', '{ "name": "John", "updatedAt": 1 }'),
        json('newObject', '{ "name": "John", "updatedAt": 2 }'),
        json('options', '{}'),
      ],
      run: changed,
    },
    {
      name: 'patch',
      signature: 'patch<T>(object, changes): T',
      summary: 'Apply a change list immutably. patch(before, diff(before, after)) equals after.',
      inputs: [
        json('object', '{ "name": "John", "age": 28 }'),
        json(
          'changes',
          '[{ "path": "name", "type": "changed", "oldValue": "John", "newValue": "Vishnu" }]',
          3,
        ),
      ],
      run: patch,
    },
    {
      name: 'invert',
      signature: 'invert(changes): Change[]',
      summary: 'Reverse a change list so it undoes the edit.',
      inputs: [json('changes', '[{ "path": "city", "type": "added", "newValue": "Kochi" }]', 3)],
      run: invert,
    },
  ],
};
