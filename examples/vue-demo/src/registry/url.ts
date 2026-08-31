import { url, query } from 'modern-fns';
import { json, text, type DemoModule } from './types';

export const urlModule: DemoModule = {
  module: 'url',
  blurb: 'Absolute, protocol-relative and relative URLs. Relative in, relative out.',
  specs: [
    {
      name: 'parseUrl',
      signature: 'parseUrl(url, options?): ParsedUrl',
      summary: 'Decompose any URL with the query already parsed. Never throws on relative input.',
      inputs: [text('url', 'https://shop.com:8080/p?page=2&tags=a&tags=b#reviews')],
      run: url.parseUrl,
    },
    {
      name: 'buildUrl',
      signature: 'buildUrl(options): string',
      summary: 'Assemble a URL from parts without guessing about slashes or encoding.',
      inputs: [
        json(
          'options',
          '{ "host": "api.shop.com", "path": "/v1/products", "query": { "page": 2, "tags": ["a", "b"] } }',
          4,
        ),
      ],
      run: url.buildUrl,
    },
    {
      name: 'getQuery',
      signature: 'getQuery(url, key, options?): QueryValue | undefined',
      summary: 'Read one parameter from a URL.',
      inputs: [text('url', '/products?page=2&sort=price'), text('key', 'page')],
      run: url.getQuery,
    },
    {
      name: 'getQueryParams',
      signature: 'getQueryParams(url, options?): QueryObject',
      summary: 'All parameters, parsed: numbers, booleans, arrays and nested keys.',
      inputs: [text('url', '/products?page=2&tags=a&tags=b&filter[status]=active')],
      run: url.getQueryParams,
    },
    {
      name: 'setQuery',
      signature: 'setQuery(url, key, value, options?): string',
      summary: 'Set one parameter, keeping path, order and hash. undefined removes it.',
      inputs: [text('url', '/products?page=2'), text('key', 'sort'), json('value', '"price"')],
      run: url.setQuery,
    },
    {
      name: 'setQueryParams',
      signature: 'setQueryParams(url, params, options?): string',
      summary: 'Replace the entire query. {} clears it.',
      inputs: [text('url', '/products?page=2&sort=price'), json('params', '{ "page": 1 }')],
      run: url.setQueryParams,
    },
    {
      name: 'removeQuery',
      signature: 'removeQuery(url, key, options?): string',
      summary: 'Remove one or more parameters; the ? disappears with the last one.',
      inputs: [text('url', '/p?a=1&b=2&c=3'), json('key', '["a", "c"]')],
      run: url.removeQuery,
    },
    {
      name: 'mergeQuery',
      signature: 'mergeQuery(url, params, options?): string',
      summary: 'Apply a patch to the query; undefined values delete their key.',
      inputs: [text('url', '/p?page=2&sort=price'), json('params', '{ "page": 3, "q": "shoes" }')],
      run: url.mergeQuery,
    },
    {
      name: 'hasQuery',
      signature: 'hasQuery(url, key): boolean',
      summary: 'Presence check, true even for an empty value.',
      inputs: [text('url', '/p?q='), text('key', 'q')],
      run: url.hasQuery,
    },
    {
      name: 'setHash',
      signature: 'setHash(url, hash): string',
      summary: 'Set the fragment; the # is optional and never doubled.',
      inputs: [text('url', '/docs?page=2'), text('hash', 'install')],
      run: url.setHash,
    },
    {
      name: 'removeHash',
      signature: 'removeHash(url): string',
      summary: 'Strip the fragment.',
      inputs: [text('url', '/docs?page=2#install')],
      run: url.removeHash,
    },
    {
      name: 'isSameUrl',
      signature: 'isSameUrl(a, b, options?): boolean',
      summary: 'Semantic comparison: query order and trailing slash ignored by default.',
      inputs: [
        text('a', '/p?a=1&b=2'),
        text('b', '/p/?b=2&a=1'),
        json('options', '{ "ignoreHash": false }'),
      ],
      run: url.isSameUrl,
    },
    {
      name: 'joinUrl',
      signature: 'joinUrl(...parts): string',
      summary: 'Exactly one slash between parts; query and hash move to the end.',
      inputs: [text('a', 'https://api.com/'), text('b', '/v1/'), text('c', 'users?page=1')],
      run: url.joinUrl,
    },
  ],
};

