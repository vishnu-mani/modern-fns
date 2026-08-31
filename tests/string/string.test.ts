import { describe, expect, it } from 'vitest';
import {
  camelCase,
  capitalize,
  capitalizeWords,
  constantCase,
  escapeHtml,
  extractEmails,
  extractNumbers,
  initials,
  isEmail,
  isUrl,
  kebabCase,
  mask,
  normalizeWhitespace,
  pascalCase,
  removeSpaces,
  slugify,
  snakeCase,
  stripHtml,
  stripWhitespace,
  truncate,
  truncateWords,
  unescapeHtml,
} from '../../src/index.js';

describe('capitalize / capitalizeWords', () => {
  it('capitalises the first character', () => {
    expect(capitalize('hello world')).toBe('Hello world');
    expect(capitalize('a')).toBe('A');
    expect(capitalize('Élan')).toBe('Élan');
  });
  it('is safe on empty, non-string and astral input', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize(null as never)).toBe('');
    expect(capitalize('😀 hi')).toBe('😀 hi');
  });
  it('capitalises every word, preserving spacing', () => {
    expect(capitalizeWords('hello vue world')).toBe('Hello Vue World');
    expect(capitalizeWords('  spaced   out  ')).toBe('  Spaced   Out  ');
    expect(capitalizeWords('')).toBe('');
    expect(capitalizeWords(null as never)).toBe('');
  });
});

describe('case converters', () => {
  const cases: Array<[string, string, string, string, string, string]> = [
    // input, camel, pascal, kebab, snake, constant
    [
      'user_first_name',
      'userFirstName',
      'UserFirstName',
      'user-first-name',
      'user_first_name',
      'USER_FIRST_NAME',
    ],
    [
      'XMLHttpRequest',
      'xmlHttpRequest',
      'XmlHttpRequest',
      'xml-http-request',
      'xml_http_request',
      'XML_HTTP_REQUEST',
    ],
    ['my-component', 'myComponent', 'MyComponent', 'my-component', 'my_component', 'MY_COMPONENT'],
    [
      'hello world 42',
      'helloWorld42',
      'HelloWorld42',
      'hello-world-42',
      'hello_world_42',
      'HELLO_WORLD_42',
    ],
    ['  padded  ', 'padded', 'Padded', 'padded', 'padded', 'PADDED'],
  ];
  it.each(cases)('converts %s', (input, camel, pascal, kebab, snake, constant) => {
    expect(camelCase(input)).toBe(camel);
    expect(pascalCase(input)).toBe(pascal);
    expect(kebabCase(input)).toBe(kebab);
    expect(snakeCase(input)).toBe(snake);
    expect(constantCase(input)).toBe(constant);
  });
  it('handles empty, non-string and symbol-only input', () => {
    for (const fn of [camelCase, pascalCase, kebabCase, snakeCase, constantCase]) {
      expect(fn('')).toBe('');
      expect(fn(null as never)).toBe('');
      expect(fn('---')).toBe('');
    }
  });
  it('handles unicode words', () => {
    expect(camelCase('mañana bueno')).toBe('mañanaBueno');
    expect(kebabCase('Ελληνικά Text')).toBe('ελληνικά-text');
  });
  it('is idempotent', () => {
    expect(camelCase(camelCase('user_first_name'))).toBe('userFirstName');
    expect(kebabCase(kebabCase('XMLHttpRequest'))).toBe('xml-http-request');
  });
});

describe('slugify', () => {
  it('slugifies text', () => {
    expect(slugify('Hello Vue World!')).toBe('hello-vue-world');
    expect(slugify('Café & Bar — 2026')).toBe('cafe-and-bar-2026');
    expect(slugify('  multiple   spaces  ')).toBe('multiple-spaces');
  });
  it('folds diacritics and special letters', () => {
    expect(slugify('Straße')).toBe('strasse');
    expect(slugify('Æon Œuvre')).toBe('aeon-oeuvre');
    expect(slugify('Łódź')).toBe('lodz');
  });
  it('supports options', () => {
    expect(slugify('Hello World', { separator: '_' })).toBe('hello_world');
    expect(slugify('Hello World', { lower: false })).toBe('Hello-World');
    expect(slugify('one two three four', { maxLength: 11 })).toBe('one-two');
    expect(slugify('averylongsingleword', { maxLength: 5 })).toBe('avery');
  });
  it('handles empty, non-string and non-Latin input', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null as never)).toBe('');
    expect(slugify('你好')).toBe('');
    expect(slugify('🎉🎉')).toBe('');
  });
});

