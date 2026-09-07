# modern-fns

## 1.0.1

### Patch Changes

- Documentation and package metadata only — no runtime changes. The compiled output of this release
  is byte-identical to 1.0.0.
  
  - **npm metadata** — the package description now matches the documentation site, and the keyword
    list gains `javascript`, `typescript`, `utility-library`, `javascript-utilities`,
    `typescript-utilities`, `functional-programming`, `tree-shaking` and `frontend` for discovery.
  - **Funding** — added a `funding` field, so the package page and `npm fund` link to
    https://buymeacoffee.com/vishnumani.
  - **README** — new "Why modern-fns?" section with an honest modern-fns vs Lodash comparison, and a
    link to the documentation site at https://modern-fns.vercel.app.
  - **Corrected the function count** from 146 to 145 across the README and docs. The published count
    was stale: `object.getDefault` and `number.shiftRound` were internal helpers that leaked into
    their module barrels and were removed before 1.0.0 shipped.
  - **Runtime support** — the README no longer claims tested Deno and Bun support. Those runtimes are
    expected to work, since the package imports no Node built-ins, but they are not in the test
    matrix.
