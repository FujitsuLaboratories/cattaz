import test from 'ava';
import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

import WikiParser from '../src/WikiParser';
import AppContainer from '../src/AppContainer';
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

/** @test {WikiParser.parseToHast} */
test('parseToHast', t => {
  const hast = WikiParser.parseToHast(markdown);
  t.is(hast.children.length, 1 + 3 + 3);
});

/** @test {WikiParser.convertToCustomHast} */
test('convertToCustomHast should not modify original hast', t => {
  const hastOriginal = WikiParser.parseToHast(markdown);
  const hastCloned = cloneDeep(hastOriginal);
  WikiParser.convertToCustomHast(hastOriginal);
  t.deepEqual(hastOriginal, hastCloned);
});

/** @test {WikiParser.convertToCustomHast} */
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

/** @test {WikiParser.convertToCustomHast} */
test('convertToCustomHast should not convert unknown', t => {
  const hastOriginal = WikiParser.parseToHast(markdown);
  const hastConverted = WikiParser.convertToCustomHast(hastOriginal);
  const codeBlockNode = hastConverted.children[4];
  t.is(codeBlockNode.tagName, 'pre');
});

/** @test {WikiParser.renderCustomHast} */
test('renderCustomHast should handle root node', t => {
  const hastOriginal = WikiParser.parseToHast(markdown);
  const hastConverted = WikiParser.convertToCustomHast(hastOriginal);
  t.is(hastConverted.type, 'root');
  const reactNode = WikiParser.renderCustomHast(hastConverted);
  t.is(reactNode.prototype, React.Node);
  t.is(reactNode.type, 'div');
});

/** @test {WikiParser.renderCustomHast} */
test('renderCustomHast should handle app:kpt node', t => {
  const hastOriginal = WikiParser.parseToHast(markdown);
  const hastConverted = WikiParser.convertToCustomHast(hastOriginal);
  const reactNode = WikiParser.renderCustomHast(hastConverted);
  const containerNode = reactNode.props.children[2];
  t.is(containerNode.type, AppContainer);
  const appNode = containerNode.props.children;
  t.is(appNode.type, Apps.kpt);
  const codeBlockNode = reactNode.props.children[4];
  t.is(codeBlockNode.type, 'pre');
});

/** @test {WikiParser.removeLastNewLine} */
test('removeLastNewLine', t => {
  t.is('', WikiParser.removeLastNewLine(''));
  t.is('aaa', WikiParser.removeLastNewLine('aaa'));
  t.is('aaa', WikiParser.removeLastNewLine('aaa\n'));
  t.is('aaa\n', WikiParser.removeLastNewLine('aaa\n\n'));
  t.is('aaa\nbbb', WikiParser.removeLastNewLine('aaa\nbbb'));
  t.is('aaa\nbbb', WikiParser.removeLastNewLine('aaa\nbbb\n'));
});

/** @test {WikiParser.indentAppCode} */
test('indentAppCode', t => {
  const posWithoutIndent = WikiParser.convertToCustomHast(WikiParser.parseToHast('~~~kpt\n~~~')).children[0].position;
  const posWithIndent = WikiParser.convertToCustomHast(WikiParser.parseToHast('1. a\n\n   ~~~kpt\n~~~')).children[0].children[1].children[3].position;
  t.is('{\n}', WikiParser.indentAppCode(posWithoutIndent, '{\n}'));
  t.is('   {\n   }', WikiParser.indentAppCode(posWithIndent, '{\n}'));
});

/** @test {WikiParser.replaceAppCode} */
test('replaceAppCode should not modify text outside', t => {
  const md = `
# h1

\`\`\`kpt
\`\`\`

para
`;
  const pos = WikiParser.convertToCustomHast(WikiParser.parseToHast(md)).children[2].position;
  const replaced = WikiParser.replaceAppCode(md, pos, 'kpt', 'keeps: []');
  t.is(replaced, `
# h1

\`\`\`kpt
keeps: []
\`\`\`

para
`);
});

/** @test {WikiParser.replaceAppCode} */
test('including [backticks or tildes] in fenced code block increases surrounding [backticks or tildes]', t => {
  const mdB = `
\`\`\`hello
\`\`\`
`;
  const mdBIndent = `
- test
  - test
    \`\`\`hello
    \`\`\` 
`;
  const mdT = `
~~~hello
~~~
`;
  const mdTIndent = `
- test
  - test
    ~~~hello
    ~~~ 
`;
  const posB = WikiParser.convertToCustomHast(WikiParser.parseToHast(mdB)).children[0].position;
  const replacedB3 = WikiParser.replaceAppCode(mdB, posB, 'hello', '```');
  const replacedB7 = WikiParser.replaceAppCode(mdB, posB, 'hello', '```````');
  const posIndentB = WikiParser.convertToCustomHast(WikiParser.parseToHast(mdBIndent)).children[0].children[1].children[3].children[1].children[3].position;
  const replacedIndentB = WikiParser.replaceAppCode(mdBIndent, posIndentB, 'hello', '```');
  const posT = WikiParser.convertToCustomHast(WikiParser.parseToHast(mdB)).children[0].position;
  const replacedT3 = WikiParser.replaceAppCode(mdT, posT, 'hello', '~~~');
  const replacedT7 = WikiParser.replaceAppCode(mdT, posT, 'hello', '~~~~~~~');
  const posIndentT = WikiParser.convertToCustomHast(WikiParser.parseToHast(mdTIndent)).children[0].children[1].children[3].children[1].children[3].position;
  const replacedIndentT = WikiParser.replaceAppCode(mdTIndent, posIndentT, 'hello', '~~~');
  t.is(replacedB3, `
\`\`\`\`hello
\`\`\`
\`\`\`\`
`);
  t.is(replacedB7, `
\`\`\`\`\`\`\`\`hello
\`\`\`\`\`\`\`
\`\`\`\`\`\`\`\`
`);
  t.is(replacedIndentB, `
- test
  - test
    \`\`\`\`hello
    \`\`\`
    \`\`\`\`
`);
  t.is(replacedT3, `
~~~~hello
~~~
~~~~
`);
  t.is(replacedT7, `
~~~~~~~~hello
~~~~~~~
~~~~~~~~
`);
  t.is(replacedIndentT, `
- test
  - test
    ~~~~hello
    ~~~
    ~~~~
`);
});
