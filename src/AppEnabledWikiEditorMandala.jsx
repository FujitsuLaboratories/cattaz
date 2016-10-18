import React from 'react';
import MonacoEditor from 'react-monaco-editor/lib';
import repeat from 'lodash/repeat';

import WikiParser from './WikiParser';
import monacoRequireConfig from './monacoRequireConfig';

const defaultValue = `# MANDALA

\`\`\`mandala
\`\`\`
`;

export default class AppEnabledWikiEditorMandala extends React.Component {
  constructor(props) {
    super();
    this.state = { text: props.defaultValue, hast: WikiParser.convertToCustomHast(WikiParser.parseToHast(props.defaultValue)) };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleAppEdit = this.handleAppEdit.bind(this);
  }
  handleEdit(text) {
    const hastOriginal = WikiParser.parseToHast(text);
    const hast = WikiParser.convertToCustomHast(hastOriginal);
    this.setState({ text, hast });
  }
  handleAppEdit(newText, appContext) {
    const originalText = this.state.text;
    const textBefore = originalText.substring(0, appContext.position.start.offset);
    const textAfter = originalText.substring(appContext.position.end.offset);
    const endMarkIndentation = appContext.position.end.column - (1 + 3);
    const text = `${textBefore}\`\`\`${appContext.language}
${newText}
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
AppEnabledWikiEditorMandala.propTypes = {
  defaultValue: React.PropTypes.string,
};
AppEnabledWikiEditorMandala.defaultProps = {
  defaultValue,
};