describe('truncate / truncateWords', () => {
  it('truncates including the omission', () => {
    expect(truncate('The quick brown fox', 10)).toBe('The quick…');
    expect(truncate('The quick brown fox', 10)).toHaveLength(10);
  });
  it('leaves short strings alone', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
    expect(truncate('exact', 5)).toBe('exact');
  });
  it('cuts at a separator', () => {
    expect(truncate('The quick brown fox', 10, { separator: ' ' })).toBe('The…');
    expect(truncate('a,b,c,d,e,f', 8, { separator: /,/ })).toBe('a,b,c…');
  });
  it('supports a custom omission', () => {
    expect(truncate('abcdefgh', 6, { omission: '...' })).toBe('abc...');
    expect(truncate('abcdefgh', 2, { omission: '...' })).toBe('..');
  });
  it('never splits an emoji', () => {
    expect([...truncate('😀😀😀😀', 3)]).toEqual(['😀', '😀', '…']);
  });
  it('handles invalid input', () => {
    expect(truncate('abc', 0)).toBe('');
    expect(truncate('abc', -1)).toBe('');
    expect(truncate(null as never, 5)).toBe('');
  });
  it('truncates by words', () => {
    expect(truncateWords('The quick brown fox jumps', 3)).toBe('The quick brown…');
    expect(truncateWords('One two', 5)).toBe('One two');
    expect(truncateWords('  padded words here ', 2)).toBe('padded words…');
    expect(truncateWords('a b c', 2, { omission: '...' })).toBe('a b...');
    expect(truncateWords('', 2)).toBe('');
    expect(truncateWords('a', 0)).toBe('');
    expect(truncateWords(null as never, 2)).toBe('');
  });
});

describe('initials', () => {
  it('builds initials', () => {
    expect(initials('Vishnu M')).toBe('VM');
    expect(initials('john ronald reuel tolkien')).toBe('JT');
    expect(initials('a b c d', { max: 3 })).toBe('ABD');
    expect(initials('Vishnu')).toBe('V');
  });
  it('supports options', () => {
    expect(initials('Vishnu M', { max: 1 })).toBe('V');
    expect(initials('Vishnu M', { uppercase: false })).toBe('VM');
    expect(initials('vishnu m', { uppercase: false })).toBe('vm');
    expect(initials('a b', { max: 0 })).toBe('');
  });
  it('handles separators, punctuation and unicode', () => {
    expect(initials('mary-jane watson')).toBe('MW');
    expect(initials('jean_luc.picard')).toBe('JP');
    expect(initials('  ')).toBe('');
    expect(initials('!!! ???')).toBe('');
    expect(initials('Ángel Ñuñez')).toBe('ÁÑ');
    expect(initials(null as never)).toBe('');
  });
});

describe('mask', () => {
  it('masks all but the visible tail', () => {
    expect(mask('9876543210', { visible: 4 })).toBe('******3210');
  });
  it('supports fixed mask length and leading visibility', () => {
    expect(mask('4111111111111111', { visible: 4, maskLength: 4 })).toBe('****1111');
    expect(mask('secret', { visible: 2, from: 'start' })).toBe('se****');
    expect(mask('secret', { visible: 2, maskChar: '•' })).toBe('••••et');
  });
  it('masks everything when the value is too short', () => {
    expect(mask('12', { visible: 4 })).toBe('**');
    expect(mask('1234', { visible: 4 })).toBe('****');
  });
  it('defaults to four visible characters', () => {
    expect(mask('9876543210')).toBe('******3210');
  });
  it('handles empty and non-string input', () => {
    expect(mask('')).toBe('');
    expect(mask(null as never)).toBe('');
  });
});

