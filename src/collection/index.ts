/**
 * Container-agnostic iteration: one signature for arrays, objects, `Map`, `Set`, strings and
 * iterables.
 *
 * @module collection
 */
export { size } from './size.js';
export { first } from './first.js';
export { last } from './last.js';
export { isEmpty } from './isEmpty.js';
export { each } from './each.js';
export { map } from './map.js';
export { filter } from './filter.js';
export { find } from './find.js';
export { some } from './some.js';
export { every } from './every.js';
export type { Collection, CollectionKey } from '../internal/collection.js';
