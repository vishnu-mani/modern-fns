#!/usr/bin/env node
/**
 * Bundle-size budget check.
 *
 * Bundles + minifies representative entry points with esbuild and gzips the result, which is
 * what a consumer's bundler will actually ship. Fails the build when a budget is exceeded.
 */
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

if (!existsSync(join(dist, 'index.js'))) {
  console.error('✗ dist/ missing — run `npm run build` first');
  process.exit(1);
}

/** [entry, gzip budget in bytes] */
const ENTRIES = [
  ['array/chunk.js', 400],
  ['array/groupBy.js', 500],
  ['array/diffArray.js', 2000],
  ['object/set.js', 700],
  ['object/isEqual.js', 1200],
  ['diff/diff.js', 2000],
  ['string/slugify.js', 700],
  ['number/currency.js', 500],
  ['url/setQuery.js', 2000],
  ['query/parse.js', 1600],
  ['value/toNumber.js', 700],
  ['functional/debounce.js', 700],
  ['array/index.js', 6000],
  ['index.js', 18000],
];

const format = (bytes) => `${(bytes / 1024).toFixed(2)} kB`;
let failed = false;
const rows = [];

for (const [entry, budget] of ENTRIES) {
  const result = await build({
    entryPoints: [join(dist, entry)],
    bundle: true,
    minify: true,
    format: 'esm',
    write: false,
    treeShaking: true,
    target: 'es2021',
    logLevel: 'silent',
  });
  const raw = result.outputFiles[0].contents;
  const gzip = gzipSync(Buffer.from(raw)).length;
  const ok = gzip <= budget;
  if (!ok) failed = true;
  rows.push({
    entry: `modern-fns/${entry.replace(/\.js$/, '').replace(/\/index$/, '')}`,
    min: format(raw.length),
    gzip: format(gzip),
    budget: format(budget),
    status: ok ? 'ok' : 'OVER',
  });
}

console.table(rows);
if (failed) {
  console.error('✗ bundle-size budget exceeded');
  process.exit(1);
}
console.log('✓ all entries within budget');
