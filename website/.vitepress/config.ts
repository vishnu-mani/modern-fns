import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vitepress';
import { siteUrl as SITE_URL } from '../site-url.mjs';
const DESCRIPTION =
  'Modern JavaScript & TypeScript utility library — 145 modular, immutable, tree-shakeable, dependency-free utilities. A lightweight alternative to Lodash.';

const MODULES = [
  ['array', 'Array'],
  ['object', 'Object'],
  ['diff', 'Diff'],
  ['string', 'String'],
  ['number', 'Number'],
  ['url', 'URL'],
  ['query', 'Query string'],
  ['value', 'Value'],
  ['functional', 'Functional'],
  ['collection', 'Collection'],
] as const;

export default defineConfig({
  title: 'modern-fns',
  description: DESCRIPTION,
  lang: 'en-US',

  // The site README documents the site itself; it is not a page.
  srcExclude: ['README.md'],

  // /array rather than /array.html — shorter, and what people link to.
  cleanUrls: true,
  lastUpdated: true,
  metaChunk: true,

  // Generates sitemap.xml with an entry per page.
  sitemap: { hostname: SITE_URL },

  // robots.txt is generated rather than checked in, so its Sitemap line always matches SITE_URL.
  buildEnd(siteConfig) {
    writeFileSync(
      join(siteConfig.outDir, 'robots.txt'),
      `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    );
  },

  head: [
    ['meta', { name: 'theme-color', content: '#2f6f4f' }],
    ['meta', { property: 'og:site_name', content: 'modern-fns' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: `${SITE_URL}/og.svg` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'modern-fns',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        description: DESCRIPTION,
        url: SITE_URL,
        license: 'https://opensource.org/licenses/MIT',
        programmingLanguage: ['JavaScript', 'TypeScript'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        codeRepository: 'https://github.com/vishnu-mani/modern-fns',
      }),
    ],
  ],

  // Per-page canonical, which VitePress does not add on its own.
  transformPageData(pageData) {
    const path = pageData.relativePath.replace(/(index)?\.md$/, '').replace(/\/$/, '');
    const canonical = path === '' ? SITE_URL : `${SITE_URL}/${path}`;
    pageData.frontmatter.head ??= [];
    const head = pageData.frontmatter.head as unknown[][];
    const has = (tag: string, key: string, value: string) =>
      head.some(
        (entry) =>
          Array.isArray(entry) &&
          entry[0] === tag &&
          (entry[1] as Record<string, string>)?.[key] === value,
      );
    if (!has('link', 'rel', 'canonical')) head.push(['link', { rel: 'canonical', href: canonical }]);
    if (!has('meta', 'property', 'og:url')) head.push(['meta', { property: 'og:url', content: canonical }]);
  },

  themeConfig: {
    siteTitle: 'modern-fns',
    search: { provider: 'local' },

    nav: [
      { text: 'Docs', link: '/docs' },
      {
        text: 'Modules',
        items: MODULES.map(([slug, label]) => ({ text: label, link: `/${slug}` })),
      },
      { text: 'vs Lodash', link: '/compare' },
      { text: 'npm', link: 'https://www.npmjs.com/package/modern-fns' },
    ],

    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Introduction', link: '/docs' },
          { text: 'Installation & imports', link: '/docs#installation' },
        ],
      },
      {
        text: 'Modules',
        items: MODULES.map(([slug, label]) => ({ text: label, link: `/${slug}` })),
      },
      {
        text: 'Comparisons',
        items: [
          { text: 'Lodash alternative', link: '/lodash-alternative' },
          { text: 'modern-fns vs Lodash', link: '/compare' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/vishnu-mani/modern-fns' }],

    editLink: {
      pattern: 'https://github.com/vishnu-mani/modern-fns/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message:
        'Released under the MIT License. <a href="https://buymeacoffee.com/vishnumani">Buy me a coffee</a>.',
      copyright: '© Vishnu M',
    },
  },
});
