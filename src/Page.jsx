import React from 'react';
import NavLink from 'react-router-dom/NavLink';

import AppEnabledWikiEditorAce from './AppEnabledWikiEditorAce';
import docs from './docs';
import logo from '../docs/assets/cattz-10-character.png';

export default function Page(props) {
  const pageName = props.match.params.page;
  const roomName = props.doc ? null : pageName;
  const defaultValue = props.doc ? docs[pageName] : `syncing with ${pageName}...`;
  return (<div>
    <div style={{ height: 33 + 4 }}>
      <NavLink to="/"><img src={logo} alt="cattaz" width="100" height="33" /></NavLink>
      <span style={{ margin: '0 0.5em', verticalAlign: 'top', fontSize: '24px' }}>{pageName}</span>
    </div>
    <AppEnabledWikiEditorAce key={pageName} roomName={roomName} defaultValue={defaultValue} heightMargin={33 + 4} />
  </div>);
}
Page.propTypes = {
  match: React.PropTypes.shape({
    params: React.PropTypes.shape({
      page: React.PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  doc: React.PropTypes.bool,
};
Page.defaultProps = {
  doc: false,
};
