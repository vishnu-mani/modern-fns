#!/usr/bin/env node
/**
 * Generate the module pages of the website from the repository's `docs/*.md`.
 *
 * The repo docs are the single source of truth. This script adds per-page SEO frontmatter
 * (title, description, canonical, Open Graph) and rewrites the H1 into a human, searchable
 * heading. Generated pages are committed so the site builds without reaching outside its own
 * directory, and `--check` fails CI if they have drifted.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const docs = resolve(site, '../docs');

/** One entry per module page. `title` and `description` are what Google shows. */
const MODULES = [
  {
    slug: 'array',
    h1: 'JavaScript array utilities',
    title: 'JavaScript Array Utilities — chunk, groupBy, sortBy, diffArray',
    description:
      'Immutable TypeScript array helpers: chunk, unique, groupBy, indexBy, partition, sortBy, orderBy, zip, range and diffArray. Zero dependencies, tree-shakeable, one import per function.',
    keywords: 'javascript array utilities, typescript array helpers, groupBy javascript, chunk array',
  },
  {
    slug: 'object',
    h1: 'JavaScript object utilities',
    title: 'JavaScript Object Utilities — get, set, deepMerge, deepClone, isEqual',
    description:
      'Safe nested property access and immutable updates for JavaScript and TypeScript: get, set, has, unset, pick, omit, deepClone, deepMerge, isEqual, flattenObject.',
    keywords: 'javascript object utilities, lodash get alternative, deep clone javascript, immutable set',
  },
  {
    slug: 'diff',
    h1: 'JavaScript object diff',
    title: 'JavaScript Object Diff — deep diff, dirty checking and PATCH bodies',
    description:
      'Compute a structural diff between two JavaScript objects. Detect added, removed and changed paths for form dirty checking, audit logs, API PATCH payloads and undo/redo.',
    keywords: 'javascript object diff, deep diff, compare two objects javascript, json diff',
  },
  {
    slug: 'string',
    h1: 'JavaScript string utilities',
    title: 'JavaScript String Utilities — slugify, camelCase, truncate, mask',
    description:
      'Unicode-aware string helpers for JavaScript and TypeScript: slugify, camelCase, kebabCase, snakeCase, truncate, initials, mask, stripHtml, escapeHtml, isEmail.',
    keywords: 'javascript string utilities, slugify javascript, camelcase converter, truncate string',
  },
  {
    slug: 'number',
    h1: 'JavaScript number utilities',
    title: 'JavaScript Number Utilities — clamp, round, currency, abbreviate',
    description:
      'Decimal-safe number helpers and Intl formatting: clamp, round, percentage, formatNumber, abbreviate (1.5M), currency, tax, discount and compound interest.',
    keywords: 'javascript number utilities, format currency javascript, round decimals javascript, abbreviate number',
  },
  {
    slug: 'url',
    h1: 'JavaScript URL utilities',
    title: 'JavaScript URL Utilities — parse, build and edit URLs safely',
    description:
      'Manipulate absolute and relative URLs without string surgery: parseUrl, buildUrl, setQuery, mergeQuery, removeQuery, setHash, joinUrl and isSameUrl.',
    keywords: 'javascript url utilities, add query param to url javascript, join url paths, parse url',
  },
  {
    slug: 'query',
    h1: 'JavaScript query string utilities',
    title: 'JavaScript Query String Utilities — parse and stringify query params',
    description:
      'Parse and serialise query strings with configurable rules: repeated keys as arrays, nested brackets, number and boolean coercion, toggle, parseArray. A dependency-free qs alternative.',
    keywords: 'javascript query string, parse query params, qs alternative, stringify query string',
  },
  {
    slug: 'value',
    h1: 'JavaScript value coercion and type guards',
    title: 'JavaScript Value Utilities — safe coercion and type guards',
    description:
      'Convert untrusted input safely: toNumber parses "₹1,299.50", toBoolean understands "false", plus toDate, toArray, toObject and typed guards like isNil, isObject and isEmpty.',
    keywords: 'javascript type coercion, string to number javascript, string to boolean, type guards typescript',
  },
  {
    slug: 'functional',
    h1: 'JavaScript functional programming utilities',
    title: 'JavaScript Functional Utilities — pipe, compose, debounce, memoize',
    description:
      'Lightweight functional helpers for JavaScript and TypeScript: pipe, compose, debounce, throttle, memoize, once, tryCatch, tap, when and unless. Async-aware, zero dependencies.',
    keywords: 'javascript debounce, throttle javascript, memoize function, pipe compose javascript',
  },
  {
    slug: 'collection',
    h1: 'JavaScript collection utilities',
    title: 'JavaScript Collection Utilities — one API for arrays, objects, Map and Set',
    description:
      'Iterate arrays, plain objects, Map, Set and iterables with one consistent API: size, first, last, each, map, filter, find, some, every. map and filter preserve the container type.',
    keywords: 'iterate object javascript, map over object, javascript collection utilities',
  },
];

