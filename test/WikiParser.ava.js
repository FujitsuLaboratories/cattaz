import test from 'ava';
import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

import WikiParser from '../src/WikiParser';
import Apps from '../src/apps';

const markdown = `
# h1

\`\`\`kpt
code1
\`\`\`

\`\`\`unknown
code2
\`\`\`

\`\`\`
code3
\`\`\`
`;

test('parseToHast', t => {
  const hast = WikiParser.parseToHast(markdown);
  t.is(hast.children.length, 1 + 3 + 3);
});

test('convertToCustomHast should not modify original hast', t => {
  const hastOriginal = WikiParser.parseToHast(markdown);
  const hastCloned = cloneDeep(hastOriginal);
  WikiParser.convertToCustomHast(hastOriginal);
  t.deepEqual(hastOriginal, hastCloned);
});

test('convertToCustomHast should convert kpt', t => {
  const hastOriginal = WikiParser.parseToHast(markdown);
  const hastConverted = WikiParser.convertToCustomHast(hastOriginal);
  const appNode = hastConverted.children[2];
  t.is(appNode.tagName, 'app:kpt');
  t.truthy(appNode.position);
  t.deepEqual(appNode.position.start, { line: 4, column: 1, offset: 7 });
  t.deepEqual(appNode.position.end, { line: 6, column: 4, offset: 23 });
  t.is(appNode.children[0].type, 'text');
  t.is(appNode.children[0].value, 'code1\n');
});

test('convertToCustomHast should not convert unknown', t => {
  const hastOriginal = WikiParser.parseToHast(markdown);
  const hastConverted = WikiParser.convertToCustomHast(hastOriginal);
  const codeBlockNode = hastConverted.children[4];
  t.is(codeBlockNode.tagName, 'pre');
});

test('renderCustomHast should handle root node', t => {
  const hastOriginal = WikiParser.parseToHast(markdown);
  const hastConverted = WikiParser.convertToCustomHast(hastOriginal);
  t.is(hastConverted.type, 'root');
  const reactNode = WikiParser.renderCustomHast(hastConverted);
  t.is(reactNode.prototype, React.Node);
  t.is(reactNode.type, 'div');
});

test('renderCustomHast should handle app:kpt node', t => {
  const hastOriginal = WikiParser.parseToHast(markdown);
  const hastConverted = WikiParser.convertToCustomHast(hastOriginal);
  const reactNode = WikiParser.renderCustomHast(hastConverted);
  const appNode = reactNode.props.children[2];
  t.is(appNode.type, Apps.kpt);
  const codeBlockNode = reactNode.props.children[4];
  t.is(codeBlockNode.type, 'pre');
});
