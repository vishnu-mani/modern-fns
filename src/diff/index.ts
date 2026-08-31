/**
 * Structural diffing: dirty checking, audit logs, PATCH bodies, undo/redo.
 *
 * @module diff
 */
export { diff, type DiffOptions } from './diff.js';
export { changed } from './changed.js';
export { patch, invert } from './patch.js';
export type { Change, ChangeType } from '../types.js';
