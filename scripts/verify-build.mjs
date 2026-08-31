#!/usr/bin/env node
/**
 * Build verification: proves the published artefact actually works before it is published.
 *
 *  1. every `exports` entry point resolves
 *  2. ESM named imports work
 *  3. CJS `require` works
 *  4. subpath imports work and expose both a named and a default export
 *  5. declaration files exist next to every JS file
 *  6. no runtime dependencies leaked in
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const failures = [];
const check = async (label, fn) => {
  try {
    const detail = await fn();
    console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ''}`);
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
    console.log(`  ✗ ${label}: ${error.message}`);
  }
};

console.log('• verifying build output');

await check('dist/ exists', () => {
  if (!existsSync(join(root, 'dist/index.js'))) throw new Error('run npm run build first');
});

const esm = await import(pathToFileURL(join(root, 'dist/index.js')).href);
await check('ESM named exports', () => {
  const missing = ['chunk', 'groupBy', 'diff', 'set', 'pipe', 'slugify'].filter(
    (n) => typeof esm[n] !== 'function',
  );
  if (missing.length) throw new Error(`missing ${missing.join(', ')}`);
  return `${Object.keys(esm).length} exports`;
});

await check('ESM namespaces', () => {
  for (const ns of [
    'array',
    'object',
    'string',
    'number',
    'url',
    'query',
    'value',
    'functional',
    'collection',
  ]) {
    if (typeof esm[ns] !== 'object') throw new Error(`namespace ${ns} missing`);
  }
});

await check('CJS require', () => {
  const cjs = require(join(root, 'dist/cjs/index.js'));
  if (typeof cjs.chunk !== 'function') throw new Error('chunk missing from CJS build');
  if (cjs.chunk([1, 2, 3], 2).length !== 2) throw new Error('CJS chunk misbehaves');
});

const subpaths = [
  ['array/chunk', (m) => m.chunk([1, 2, 3], 2).length === 2 && typeof m.default === 'function'],
  ['diff/diff', (m) => m.diff({ a: 1 }, { a: 2 }).length === 1],
  ['object/set', (m) => m.set({ a: { b: 1 } }, 'a.b', 2).a.b === 2],
  ['query/parse', (m) => m.parse('?a=1').a === 1],
  ['url/setQuery', (m) => m.setQuery('/p?page=2', 'sort', 'price') === '/p?page=2&sort=price'],
  ['string/slugify', (m) => m.slugify('Hello Vue World!') === 'hello-vue-world'],
  ['number/abbreviate', (m) => m.abbreviate(1500000) === '1.5M'],
  ['value/toNumber', (m) => m.toNumber('₹1,299.50') === 1299.5],
  ['functional/pipe', (m) => m.pipe((n) => n + 1)(1) === 2],
  ['collection/size', (m) => m.size({ a: 1 }) === 1],
];
for (const [subpath, assertion] of subpaths) {
  await check(`subpath modern-fns/${subpath}`, async () => {
    const mod = await import(pathToFileURL(join(root, 'dist', `${subpath}.js`)).href);
    if (!assertion(mod)) throw new Error('behaviour assertion failed');
  });
}
await check('declaration files', () => {
  const walk = (dir) =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) return entry === 'cjs' ? [] : walk(full);
      return full.endsWith('.js') ? [full] : [];
    });
  const jsFiles = walk(join(root, 'dist'));
  const missing = jsFiles.filter((file) => !existsSync(file.replace(/\.js$/, '.d.ts')));
  if (missing.length) throw new Error(`${missing.length} files without .d.ts`);
  return `${jsFiles.length} modules typed`;
});

await // Every exports condition must carry its own `types`. With a single top-level `types` inside a
// "type": "module" package, TypeScript 5.6 reads the CJS entry points as ESM and CJS consumers
// fail with TS1479 / TS1471 even though the runtime works. Newer TypeScript recovers by finding
// the adjacent .d.ts, which is exactly why this needs a structural check rather than a
// compile-it-and-see one.
await check('exports map declares types per condition', () => {
  const problems = [];
  for (const [subpath, target] of Object.entries(pkg.exports)) {
    if (typeof target === 'string') continue;
    for (const condition of ['import', 'require']) {
      const value = target[condition];
      if (!value || typeof value !== 'object') {
        problems.push(`${subpath}: missing ${condition} condition`);
        continue;
      }
      if (!value.types) problems.push(`${subpath}: ${condition} has no types`);
      if (Object.keys(value)[0] !== 'types')
        problems.push(`${subpath}: types must come first in ${condition}`);
      if (!value.default) problems.push(`${subpath}: ${condition} has no default`);
    }
    if (target.require?.types && !target.require.types.includes('/cjs/')) {
      problems.push(`${subpath}: require condition points at the ESM declarations`);
    }
  }
  if (problems.length) throw new Error(problems.join('; '));
  return `${Object.keys(pkg.exports).length} entries`;
});

await check('every exports target exists on disk', () => {
  const missing = [];
  const probe = (spec) => {
    // Wildcards are checked with a representative concrete subpath.
    const file = spec.replace('*', 'chunk').replace('./', '');
    if (spec.includes('*') && !spec.includes('array')) return;
    if (!existsSync(join(root, file))) missing.push(file);
  };
  for (const [subpath, target] of Object.entries(pkg.exports)) {
    if (typeof target === 'string') continue;
    if (!subpath.startsWith('./array') && subpath !== '.') continue;
    for (const condition of ['import', 'require']) {
      probe(target[condition].types);
      probe(target[condition].default);
    }
  }
  if (missing.length) throw new Error(`missing ${missing.join(', ')}`);
});

// Resolve through the real Node resolver, by package specifier, not by file path — the only way
// to prove the exports map itself works.
await check('resolves by package specifier (ESM and CJS)', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'modern-fns-resolve-'));
  try {
    mkdirSync(join(sandbox, 'node_modules'), { recursive: true });
    symlinkSync(root, join(sandbox, 'node_modules/modern-fns'), 'dir');

    const esm = [
      "import { chunk, diff } from 'modern-fns';",
      "import setQuery from 'modern-fns/url/setQuery';",
      "import { parse } from 'modern-fns/query/parse';",
      "if (chunk([1,2,3],2).length !== 2) throw new Error('chunk');",
      "if (diff({a:1},{a:2}).length !== 1) throw new Error('diff');",
      "if (setQuery('/p?page=2','sort','price') !== '/p?page=2&sort=price') throw new Error('setQuery');",
      "if (parse('?a=1').a !== 1) throw new Error('parse');",
    ].join('\n');
    execFileSync(process.execPath, ['--input-type=module', '-e', esm], {
      cwd: sandbox,
      stdio: 'pipe',
    });

    const cjs = [
      "const { chunk } = require('modern-fns');",
      "const { setQuery } = require('modern-fns/url/setQuery');",
      "const { parse } = require('modern-fns/query/parse');",
      "if (chunk([1,2,3],2).length !== 2) throw new Error('chunk');",
      "if (setQuery('/p?page=2','sort','price') !== '/p?page=2&sort=price') throw new Error('setQuery');",
      "if (parse('?a=1').a !== 1) throw new Error('parse');",
    ].join('\n');
    execFileSync(process.execPath, ['--input-type=commonjs', '-e', cjs], {
      cwd: sandbox,
      stdio: 'pipe',
    });
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
  return 'root + 2 subpaths, both module systems';
});

// Typecheck real consumer projects against the **packed tarball**, extracted into node_modules
// exactly as npm would install it (a symlinked package does not reproduce installed-package type
// resolution). This proves consumers compile; the structural `exports` check above is what
// actually guards the per-condition `types` rule, because TypeScript >= 5.9 papers over a missing
// one by falling back to the adjacent .d.ts, while 5.6 fails with TS1479 / TS1471.
await check('typechecks in ESM and CJS consumer projects', () => {
  const tsc = join(root, 'node_modules/typescript/bin/tsc');
  if (!existsSync(tsc)) return 'skipped — typescript not installed';

  const CONSUMERS = [
    {
      name: 'esm',
      pkg: { name: 'c-esm', private: true, type: 'module', version: '0.0.0' },
      code: [
        "import { chunk, groupBy } from 'modern-fns';",
        "import setQuery from 'modern-fns/url/setQuery';",
        'const a: number[][] = chunk([1, 2, 3], 2);',
        "const g: Record<string, { id: number }[]> = groupBy([{ id: 1 }], 'id');",
        "export const out = [a, g, setQuery('/p', 'a', 1)];",
      ],
    },
    {
      name: 'cjs',
      pkg: { name: 'c-cjs', private: true, version: '0.0.0' },
      code: [
        "import { chunk } from 'modern-fns';",
        "import setQuery = require('modern-fns/url/setQuery');",
        'const a: number[][] = chunk([1, 2, 3], 2);',
        "export const out = [a, setQuery.setQuery('/p', 'a', 1)];",
      ],
    },
  ];

  const sandbox = mkdtempSync(join(tmpdir(), 'modern-fns-consumer-'));
  try {
    // Pack, then extract as npm would: the tarball's `package/` prefix becomes the package root.
    const packed = execFileSync('npm', ['pack', '--silent', '--pack-destination', sandbox], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .trim()
      .split('\n')
      .pop();
    const tarball = join(sandbox, packed);

    for (const consumer of CONSUMERS) {
      const dir = join(sandbox, consumer.name);
      const installed = join(dir, 'node_modules/modern-fns');
      mkdirSync(installed, { recursive: true });
      execFileSync('tar', ['-xzf', tarball, '-C', installed, '--strip-components=1'], {
        stdio: 'pipe',
      });
      writeFileSync(join(dir, 'package.json'), JSON.stringify(consumer.pkg, null, 2));
      writeFileSync(
        join(dir, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            noEmit: true,
            skipLibCheck: true,
          },
        }),
      );
      writeFileSync(join(dir, 'index.ts'), consumer.code.join('\n'));
      try {
        execFileSync(process.execPath, [tsc, '-p', dir], { stdio: 'pipe' });
      } catch (error) {
        const output = String(error.stdout ?? '') + String(error.stderr ?? '');
        throw new Error(`${consumer.name} consumer: ${output.trim().split('\n')[0]}`);
      }
    }
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
  return 'packed tarball, NodeNext resolution, both module systems';
});

await check('zero runtime dependencies', () => {
  const deps = Object.keys(pkg.dependencies ?? {});
  if (deps.length) throw new Error(`found ${deps.join(', ')}`);
  const peer = Object.keys(pkg.peerDependencies ?? {});
  if (peer.length) throw new Error(`found peer deps ${peer.join(', ')}`);
});

await check('no bare imports in dist', () => {
  const walk = (dir) =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : full.endsWith('.js') ? [full] : [];
    });
  for (const file of walk(join(root, 'dist'))) {
    const source = readFileSync(file, 'utf8');
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const bare = [
      ...code.matchAll(/(?:^|[;{}\s])(?:import|export)[^;]*?from\s*['"]([^.'"][^'"]*)['"]/g),
      ...code.matchAll(/require\(\s*['"]([^.'"][^'"]*)['"]\s*\)/g),
    ]
      .map((m) => m[1])
      .filter((name) => name !== 'node:module');
    if (bare.length) throw new Error(`${file} imports ${bare.join(', ')}`);
  }
});

if (failures.length > 0) {
  console.error(`\n✗ build verification failed (${failures.length})`);
  process.exit(1);
}
console.log('✓ build verified');
