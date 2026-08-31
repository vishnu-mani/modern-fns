#!/usr/bin/env node
/**
 * Build modern-fns.
 *
 * Deliberately uses `tsc` rather than a bundler: the published `dist` mirrors `src`
 * file-for-file, so a consumer importing one function gets exactly one module (plus its
 * internal helpers) and every bundler can shake the rest away without heuristics.
 *
 *   dist/       ESM + .d.ts   (the "import" condition)
 *   dist/cjs/   CJS + .d.ts   (the "require" condition)
 */
import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (args) => execFileSync('npx', args, { cwd: root, stdio: 'inherit' });

console.log('• cleaning dist');
rmSync(resolve(root, 'dist'), { recursive: true, force: true });

console.log('• building ESM + types (tsconfig.build.json)');
run(['tsc', '-p', 'tsconfig.build.json']);

console.log('• building CJS (tsconfig.cjs.json)');
run(['tsc', '-p', 'tsconfig.cjs.json']);

mkdirSync(resolve(root, 'dist/cjs'), { recursive: true });
writeFileSync(
  resolve(root, 'dist/cjs/package.json'),
  `${JSON.stringify({ type: 'commonjs', sideEffects: false }, null, 2)}\n`,
);

console.log('✓ build complete');
