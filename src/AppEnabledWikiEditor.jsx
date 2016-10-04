import React from 'react';
import MonacoEditor from 'react-monaco-editor/lib';

import Apps from './apps';
import WikiParser from './WikiParser';
import monacoRequireConfig from './monacoRequireConfig';

const defaultValue = `\`\`\`kpt
\`\`\`
`;

export default class AppEnabledWikiEditor extends React.Component {
  constructor() {
    super();
    this.state = { text: defaultValue, hast: WikiParser.convertToCustomHast(WikiParser.parseToHast(defaultValue)) };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleAppEdit = this.handleAppEdit.bind(this);
  }
  getAppText() {
    return this.state.text.replace('```kpt', '').replace('```', '');
  }
  handleEdit(text) {
    const hastOriginal = WikiParser.parseToHast(text);
    const hast = WikiParser.convertToCustomHast(hastOriginal);
    this.setState({ text, hast });
  }
  handleAppEdit(text) {
    this.setState({ text: `\`\`\`kpt
${text}
\`\`\`
` });
  }
  render() {
    return (<div>
      <div>
        In the real use case, wiki text should be written in Markdown syntax and application data is stored in fenced code block.
        To make things easier, this component does not parse markdown.
        You should write only one fenced code block in the editor.
      </div>
      <div style={{ display: 'flex' }}>
        <MonacoEditor onChange={this.handleEdit} language="markdown" value={this.state.text} width="33%" height={500} requireConfig={monacoRequireConfig} />
        {WikiParser.renderCustomHast(this.state.hast)}
      </div>
      <div>
        {React.createElement(Apps.kpt, { data: this.getAppText(), onEdit: this.handleAppEdit })}
      </div>
    </div>);
  }
}
