/**
 * Array utilities. Every function is immutable and accepts `keyof T | (item) => key` selectors.
 *
 * @module array
 */
export { chunk } from './chunk.js';
export { unique } from './unique.js';
export { uniqueBy } from './uniqueBy.js';
export { groupBy } from './groupBy.js';
export { indexBy } from './indexBy.js';
export { partition } from './partition.js';
export { sortBy, compareValues } from './sortBy.js';
export { orderBy } from './orderBy.js';
export { flatten } from './flatten.js';
export { flattenDeep } from './flattenDeep.js';
export { compact } from './compact.js';
export { difference } from './difference.js';
export { intersection } from './intersection.js';
export { union } from './union.js';
export { zip, type Zipped } from './zip.js';
export { unzip } from './unzip.js';
export { first } from './first.js';
export { last } from './last.js';
export { take } from './take.js';
export { takeRight } from './takeRight.js';
export { drop } from './drop.js';
export { dropRight } from './dropRight.js';
export { range } from './range.js';
export { window, slidingWindow } from './window.js';
export {
  diffArray,
  type ArrayDiff,
  type UpdatedEntry,
  type DiffArrayOptions,
} from './diffArray.js';
