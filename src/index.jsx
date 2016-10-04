import React from 'react';
import ReactDOM from 'react-dom';

import injectTapEventPlugin from 'react-tap-event-plugin';

import AppEnabledWikiEditor from './AppEnabledWikiEditor';

// Needed for onTouchTap
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

ReactDOM.render((
  <AppEnabledWikiEditor />
), document.getElementById('app'));
