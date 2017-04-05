import React from 'react';
import NavLink from 'react-router-dom/NavLink';

import AppEnabledWikiEditorAce from './AppEnabledWikiEditorAce';
import logo from '../docs/assets/cattz-10-character.png';

export default function Page(props) {
  const pageName = props.match.params.page;
  return (<div>
    <div style={{ height: 33 + 4 }}>
      <NavLink to="/"><img src={logo} alt="cattaz" width="100" height="33" /></NavLink>
      <span style={{ margin: '0 0.5em', verticalAlign: 'top', fontSize: '24px' }}>{pageName}</span>
    </div>
    <AppEnabledWikiEditorAce key={pageName} roomName={pageName} defaultValue={`syncing with ${pageName}...`} heightMargin={33 + 4} />
  </div>);
}
Page.propTypes = {
  match: React.PropTypes.shape({
    params: React.PropTypes.shape({
      page: React.PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
