import React from 'react';
import ReactDOM from 'react-dom';

import injectTapEventPlugin from 'react-tap-event-plugin';

import AppEnabledWikiEditorAce from './AppEnabledWikiEditorAce';

// Needed for onTouchTap
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

ReactDOM.render((
  <AppEnabledWikiEditorAce />
), document.getElementById('app'));
