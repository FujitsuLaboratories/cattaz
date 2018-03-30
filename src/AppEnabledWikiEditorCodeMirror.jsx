import React from 'react';
import PropTypes from 'prop-types';
import { diffChars } from 'diff';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/markdown/markdown';
import SplitPane from 'react-split-pane';
import io from 'socket.io-client';
import ColorConvert from 'color-convert';

import Y from 'yjs/dist/y.es6';
import yArray from 'y-array/dist/y-array.es6';
import yWebsocketsClient from 'y-websockets-client/dist/y-websockets-client.es6';
import yMemory from 'y-memory/dist/y-memory.es6';
import yText from 'y-text/dist/y-text.es6';

import actual from 'actual';

import WikiParser from './WikiParser';

Y.extend(yArray, yWebsocketsClient, yMemory, yText);

const resizerMargin = 12;

class OtherClientCursor {
  constructor(id) {
    this.id = id;
    let hue = 0;
    for (let i = 0; i < id.length; i += 1) {
      hue *= 2;
      hue += id.charCodeAt(i);
      hue %= 360;
    }
    this.color = `#${ColorConvert.hsv.hex(hue, 100, 100)}`;
  }
  updateCursor(cursorPos, cm) {
    this.removeCursor();
    const svgSize = 8;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', svgSize);
    svg.setAttribute('height', svgSize);
    svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
    svg.style.position = 'absolute';
    svg.style.marginLeft = `-${svgSize / 2}px`;
    svg.style.marginTop = `${cm.defaultTextHeight()}px`;
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', `0 ${svgSize}, ${svgSize / 2} 0, ${svgSize} ${svgSize}, 0 ${svgSize}`);
    polyline.setAttribute('fill', this.color);
    polyline.setAttribute('fill-opacity', 0.9);
    svg.appendChild(polyline);
    this.marker = cm.setBookmark(cursorPos, { widget: svg, insertLeft: true });
  }
  removeCursor() {
    if (this.marker) {
      this.marker.clear();
      this.marker = null;
    }
  }
}

