import React from 'react';
import MonacoEditor from 'react-monaco-editor/lib';
import Markdown from 'react-markdown';

import monacoRequireConfig from './monacoRequireConfig.js';

const defaultValue = `# Markdown editor with preview

You can write markdown with preview

\`\`\`js
console.log('hello world');
\`\`\`
`;

export default class NormalWikiEditor extends React.Component {
  constructor() {
    super();
    this.state = { text: defaultValue };
    this.handleEdit = this.handleEdit.bind(this);
  }
  handleEdit(text) {
    this.setState({ text });
  }
  render() {
    return (<div style={{ display: 'flex' }}>
      <MonacoEditor onChange={this.handleEdit} language="markdown" defaultValue={defaultValue} width="50%" height={500} requireConfig={monacoRequireConfig} />
      <Markdown source={this.state.text} />
    </div>);
  }
}
