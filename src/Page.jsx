import React from 'react';
import NavLink from 'react-router-dom/NavLink';

import AppEnabledWikiEditorAce from './AppEnabledWikiEditorAce';

export default function Page(props) {
  const pageName = props.match.params.page;
  return (<div>
    <div style={{ height: '24px' }}>
      <NavLink to="/">cattaz</NavLink>
      <span>{pageName}</span>
    </div>
    <AppEnabledWikiEditorAce key={pageName} roomName={pageName} defaultValue={`syncing with ${pageName}...`} heightMargin={24} />
  </div>);
}
Page.propTypes = {
  match: React.PropTypes.shape({
    params: React.PropTypes.shape({
      page: React.PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