export default class AppEnabledWikiEditorCodeMirror extends React.Component {
  constructor(props) {
    super();
    this.refEditor = React.createRef();
    this.state = { hast: WikiParser.convertToCustomHast(WikiParser.parseToHast(props.defaultValue)), onFocus: false, editorPercentage: 50 };
    this.handleResize = this.updateSize.bind(this);
    this.handleSplitResized = this.handleSplitResized.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleAppEdit = this.handleAppEdit.bind(this);
    this.handleActiveUser = this.handleActiveUser.bind(this);
    this.handleCursor = this.handleCursor.bind(this);
    this.handleClientCursor = this.handleClientCursor.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.otherClients = new Map();
  }
  async componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.updateHeight();
    this.updateWidth();
    if (this.props.roomName) {
      this.socket = io(`http://${window.location.hostname}:1234`);
      this.socket.on('activeUser', this.handleActiveUser);
      this.y = await Y({
        db: {
          name: 'memory',
        },
        connector: {
          name: 'websockets-client',
          socket: this.socket,
          // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
          room: encodeURIComponent(this.props.roomName),
        },
        share: {
          textarea: 'Text',
        },
      });
      this.y.share.textarea.bindCodeMirror(this.refEditor.current.editor);
      this.socket.on('clientCursor', this.handleClientCursor);
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.refEditor.current.editor.setValue(this.props.value);
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
    if (this.y) {
      this.y.share.textarea.unbindCodeMirror(this.refEditor.current.editor);
      this.y.close();
    }
    if (this.socket) {
      this.socket.off('activeUser', this.handleActiveUser);
      this.socket.off('clientCursor', this.handleClientCursor);
      this.socket.disconnect();
    }
  }
  updateHeight() {
    const newHeight = actual('height', 'px') - this.props.heightMargin;
    if (newHeight !== this.state.height) {
      this.setState({ height: newHeight });
      if (this.refEditor.current) {
        this.refEditor.current.editor.setSize(null, newHeight);
      }
    }
  }
  updateWidth() {
    const vw = actual('width', 'px');
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
  handleActiveUser(userNum) {
    this.props.onActiveUser(userNum);
  }
  handleClientCursor(msg) {
    const client = this.otherClients.get(msg.id);
    if (msg.type === 'update') {
      if (!this.refEditor.current) return;
      const cm = this.refEditor.current.editor;
      if (!client) {
        const newClient = new OtherClientCursor(msg.id);
        this.otherClients.set(msg.id, newClient);
        newClient.updateCursor(msg.cursorPos, cm);
      } else {
        client.updateCursor(msg.cursorPos, cm);
      }
    } else if (msg.type === 'delete') {
      if (client) {
        client.removeCursor();
        this.otherClients.delete(msg.id);
      }
    }
  }
  sendCursorMsg(type, cursorPos) {
    if (this.socket) {
      const cursorMsg = {
        type,
        room: this.props.roomName,
        cursorPos,
      };
      this.socket.emit('clientCursor', cursorMsg);
    }
  }
  handleSplitResized(newSize) {
    const viewportWidth = actual('width', 'px');
    const newPercentage = (100.0 * newSize) / viewportWidth;
    if (newPercentage !== this.state.editorPercentage) {
      this.setState({ editorPercentage: newPercentage });
      this.updateWidth();
    }
  }
  handleEdit(_, data) {
    const text = this.refEditor.current.editor.getValue();
    const hastOriginal = WikiParser.parseToHast(text);
    const hast = WikiParser.convertToCustomHast(hastOriginal);
    this.setState({ hast });
    if (data.origin === '+input' || data.origin === '*compose' || data.origin === '+delete') {
      this.sendCursorMsg('update', { line: data.from.line, ch: data.from.ch });
    }
  }
  handleAppEdit(newText, appContext) {
    const cm = this.refEditor.current.editor;
    const startFencedStr = cm.getLine(appContext.position.start.line - 1);
    const [backticks] = WikiParser.getExtraFencingChars(startFencedStr, newText);
    if (backticks) {
      cm.operation(() => {
        cm.replaceRange(backticks, { line: appContext.position.start.line - 1, ch: (appContext.position.start.column - 1) });
        cm.replaceRange(backticks, { line: appContext.position.end.line - 1, ch: (appContext.position.start.column - 1) });
      });
    }
    const indentedNewText = WikiParser.indentAppCode(appContext.position, WikiParser.removeLastNewLine(newText));
    const isOldTextEmpty = appContext.position.start.line === appContext.position.end.line - 1;
    if (!isOldTextEmpty) {
      const lastLine = cm.getLine(appContext.position.end.line - 2);
      const startPos = { line: appContext.position.start.line, ch: 0 };
      const endPos = { line: appContext.position.end.line - 2, ch: lastLine.length };
      const oldText = cm.getRange(startPos, endPos);
      const changes = diffChars(oldText, indentedNewText);
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
        cm.replaceRange(indentedNewText, position);
      });
    }
    this.sendCursorMsg('update', { line: appContext.position.start.line - 1, ch: (appContext.position.start.column - 1) });
  }
  handleCursor(editor, data) {
    // Code-mirror counts lines and columns from zero.
    this.setState({ cursorPosition: { line: data.line + 1, column: data.ch + 1 } });
  }
  handleFocus() {
    this.setState({ onFocus: true });
  }
  handleBlur() {
    this.setState({ onFocus: false });
  }
  render() {
    const cmOptions = {
      mode: 'markdown',
      lineNumbers: true,
      lineWrapping: true,
      theme: '3024-night',
    };
    return (
      <SplitPane split="vertical" size={this.state.width + resizerMargin} onChange={this.handleSplitResized}>
        <CodeMirror ref={this.refEditor} value={this.props.defaultValue} options={cmOptions} onChange={this.handleEdit} onCursor={this.handleCursor} onFocus={this.handleFocus} onBlur={this.handleBlur} />
        <div
          style={{
            overflow: 'auto',
            width: this.state.previewWidth,
            height: this.state.height,
            paddingLeft: resizerMargin,
          }}
          className="markdown-body"
        >
          {WikiParser.renderCustomHast(this.state.hast, { onEdit: this.handleAppEdit, cursorPosition: this.state.onFocus ? this.state.cursorPosition : null })}
        </div>
      </SplitPane>
    );
  }
}
AppEnabledWikiEditorCodeMirror.propTypes = {
  onActiveUser: PropTypes.func.isRequired,
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
