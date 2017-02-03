import React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/markdown';
import 'brace/theme/github';

import Y from 'yjs/dist/y.es6';
import yArray from 'y-array';
import yWebsocketsClient from 'y-websockets-client';
import yMemory from 'y-memory';
import yText from 'y-text';

import WikiParser from './WikiParser';

Y.extend(yArray, yWebsocketsClient, yMemory, yText);

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
  componentDidMount() {
    if (this.props.roomName) {
      Y({
        db: {
          name: 'memory',
        },
        connector: {
          name: 'websockets-client',
          url: `http://${window.location.hostname}:1234`,
          room: this.props.roomName,
        },
        share: {
          textarea: 'Text',
        },
      }).then((y) => {
        this.y = y;
        window.ace = {};
        window.ace.require = () => ({
          Range: (startRow, startColumn, endRow, endColumn) => ({
            start: {
              column: startColumn,
              row: startRow,
            },
            end: {
              column: endColumn,
              row: endRow,
            },
          }),
        });
        y.share.textarea.bindAce(this.editor.editor);
      });
    }
  }
  componentWillUnmount() {
    if (this.y) {
      this.y.share.textarea.unbindAce(this.editor.editor);
    }
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
    return (<div style={{ height: window.innerHeight-16 }} >
      <div style={{ display: 'flex', height: "100%" }} >
        <AceEditor ref={(c) => { this.editor = c; }} onChange={this.handleEdit} mode="markdown" theme="" value={this.state.text} style={{ height:"100%" }} />
        <div style={{ overflowY:"scroll", height:"100%", width:"100%" }} >
            {WikiParser.renderCustomHast(this.state.hast, { onEdit: this.handleAppEdit })}
        </div>
      </div>
    </div>);
  }
}
AppEnabledWikiEditorAce.propTypes = {
  defaultValue: React.PropTypes.string,
  roomName: React.PropTypes.string,
};
AppEnabledWikiEditorAce.defaultProps = {
  defaultValue,
  roomName: null,
};
