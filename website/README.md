# modern-fns website

The documentation site for [modern-fns](https://github.com/vishnu-mani/modern-fns), built with
[VitePress](https://vitepress.dev). Static HTML, one indexable page per module.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in .vitepress/dist
npm run preview
```

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page — what the library is, install, module overview |
| `/docs` | Installation, import styles, TypeScript, immutability, tree shaking |
| `/array` `/object` `/diff` `/string` `/number` `/url` `/query` `/value` `/functional` `/collection` | One page per module, generated from the repo docs |
| `/lodash-alternative` | Migration mapping from Lodash, method by method |
| `/compare` | modern-fns vs Lodash, with the cases where Lodash still wins |

## Where the content lives

The ten module pages are **generated** from `../docs/*.md` by `scripts/sync-docs.mjs`, which adds
per-page SEO frontmatter (title, description, keywords, canonical, Open Graph) and rewrites the
heading into a searchable one. The repo docs are the single source of truth.

```bash
npm run sync         # regenerate the module pages
npm run check:sync   # fail if they have drifted (runs in CI)
```

Edit `../docs/array.md`, not `./array.md` — the latter is overwritten. The generated files are
committed so the site builds without reaching outside its own directory.

`/`, `/docs`, `/lodash-alternative` and `/compare` are hand-written and live here.

## SEO

- A unique `<title>`, meta description and canonical URL on every page.
- `sitemap.xml` generated at build time, `robots.txt` in `public/`.
- Open Graph and Twitter card tags, with `public/og.svg` as the share image.
- `SoftwareApplication` JSON-LD on every page.
- `cleanUrls`, so pages are `/array` rather than `/array.html`.

## Deploying to Vercel

1. **New Project** → import the `modern-fns` repository.
2. Set **Root Directory** to `website`.
3. Framework preset: **VitePress** (or Other — `vercel.json` already sets the build command and
   output directory).
4. `SITE_URL` is optional. It defaults to `https://modern-fns.vercel.app` (set in
   `site-url.mjs`), which is the canonical origin for this site. Set the variable only if the
   deployment lands on a different hostname.
5. Deploy.

`cleanUrls` in `vercel.json` is what makes `/array` serve `array.html`. Without it every internal
link 404s on Vercel.

### Changing the origin

The origin lives in one place: `site-url.mjs`. Canonical tags, Open Graph URLs, the sitemap,
`robots.txt` and the JSON-LD all read it, and `robots.txt` is generated at build time so it can
never disagree.

To move the site — a custom domain, or a different Vercel subdomain — edit `DEFAULT_SITE_URL`
there, run `npm run sync`, and commit. For a one-off build against another origin, set the
`SITE_URL` environment variable instead.

Submit `https://modern-fns.vercel.app/sitemap.xml` in Google Search Console once the site is live.
