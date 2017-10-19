import React from 'react';
import PropTypes from 'prop-types';
import { diffChars } from 'diff';
import CodeMirror from 'react-codemirror';
import 'codemirror/mode/markdown/markdown';
import SplitPane from 'react-split-pane';

import Y from 'yjs/dist/y.es6';
import yArray from 'y-array/dist/y-array.es6';
import yWebsocketsClient from 'y-websockets-client/dist/y-websockets-client.es6';
import yMemory from 'y-memory/dist/y-memory.es6';
import yText from 'y-text/dist/y-text.es6';

import verge from 'verge';

import WikiParser from './WikiParser';

Y.extend(yArray, yWebsocketsClient, yMemory, yText);

const resizerMargin = 12;

export default class AppEnabledWikiEditorCodeMirror extends React.Component {
  constructor(props) {
    super();
    this.state = { text: props.defaultValue, hast: WikiParser.convertToCustomHast(WikiParser.parseToHast(props.defaultValue)), editorPercentage: 50 };
    this.handleResize = this.updateSize.bind(this);
    this.handleSplitResized = this.handleSplitResized.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleAppEdit = this.handleAppEdit.bind(this);
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.editor.getCodeMirror().on('changes', this.handleEdit);
    this.updateHeight();
    this.updateWidth();
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
        y.share.textarea.bindCodeMirror(this.editor.getCodeMirror());
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ text: nextProps.value });
      this.editor.getCodeMirror().setValue(nextProps.value);
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
    if (this.editor) {
      this.editor.getCodeMirror().off('changes', this.handleEdit);
    }
    if (this.y) {
      this.y.share.textarea.unbindCodeMirror(this.editor.getCodeMirror());
    }
  }
  updateHeight() {
    const newHeight = verge.viewportH() - this.props.heightMargin;
    if (newHeight !== this.state.height) {
      this.setState({ height: newHeight });
      if (this.editor) {
        this.editor.getCodeMirror().setSize(null, newHeight);
      }
    }
  }
  updateWidth() {
    const vw = verge.viewportW();
    let newWidth = (vw * (this.state.editorPercentage / 100)) - resizerMargin;
    if (newWidth < 0) {
      newWidth = 0;
    }
    const previewWidth = vw - newWidth - (2 * resizerMargin) - 1;
    if (newWidth !== this.state.width) {
      this.setState({ width: newWidth, previewWidth });
    }
  }
  updateSize() {
    this.updateWidth();
    this.updateHeight();
  }
  handleSplitResized(newSize) {
    const viewportWidth = verge.viewportW();
    const newPercentage = (100.0 * newSize) / viewportWidth;
    if (newPercentage !== this.state.editorPercentage) {
      this.setState({ editorPercentage: newPercentage });
      this.updateWidth();
    }
  }
  handleEdit() {
    const text = this.editor.getCodeMirror().getValue();
    const hastOriginal = WikiParser.parseToHast(text);
    const hast = WikiParser.convertToCustomHast(hastOriginal);
    this.setState({ text, hast });
  }
  handleAppEdit(newText, appContext) {
    const cm = this.editor.getCodeMirror();
    const isOldTextEmpty = appContext.position.start.line === appContext.position.end.line - 1;
    if (!isOldTextEmpty) {
      const lastLine = cm.getLine(appContext.position.end.line - 2);
      const startPos = { line: appContext.position.start.line, ch: 0 };
      const endPos = { line: appContext.position.end.line - 2, ch: lastLine.length };
      const oldText = cm.getRange(startPos, endPos);
      const changes = diffChars(oldText, newText);
      let cursor = { line: startPos.line, ch: startPos.ch };
      const nextPosition = (p, str) => {
        const lines = str.split('\n');
        if (lines.length >= 2) {
          return {
            line: p.line + (lines.length - 1),
            ch: lines[lines.length - 1].length,
          };
        }
        return {
          line: p.line,
          ch: p.ch + lines[0].length,
        };
      };
      cm.operation(() => {
        changes.forEach((c) => {
          if (c.removed) {
            const end = nextPosition(cursor, c.value);
            cm.replaceRange('', cursor, end);
          } else if (c.added) {
            cm.replaceRange(c.value, cursor);
            cursor = nextPosition(cursor, c.value);
          } else {
            cursor = nextPosition(cursor, c.value);
          }
        });
      });
    } else {
      const position = { line: appContext.position.end.line - 1, ch: 0 };
      cm.operation(() => {
        cm.replaceRange('\n', position);
        cm.replaceRange(newText, position);
      });
    }
  }
  render() {
    const cmOptions = {
      mode: 'markdown',
      lineNumbers: true,
      lineWrapping: true,
      theme: 'seti',
    };
    return (
      <SplitPane ref={(c) => { this.spliter = c; }} split="vertical" size={this.state.width + resizerMargin} onChange={this.handleSplitResized}>
        <CodeMirror ref={(c) => { this.editor = c; }} value={this.state.text} options={cmOptions} />
        <div
          style={{
            overflow: 'auto',
            width: this.state.previewWidth,
            height: this.state.height,
            paddingLeft: resizerMargin,
          }}
          className="markdown-body"
        >
          {WikiParser.renderCustomHast(this.state.hast, { onEdit: this.handleAppEdit })}
        </div>
      </SplitPane>
    );
  }
}
AppEnabledWikiEditorCodeMirror.propTypes = {
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  roomName: PropTypes.string,
  heightMargin: PropTypes.number,
};
AppEnabledWikiEditorCodeMirror.defaultProps = {
  defaultValue: '',
  value: null,
  roomName: null,
  heightMargin: 0,
};
