import React from 'react';
import MonacoEditor from 'react-monaco-editor/lib';

import KPTApplication from './MandalaApplication';
import monacoRequireConfig from './monacoRequireConfig';

const defaultValue = `\`\`\`mandala
\`\`\`
`;

export default class AppEnabledWikiEditor extends React.Component {
  constructor() {
    super();
    this.state = { text: defaultValue };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleAppEdit = this.handleAppEdit.bind(this);
  }
  getAppText() {
    return this.state.text.replace('```mandala', '').replace('```', '');
  }
  handleEdit(text) {
    this.setState({ text });
  }
  handleAppEdit(text) {
    this.setState({ text: `\`\`\`mandala
${text}
\`\`\`
` });
  }
  render() {
    // TODO pick a class based on fenced code block's language
    const appClass = KPTApplication;
    return (<div>
      <div>
        In the real use case, wiki text should be written in Markdown syntax and application data is stored in fenced code block.
        To make things easier, this component does not parse markdown.
        You should write only one fenced code block in the editor.
      </div>
      <div style={{ display: 'flex' }}>
        <MonacoEditor onChange={this.handleEdit} language="markdown" value={this.state.text} width="50%" height={500} requireConfig={monacoRequireConfig} />
        {React.createElement(appClass, { data: this.getAppText(), onEdit: this.handleAppEdit })}
      </div>
    </div>);
  }
}
