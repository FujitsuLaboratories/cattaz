import React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/markdown';
import 'brace/theme/github';

export default function WikiApp(props) {
  return (<div style={{ display: 'flex', height: window.innerHeight - 16 }}>
    <AceEditor mode="markdown" theme="" value={props.markdown} style={{ height: '100%' }} />
    <div style={{ overflowY: 'scroll', height: '100%', width: '100%' }}>
      {props.preview}
    </div>
  </div>);
}

WikiApp.propTypes = {
  markdown: React.PropTypes.string.isRequired,
  preview: React.PropTypes.node.isRequired,
};
