import React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/markdown';
import 'brace/theme/github';

import WikiParser from './WikiParser';

const defaultValue = `# Apps

\`\`\`kpt
\`\`\`

\`\`\`mandala
\`\`\`
`;

export default class AppEnabledWikiEditorAce extends React.Component {
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
        <AceEditor onChange={this.handleEdit} mode="markdown" theme="" value={this.state.text} />
        {WikiParser.renderCustomHast(this.state.hast, { onEdit: this.handleAppEdit })}
      </div>
    </div>);
  }
}
AppEnabledWikiEditorAce.propTypes = {
  defaultValue: React.PropTypes.string,
};
AppEnabledWikiEditorAce.defaultProps = {
  defaultValue,
};
