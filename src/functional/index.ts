/**
 * Functional helpers: composition, memoisation, rate limiting and safe execution.
 *
 * @module functional
 */
export { pipe } from './pipe.js';
export { compose } from './compose.js';
export { identity } from './identity.js';
export { noop } from './noop.js';
export { once } from './once.js';
export { memoize, type MemoizeOptions, type Memoized } from './memoize.js';
export { debounce, type DebounceOptions, type Debounced } from './debounce.js';
export { throttle } from './throttle.js';
export { tryCatch } from './tryCatch.js';
export { asyncTryCatch } from './asyncTryCatch.js';
export { tap } from './tap.js';
export { when } from './when.js';
export { unless } from './unless.js';