describe('html helpers', () => {
  it('strips tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
    expect(stripHtml('<script>alert(1)</script>Safe')).toBe('Safe');
    expect(stripHtml('<style>a{}</style>x')).toBe('x');
    expect(stripHtml('a<!-- note -->b')).toBe('ab');
    expect(stripHtml('no tags')).toBe('no tags');
    expect(stripHtml(null as never)).toBe('');
    expect(stripHtml('a < b and c > d')).toBe('a < b and c > d');
  });
  it('escapes and unescapes', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
    expect(escapeHtml("it's")).toBe('it&#39;s');
    expect(unescapeHtml('&lt;b&gt;hi&lt;/b&gt;')).toBe('<b>hi</b>');
    expect(unescapeHtml('caf&#233;')).toBe('café');
    expect(unescapeHtml('&#x26;')).toBe('&');
    expect(unescapeHtml('&nbsp;')).toBe('\u00a0');
    expect(unescapeHtml('&unknown;')).toBe('&unknown;');
    expect(escapeHtml(null as never)).toBe('');
    expect(unescapeHtml(null as never)).toBe('');
  });
  it('round-trips', () => {
    const raw = `<a href="x">Tom & Jerry's</a>`;
    expect(unescapeHtml(escapeHtml(raw))).toBe(raw);
  });
});

describe('whitespace helpers', () => {
  it('strips and normalises', () => {
    expect(stripWhitespace(' 4111 1111 1111 1111 ')).toBe('4111111111111111');
    expect(removeSpaces('a b\tc\nd')).toBe('ab\tc\nd');
    expect(normalizeWhitespace('  Hello \n\t world  ')).toBe('Hello world');
    expect(normalizeWhitespace('a b')).toBe('a b');
  });
  it('handles non-string input', () => {
    expect(stripWhitespace(null as never)).toBe('');
    expect(removeSpaces(null as never)).toBe('');
    expect(normalizeWhitespace(null as never)).toBe('');
  });
});

describe('validation and extraction', () => {
  it('validates emails', () => {
    expect(isEmail('vishnu+tag@example.co.in')).toBe(true);
    expect(isEmail(' user@example.com ')).toBe(true);
    expect(isEmail('user@localhost')).toBe(false);
    expect(isEmail('user@@example.com')).toBe(false);
    expect(isEmail('user example@x.com')).toBe(false);
    expect(isEmail('user..name@x.com')).toBe(false);
    expect(isEmail('')).toBe(false);
    expect(isEmail(null)).toBe(false);
    expect(isEmail(`${'a'.repeat(65)}@x.com`)).toBe(false);
    expect(isEmail(`${'a'.repeat(250)}@example.com`)).toBe(false);
  });
  it('validates urls', () => {
    expect(isUrl('https://example.com/path?q=1')).toBe(true);
    expect(isUrl('http://localhost:3000')).toBe(true);
    expect(isUrl('http://localhost', { requireTld: true })).toBe(false);
    expect(isUrl('javascript:alert(1)')).toBe(false);
    expect(isUrl('ftp://example.com', { protocols: ['ftp'] })).toBe(true);
    expect(isUrl('example.com')).toBe(false);
    expect(isUrl('example.com', { allowRelative: true })).toBe(true);
    expect(isUrl('//example.com', { allowRelative: true })).toBe(true);
    expect(isUrl('not a url')).toBe(false);
    expect(isUrl('')).toBe(false);
    expect(isUrl(null)).toBe(false);
    expect(isUrl('http://')).toBe(false);
  });
  it('extracts numbers', () => {
    expect(extractNumbers('Order #123 total ₹1,299.50, -5 items')).toEqual([123, 1299.5, -5]);
    expect(extractNumbers('no digits here')).toEqual([]);
    expect(extractNumbers(null as never)).toEqual([]);
  });
  it('extracts emails, de-duplicated and lower-cased', () => {
    expect(extractEmails('Mail a@x.com or B@X.COM, also a@x.com')).toEqual(['a@x.com', 'b@x.com']);
    expect(extractEmails('contact: person@example.co.uk.')).toEqual(['person@example.co.uk']);
    expect(extractEmails('none here')).toEqual([]);
    expect(extractEmails(null as never)).toEqual([]);
  });
});