const escape = (value) => value.replace(/"/g, '\\"');

function build(mod) {
  const source = join(docs, `${mod.slug}.md`);
  if (!existsSync(source)) throw new Error(`missing source doc: ${source}`);
  const body = readFileSync(source, 'utf8');

  // Replace the repo doc's code-formatted H1 with a searchable heading.
  const withoutH1 = body.replace(/^#\s+`?[\w-]+`?\s*\n/, '');
  // Absolute URLs (canonical, og:url) are added at build time by transformPageData, so they
  // always track SITE_URL — including on a deployment where docs/ is absent and this script
  // short-circuits to the committed pages.

  const frontmatter = [
    '---',
    `title: "${escape(mod.title)}"`,
    `description: "${escape(mod.description)}"`,
    'head:',
    `  - - meta`,
    `    - name: keywords`,
    `      content: "${escape(mod.keywords)}"`,
    `  - - meta`,
    `    - property: og:title`,
    `      content: "${escape(mod.title)}"`,
    `  - - meta`,
    `    - property: og:description`,
    `      content: "${escape(mod.description)}"`,
    `  - - meta`,
    `    - property: og:type`,
    `      content: article`,
    '---',
    '',
    `<!-- Generated from docs/${mod.slug}.md by scripts/sync-docs.mjs. Edit that file, not this one. -->`,
    '',
    `# ${mod.h1}`,
    '',
    `_The \`${mod.slug}\` module of [modern-fns](/), a dependency-free JavaScript and TypeScript`,
    `utility library._`,
    '',
  ].join('\n');

  return `${frontmatter}${withoutH1.replace(/^\s*\n/, '')}\n`;
}

// When the site is deployed on its own (Vercel with Root Directory = website), the repository's
// docs/ directory is not part of the deployment. The generated pages are committed precisely so
// the build can proceed without it.
if (!existsSync(docs)) {
  const generated = MODULES.filter((mod) => existsSync(join(site, `${mod.slug}.md`)));
  if (generated.length !== MODULES.length) {
    console.error(
      `docs/ is unavailable and only ${generated.length}/${MODULES.length} generated pages are present.`,
    );
    process.exit(1);
  }
  console.log('docs/ not available — using the committed module pages (expected on Vercel).');
  process.exit(0);
}

const check = process.argv.includes('--check');
let drifted = 0;

for (const mod of MODULES) {
  const target = join(site, `${mod.slug}.md`);
  const next = build(mod);
  const current = existsSync(target) ? readFileSync(target, 'utf8') : null;
  if (current === next) continue;
  if (check) {
    drifted += 1;
    console.error(`out of date: ${mod.slug}.md`);
  } else {
    writeFileSync(target, next);
    console.log(`wrote ${mod.slug}.md`);
  }
}

if (check) {
  if (drifted > 0) {
    console.error(`\n${drifted} page(s) out of date — run "npm run sync" in website/ and commit.`);
    process.exit(1);
  }
  console.log('all module pages up to date');
} else {
  console.log(`synced ${MODULES.length} module pages from docs/`);
}
