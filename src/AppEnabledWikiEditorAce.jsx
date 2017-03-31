import React from 'react';
import throttle from 'lodash/throttle';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/markdown';
import 'brace/theme/tomorrow_night';

import Y from 'yjs/dist/y.es6';
import yArray from 'y-array/dist/y-array.es6';
import yWebsocketsClient from 'y-websockets-client/dist/y-websockets-client.es6';
import yMemory from 'y-memory/dist/y-memory.es6';
import yText from 'y-text/dist/y-text.es6';

import verge from 'verge';

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
    this.handleResize = this.updateHeight.bind(this);
    this.handleEdit = throttle(this.handleEdit.bind(this), 100, { leading: false, trailing: true });
    this.handleAppEdit = this.handleAppEdit.bind(this);
    this.AceRange = aceRequire('ace/range').Range;
  }
  componentWillMount() {
    this.updateHeight();
    window.addEventListener('resize', this.handleResize);
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
    window.removeEventListener('resize', this.handleResize, false);
    if (this.y) {
      this.y.share.textarea.unbindAce(this.editor.editor);
    }
  }
  updateHeight() {
    const newHeight = verge.viewportH() - this.props.heightMargin;
    if (newHeight !== this.state.height) {
      this.setState({ height: newHeight });
      if (this.editor) {
        this.editor.editor.resize();
      }
    }
  }
  handleEdit(text) {
    const hastOriginal = WikiParser.parseToHast(text);
    const hast = WikiParser.convertToCustomHast(hastOriginal);
    this.setState({ text, hast });
  }
  handleAppEdit(newText, appContext) {
    const session = this.editor.editor.getSession();
    const isOldTextEmpty = appContext.position.start.line === appContext.position.end.line - 1;
    if (!isOldTextEmpty) {
      const lastLine = session.getLine(appContext.position.end.line - 2);
      const range = new this.AceRange(appContext.position.start.line, 0, appContext.position.end.line - 2, lastLine.length);
      session.replace(range, newText);
    } else {
      const position = { row: appContext.position.end.line - 1, column: 0 };
      session.insert(position, '\n');
      session.insert(position, newText);
    }
  }
  render() {
    return (
      <div style={{ display: 'flex' }} >
        <AceEditor ref={(c) => { this.editor = c; }} onChange={this.handleEdit} mode="markdown" theme="tomorrow_night" wrapEnabled value={this.state.text} height={this.state.height} width={500} />
        <div style={{ height: `${this.state.height}px`, width: '100%' }} >
          {WikiParser.renderCustomHast(this.state.hast, { onEdit: this.handleAppEdit })}
        </div>
      </div>
    );
  }
}
AppEnabledWikiEditorAce.propTypes = {
  defaultValue: React.PropTypes.string,
  roomName: React.PropTypes.string,
  heightMargin: React.PropTypes.number,
};
AppEnabledWikiEditorAce.defaultProps = {
  defaultValue,
  roomName: null,
  heightMargin: 0,
};
