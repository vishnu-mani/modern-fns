/** How one editable argument is rendered and parsed. */
export type InputKind = 'json' | 'text' | 'number' | 'boolean' | 'select' | 'fn';

export interface DemoInput {
  label: string;
  kind: InputKind;
  /** Always stored as text so it can be edited freely; parsed per `kind` at run time. */
  value: string;
  options?: string[];
  rows?: number;
}

export interface DemoSpec {
  /** Exported name, exactly as the library exposes it. */
  name: string;
  signature: string;
  summary: string;
  inputs: DemoInput[];
  run: (...args: never[]) => unknown;
  /** Extra behaviour that a static call cannot show (timers, caches, counters). */
  widget?: 'debounce' | 'throttle' | 'memoize' | 'once' | 'random';
  /** Shown instead of the generated call when the demo wraps the function. */
  callOverride?: (values: string[]) => string;
  note?: string;
}

export interface DemoModule {
  module: string;
  blurb: string;
  specs: DemoSpec[];
}

export const json = (label: string, value: string, rows = 1): DemoInput => ({
  label,
  kind: 'json',
  value,
  rows,
});
export const text = (label: string, value: string): DemoInput => ({ label, kind: 'text', value });
export const num = (label: string, value: string): DemoInput => ({ label, kind: 'number', value });
export const bool = (label: string, value: string): DemoInput => ({
  label,
  kind: 'boolean',
  value,
});
export const pick = (label: string, value: string, options: string[]): DemoInput => ({
  label,
  kind: 'select',
  value,
  options,
});
export const fn = (label: string, value: string): DemoInput => ({ label, kind: 'fn', value });

/** Parse one edited input into the value the library will receive. */
export function parseInput(input: DemoInput): unknown {
  switch (input.kind) {
    case 'json':
      return JSON.parse(input.value);
    case 'number':
      return input.value.trim() === '' ? undefined : Number(input.value);
    case 'boolean':
      return input.value === 'true';
    case 'fn':
      // Compiling the edited arrow is what makes predicates and selectors editable. This is a
      // local playground running code the developer typed themselves — never do this with input
      // that arrives from a user or the network.
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      return new Function(`return (${input.value})`)() as unknown;
    default:
      return input.value;
  }
}

/** Render the call the way a developer would type it. */
export function callSource(spec: DemoSpec): string {
  const raw = spec.inputs.map((input) => input.value);
  if (spec.callOverride) return spec.callOverride(raw);
  const args = spec.inputs.map((input) =>
    input.kind === 'text' || input.kind === 'select' ? JSON.stringify(input.value) : input.value,
  );
  return `${spec.name}(${args.join(', ')})`;
}
