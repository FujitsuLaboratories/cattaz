import React from 'react';
import Apps from './apps';

const languagePrefix = 'language-';

function MyPre(props) {
  const codeAst = props.children[0];
  const text = codeAst.props.children[0];
  const className = codeAst.props.className;
  if (className.indexOf(languagePrefix) === 0) {
    const language = className.substring(languagePrefix.length);
    const appComponent = Apps[language];
    if (appComponent) {
      // TODO handler (context?)
      return React.createElement(appComponent, { data: text });
    }
  }
  return <pre><code>{text}</code></pre>;
}
MyPre.propTypes = {
  children: React.PropTypes.arrayOf(React.PropTypes.object),
};

export default MyPre;