export const queryModule: DemoModule = {
  module: 'query',
  blurb:
    'Query-string engine. Namespace or subpath imports only — these names would collide with the object module at the root.',
  specs: [
    {
      name: 'parse',
      signature: 'parse(queryString, options?): QueryObject',
      summary: 'Repeated keys become arrays, a[b] becomes nested, ids like "007" stay strings.',
      inputs: [
        text('queryString', '?page=2&tags=vue&tags=nuxt&filter[status]=active'),
        json('options', '{ "parseNumbers": true }'),
      ],
      run: query.parse,
    },
    {
      name: 'stringify',
      signature: 'stringify(object, options?): string',
      summary: 'undefined and empty containers dropped; Date becomes ISO.',
      inputs: [
        json('object', '{ "page": 2, "tags": ["vue", "nuxt"] }'),
        json('options', '{ "arrayFormat": "repeat" }'),
      ],
      run: query.stringify,
    },
    {
      name: 'get',
      signature: 'get(queryString, key, options?): QueryValue | undefined',
      summary: 'Read one key. Missing is undefined; ?q= is the empty string.',
      inputs: [text('queryString', '?page=2&q='), text('key', 'q')],
      run: query.get,
    },
    {
      name: 'set',
      signature: 'set(queryString, key, value, options?): string',
      summary: 'Existing keys keep position; the ? prefix is preserved.',
      inputs: [text('queryString', '?page=2'), text('key', 'sort'), json('value', '"price"')],
      run: query.set,
    },
    {
      name: 'remove',
      signature: 'remove(queryString, key, options?): string',
      summary: 'Remove one or more keys.',
      inputs: [text('queryString', 'a=1&b=2&c=3'), json('key', '["a", "c"]')],
      run: query.remove,
    },
    {
      name: 'merge',
      signature: 'merge(queryString, values, options?): string',
      summary: 'Merge a patch; undefined values delete.',
      inputs: [
        text('queryString', 'page=2&sort=price'),
        json('values', '{ "page": 3, "q": "shoes" }'),
      ],
      run: query.merge,
    },
    {
      name: 'has',
      signature: 'has(queryString, key): boolean',
      summary: 'Presence check.',
      inputs: [text('queryString', '?q=&page=2'), text('key', 'q')],
      run: query.has,
    },
    {
      name: 'toggle',
      signature: 'toggle(queryString, key, options?): string',
      summary: 'Filter-chip behaviour: presence decides, not truthiness.',
      inputs: [
        text('queryString', '?page=2'),
        text('key', 'inStock'),
        json('options', '{ "value": true }'),
      ],
      run: query.toggle,
    },
    {
      name: 'parseNumber',
      signature: 'parseNumber(queryString, key, defaultValue?): number',
      summary: 'Reads formatted numbers through toNumber, with a fallback.',
      inputs: [text('queryString', '?page=abc'), text('key', 'page'), json('defaultValue', '1')],
      run: query.parseNumber,
    },
    {
      name: 'parseBoolean',
      signature: 'parseBoolean(queryString, key, defaultValue?): boolean',
      summary: 'Understands true/1/yes/on; a bare ?debug counts as true.',
      inputs: [text('queryString', '?debug'), text('key', 'debug'), json('defaultValue', 'false')],
      run: query.parseBoolean,
    },
    {
      name: 'parseArray',
      signature: 'parseArray(queryString, key, options?): QueryValue[]',
      summary: 'Always an array, whatever form arrived — repeat, bracket, comma or single.',
      inputs: [
        text('queryString', '?tags=a,b'),
        text('key', 'tags'),
        json('options', '{ "separator": "," }'),
      ],
      run: query.parseArray,
    },
  ],
};
