import React from 'react';
import MonacoEditor from 'react-monaco-editor/lib';

export default function WikiApp(props) {
  const style = {
    width: '50%',
    margin: '0.5em',
  };
  return (<div style={{ display: 'flex' }}>
    <MonacoEditor language="markdown" value={props.markdown} style={style} />
    <div style={style}>
      {props.preview}
    </div>
  </div>);
}

WikiApp.propTypes = {
  markdown: React.PropTypes.string,
  preview: React.PropTypes.node,
};
