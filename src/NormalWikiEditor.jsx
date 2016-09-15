import React from 'react';
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
    const text = this.editor.value;
    this.setState({ text });
  }
  render() {
    const style = {
      width: '50%',
      margin: '0.5em',
    };
    return (<div style={{ display: 'flex' }}>
      <textarea ref={(c) => { this.editor = c; }} onChange={this.handleEdit} style={style} rows="10" defaultValue={defaultValue} />
      <Markdown source={this.state.text} style={style} />
    </div>);
  }
}
