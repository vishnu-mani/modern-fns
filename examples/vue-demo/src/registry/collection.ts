import { collection } from 'modern-fns';
import { fn, json, type DemoModule } from './types';

const OBJECT = '{ "a": 1, "b": 2, "c": 3 }';

export const collectionModule: DemoModule = {
  module: 'collection',
  blurb:
    'One iteration API across arrays, objects, Map, Set, strings and iterables. map and filter preserve the container type.',
  specs: [
    {
      name: 'size',
      signature: 'size(value): number',
      summary:
        'length, size or Object.keys().length — whichever applies. Strings count code points.',
      inputs: [json('value', OBJECT)],
      run: collection.size,
    },
    {
      name: 'first',
      signature: 'first<T>(value): T | undefined',
      summary: 'First value of any container, in iteration order.',
      inputs: [json('value', OBJECT)],
      run: collection.first,
    },
    {
      name: 'last',
      signature: 'last<T>(value): T | undefined',
      summary: 'Last value of any container.',
      inputs: [json('value', OBJECT)],
      run: collection.last,
    },
    {
      name: 'isEmpty',
      signature: 'isEmpty(value): boolean',
      summary: 'Shared with value/isEmpty.',
      inputs: [json('value', '{}')],
      run: collection.isEmpty,
    },
    {
      name: 'each',
      signature: 'each(value, iteratee): void',
      summary: 'Return false from the iteratee to stop early — forEach cannot do that.',
      inputs: [
        json('value', '[1, 2, 3, 4]'),
        fn('iteratee', '(n) => (n === 3 ? false : undefined)'),
      ],
      callOverride: (v) => `each(${v[0]}, ${v[1]})`,
      run: (input: never, iteratee: never) => {
        const visited: unknown[] = [];
        collection.each(input, (item, key) => {
          visited.push({ key, item });
          return (iteratee as (v: unknown) => unknown)(item);
        });
        return { visited, note: 'iteration stopped when the iteratee returned false' };
      },
    },
    {
      name: 'map',
      signature: 'map(value, iteratee)',
      summary: 'Objects stay objects, Maps stay Maps, Sets stay Sets.',
      inputs: [json('value', OBJECT), fn('iteratee', '(n) => n * 10')],
      run: collection.map,
    },
    {
      name: 'filter',
      signature: 'filter(value, predicate)',
      summary: 'Filtering an object by value, in one call.',
      inputs: [json('value', OBJECT), fn('predicate', '(n) => n > 1')],
      run: collection.filter,
    },
    {
      name: 'find',
      signature: 'find(value, predicate)',
      summary: 'First matching value in any container.',
      inputs: [json('value', OBJECT), fn('predicate', '(n) => n > 2')],
      run: collection.find,
    },
    {
      name: 'some',
      signature: 'some(value, predicate): boolean',
      summary: 'Short-circuits on the first match.',
      inputs: [json('value', OBJECT), fn('predicate', '(n) => n > 2')],
      run: collection.some,
    },
    {
      name: 'every',
      signature: 'every(value, predicate): boolean',
      summary: 'Vacuously true for an empty container.',
      inputs: [json('value', OBJECT), fn('predicate', '(n) => n > 0')],
      run: collection.every,
    },
  ],
};
