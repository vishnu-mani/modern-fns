import * as lib from 'modern-fns';
import { arrayModule } from './array';
import { objectModule, diffModule } from './object';
import { stringModule } from './string';
import { numberModule } from './number';
import { urlModule, queryModule } from './url';
import { valueModule } from './value';
import { functionalModule } from './functional';
import { collectionModule } from './collection';
import type { DemoModule } from './types';

export const modules: DemoModule[] = [
  arrayModule,
  objectModule,
  diffModule,
  stringModule,
  numberModule,
  urlModule,
  queryModule,
  valueModule,
  functionalModule,
  collectionModule,
];

const NAMESPACES = [
  'array',
  'object',
  'string',
  'number',
  'url',
  'query',
  'value',
  'functional',
  'collection',
] as const;

export interface Coverage {
  exported: number;
  demoed: number;
  missing: string[];
  unknown: string[];
  uniqueFunctions: number;
}

/**
 * Compare the demo registry against what the library actually exports, so a function added to
 * modern-fns without a demo shows up here instead of being quietly missed.
 */
export function computeCoverage(): Coverage {
  const exported = new Map<string, Set<string>>();
  const unique = new Set<unknown>();

  for (const ns of NAMESPACES) {
    const bucket = new Set<string>();
    for (const [key, value] of Object.entries(lib[ns] as Record<string, unknown>)) {
      if (typeof value !== 'function') continue;
      bucket.add(key);
      unique.add(value);
    }
    exported.set(ns, bucket);
  }
  // The diff module is flat-exported rather than namespaced.
  const diffNames = new Set(['diff', 'changed', 'patch', 'invert']);
  for (const name of diffNames) unique.add((lib as unknown as Record<string, unknown>)[name]);
  exported.set('diff', diffNames);

  const demoed = new Map<string, Set<string>>();
  for (const mod of modules) {
    demoed.set(mod.module, new Set(mod.specs.map((spec) => spec.name)));
  }

  const missing: string[] = [];
  const unknown: string[] = [];
  let exportedCount = 0;
  let demoedCount = 0;

  for (const [ns, names] of exported) {
    const shown = demoed.get(ns) ?? new Set<string>();
    exportedCount += names.size;
    for (const name of names) {
      if (shown.has(name)) demoedCount += 1;
      else missing.push(`${ns}.${name}`);
    }
    for (const name of shown) {
      if (!names.has(name)) unknown.push(`${ns}.${name}`);
    }
  }

  return {
    exported: exportedCount,
    demoed: demoedCount,
    missing: missing.sort(),
    unknown: unknown.sort(),
    uniqueFunctions: unique.size,
  };
}
