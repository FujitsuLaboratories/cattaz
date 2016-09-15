import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import Markdown from 'react-markdown';

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
  handleEdit() {
    const text = this.monaco.editor.getModel().getValue();
    this.setState({ text });
  }
  render() {
    const style = {
      width: '50%',
      margin: '0.5em',
    };
    return (<div style={{ display: 'flex' }}>
      <MonacoEditor ref={(c) => { this.monaco = c; }} onChange={this.handleEdit} language="markdown" value={defaultValue} style={style} />
      <Markdown source={this.state.text} style={style} />
    </div>);
  }
}
