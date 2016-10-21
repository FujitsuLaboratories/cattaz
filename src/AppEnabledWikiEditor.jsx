import React from 'react';
import MonacoEditor from 'react-monaco-editor/lib';

import WikiParser from './WikiParser';
import monacoRequireConfig from './monacoRequireConfig';

const defaultValue = `# Apps

\`\`\`kpt
\`\`\`

\`\`\`mandala
\`\`\`
`;

export default class AppEnabledWikiEditor extends React.Component {
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
    const text = WikiParser.replaceAppCode(this.state.text, appContext.position, appContext.language, newText);
    const hastOriginal = WikiParser.parseToHast(text);
    const hast = WikiParser.convertToCustomHast(hastOriginal);
    this.setState({ text, hast });
  }
  render() {
    return (<div>
      <div style={{ display: 'flex' }}>
        <MonacoEditor onChange={this.handleEdit} language="markdown" value={this.state.text} width="33%" height={500} requireConfig={monacoRequireConfig} />
        {WikiParser.renderCustomHast(this.state.hast, { onEdit: this.handleAppEdit })}
      </div>
    </div>);
  }
}
AppEnabledWikiEditor.propTypes = {
  defaultValue: React.PropTypes.string,
};
AppEnabledWikiEditor.defaultProps = {
  defaultValue,
};
