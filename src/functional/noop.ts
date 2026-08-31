/**
 * Do nothing. A stable, shared empty callback — useful as a default prop so consumers never
 * allocate a new closure per render.
 *
 * @example
 * const { onChange = noop } = props;
 */
export function noop(): void {
  /* intentionally empty */
}
export default noop;
