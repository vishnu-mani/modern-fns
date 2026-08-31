/**
 * Object utilities: path access, immutable updates, structural equality, flattening.
 *
 * @module object
 */
export { get } from './get.js';
export { set } from './set.js';
export { has } from './has.js';
export { unset } from './unset.js';
export { pick } from './pick.js';
export { omit } from './omit.js';
export { deepClone } from './deepClone.js';
export { deepMerge, deepMergeWith, type DeepMergeOptions } from './deepMerge.js';
export { mapValues } from './mapValues.js';
export { mapKeys } from './mapKeys.js';
export { isEqual } from './isEqual.js';
export { isEmpty } from './isEmpty.js';
export { flattenObject, type FlattenOptions } from './flattenObject.js';
export { unflattenObject } from './unflattenObject.js';
