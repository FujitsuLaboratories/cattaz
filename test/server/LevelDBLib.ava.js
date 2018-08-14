import test from 'ava';
import sanitize from 'sanitize-filename';

import LevelDBLib from '../../src/server/LevelDBLib';

const unsafePaths = [
  // path traversal
  '/',
  '/etc/passwd',
  '.',
  './..',
  './dir/../..',
  '..',
  '../',
  // invalid filename
  '',
  ' ',
  'last space ',
  'last-dot.',
  'con',
  'con.txt',
  'nul',
  // illegal chars
  'question?mark?char',
  'angle<>char',
  'asterisk*char',
  'null\0char',
  'newline\nchar',
  'tab\tchar',
  // path separator
  'dir/file',
  'dir\\file',
];

/** @test {LevelDBLib.escapeNamespace} */
test('escapeNamespace should escape unsafe path', t => {
  unsafePaths.forEach(p => {
    const escaped = LevelDBLib.escapeNamespace(p);
    t.not(p, escaped, 'should escape unsafe filename');
    const sanitizedEscaped = sanitize(escaped);
    t.is(escaped, sanitizedEscaped, 'escaped namespace must be a safe filename');
  });
});

/** @test {LevelDBLib.unescapeNamespace} */
test('unescapeNamespace should unescape path', t => {
  unsafePaths.forEach(p => {
    const escaped = LevelDBLib.escapeNamespace(p);
    const unescaped = LevelDBLib.unescapeNamespace(escaped);
    t.is(p, unescaped);
  });
});

/** @test {LevelDBLib.escapeNamespace} */
test('escapeNamespace should be injective', t => {
  const inputs = new Set([
    '',
    '%',
    '%%',
    '%%%',
    '%_%',
    '%%_%',
    '%%__%',
    '%1%',
    '%01%',
  ]);
  const outputs = new Set();
  inputs.forEach(p => {
    const escaped = LevelDBLib.escapeNamespace(p);
    t.false(outputs.has(escaped), `not injective: ${p} -> ${escaped}`);
    outputs.add(escaped);
  });
});

/** @test {LevelDBLib.escapeNamespace} */
test('escapeNamespace should handle non-ascii chars', t => {
  const inputs = new Set([
    'ひらがな',
    'カタカナ',
    '漢字',
    '汉语',
    '한글',
    'عربی زبان',
  ]);
  inputs.forEach(p => {
    const escaped = LevelDBLib.escapeNamespace(p);
    t.not(p, escaped, 'should escape');
    const sanitizedEscaped = sanitize(escaped);
    t.is(escaped, sanitizedEscaped, 'escaped namespace must be a safe filename');
    const unescaped = LevelDBLib.unescapeNamespace(escaped);
    t.is(p, unescaped, 'should restore to non-ascii');
  });
});
