import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/markdown';
import 'brace/theme/github';

import Y from 'yjs/dist/y.es6';
import yArray from 'y-array/dist/y-array.es6';
import yWebsocketsClient from 'y-websockets-client/dist/y-websockets-client.es6';
import yMemory from 'y-memory/dist/y-memory.es6';
import yText from 'y-text/dist/y-text.es6';

import WikiParser from './WikiParser';

Y.extend(yArray, yWebsocketsClient, yMemory, yText);

const aceRequire = brace.acequire;

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
    this.AceRange = aceRequire('ace/range').Range;
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
        y.share.textarea.bindAce(this.editor.editor, { aceRequire });
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
    const session = this.editor.editor.getSession();
    const lastLine = session.getLine(appContext.position.end.line - 2);
    const range = new this.AceRange(appContext.position.start.line, 0, appContext.position.end.line - 2, lastLine.length);
    session.replace(range, newText);
  }
  render() {
    return (<div style={{ height: window.innerHeight - 16 }} >
      <div style={{ display: 'flex', height: '100%' }} >
        <AceEditor ref={(c) => { this.editor = c; }} onChange={this.handleEdit} mode="markdown" theme="" value={this.state.text} style={{ height: '100%' }} />
        <div style={{ overflowY: 'scroll', height: '100%', width: '100%' }} >
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
