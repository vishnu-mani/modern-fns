/**
 * modern-fns — runnable tour.
 *
 * Run with `npm start`. Every section is something you would otherwise hand-roll.
 */

// 1. Named imports — the recommended style. Tree-shaken by every modern bundler.
import {
  abbreviate,
  changed,
  chunk,
  currency,
  diff,
  diffArray,
  filter,
  groupBy,
  mergeQuery,
  orderBy,
  patch,
  pipe,
  set,
  slugify,
  toNumber,
  truncate,
} from 'modern-fns';

// 2. Subpath imports — maximally explicit, and provably one module.
import parseQuery from 'modern-fns/query/parse';

// 3. Namespaces — handy for the query module, whose names are not flat-exported.
import { query, url } from 'modern-fns';

const line = (title) => console.log(`\n== ${title} ==`);

/* -- Reshaping API data ------------------------------------------------------------- */
const orders = [
  { id: 1, customer: 'Ann', status: 'paid', total: 1299.5 },
  { id: 2, customer: 'Bob', status: 'pending', total: 249 },
  { id: 3, customer: 'Cid', status: 'paid', total: 15400 },
];

line('Group, order and page');
console.log(Object.keys(groupBy(orders, 'status')));
console.log(orderBy(orders, ['status', 'total'], ['asc', 'desc']).map((o) => o.id));
console.log(chunk(orders, 2).length, 'pages');

line('Money and counts, formatted for humans');
console.log(orders.map((o) => currency(o.total, 'INR', 'en-IN')));
console.log(abbreviate(1_500_000), abbreviate(999), abbreviate(2_450));

/* -- Immutable state updates -------------------------------------------------------- */
line('Immutable deep update');
const state = { user: { profile: { city: 'Delhi' }, roles: ['viewer'] } };
const next = set(state, 'user.profile.city', 'Kochi');
console.log(next.user.profile.city, '| original untouched:', state.user.profile.city);
console.log('untouched branches keep their reference:', next.user.roles === state.user.roles);

/* -- Form dirty checking and PATCH bodies ------------------------------------------- */
line('Dirty checking and PATCH generation');
const pristine = { name: 'John', age: 28, address: { country: 'IN' } };
const form = { name: 'Vishnu', age: 29, address: { country: 'IN', city: 'Kochi' } };
console.log('dirty:', changed(pristine, form));
console.table(diff(pristine, form));
console.log('patch round-trips:', JSON.stringify(patch(pristine, diff(pristine, form))));

/* -- List reconciliation ------------------------------------------------------------ */
line('What changed in this list?');
const before = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Bob' },
];
const after = [
  { id: 1, name: 'Vishnu' },
  { id: 3, name: 'Dee' },
];
const listDiff = diffArray(before, after, 'id');
console.log({
  added: listDiff.added.map((u) => u.id),
  removed: listDiff.removed.map((u) => u.id),
  updated: listDiff.updated.map((u) => `${u.key}: ${u.changes.map((c) => c.path).join(', ')}`),
});

/* -- URLs and query strings --------------------------------------------------------- */
line('URL and query handling');
console.log(mergeQuery('/products?page=2&sort=price', { page: 3, q: 'shoes' }));
console.log(parseQuery('?page=2&tags=vue&tags=nuxt'));
console.log(query.toggle('?page=2', 'inStock'));
console.log(url.isSameUrl('/p?a=1&b=2', '/p/?b=2&a=1'));

/* -- Untrusted input ---------------------------------------------------------------- */
line('Coercing whatever the backend sent');
console.log([toNumber('1,299.50'), toNumber('1.299,50'), toNumber('abc', 0)]);
console.log(filter({ name: 'V', email: '', phone: null }, (v) => v !== '' && v !== null));

/* -- Composition -------------------------------------------------------------------- */
line('Composition');
const toHandle = pipe(
  (value) => value.trim(),
  slugify,
  (value) => truncate(value, 20, { omission: '' }),
);
console.log(toHandle('  Hello Vue World - 2026!  '));

console.log('\nDemo complete.');
