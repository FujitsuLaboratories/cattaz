import React from 'react';
import MonacoEditor from 'react-monaco-editor/lib';
import repeat from 'lodash/repeat';

import WikiParser from './WikiParser';
import monacoRequireConfig from './monacoRequireConfig';

const defaultValue = `# KPT

\`\`\`kpt
\`\`\`
`;

export default class AppEnabledWikiEditor extends React.Component {
  constructor() {
    super();
    this.state = { text: defaultValue, hast: WikiParser.convertToCustomHast(WikiParser.parseToHast(defaultValue)) };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleAppEdit = this.handleAppEdit.bind(this);
  }
  handleEdit(text) {
    const hastOriginal = WikiParser.parseToHast(text);
    const hast = WikiParser.convertToCustomHast(hastOriginal);
    this.setState({ text, hast });
  }
  handleAppEdit(t, position) {
    const originalText = this.state.text;
    const textBefore = originalText.substring(0, position.start.offset);
    const textAfter = originalText.substring(position.end.offset);
    const endMarkIndentation = position.end.column - 4;
    const text = `${textBefore}\`\`\`kpt
${t}
${repeat(' ', endMarkIndentation)}\`\`\`${textAfter}`;
    const hastOriginal = WikiParser.parseToHast(text);
    const hast = WikiParser.convertToCustomHast(hastOriginal);
    this.setState({ text, hast });
  }
  render() {
    return (<div>
      <div style={{ display: 'flex' }}>
        <MonacoEditor ref={(c) => { this.editor = c; }} onChange={this.handleEdit} language="markdown" value={this.state.text} width="33%" height={500} requireConfig={monacoRequireConfig} />
        {WikiParser.renderCustomHast(this.state.hast, { onEdit: this.handleAppEdit })}
      </div>
    </div>);
  }
}
