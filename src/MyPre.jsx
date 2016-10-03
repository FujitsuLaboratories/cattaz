import React from 'react';
import KPTApplication from './KPTApplication';

function MyPre(props) {
  const codeAst = props.children[0];
  const text = codeAst.props.children[0];
  const className = codeAst.props.className;
  if (className === 'language-kpt') {
    // TODO handler (context?)
    return <KPTApplication data={text} />;
  }
  return <pre><code>{text}</code></pre>;
}
MyPre.propTypes = {
  children: React.PropTypes.arrayOf(React.PropTypes.object),
};

export default MyPre;
