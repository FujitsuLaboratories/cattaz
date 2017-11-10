import React from 'react';
import ReactDOM from 'react-dom';
import HashRouter from 'react-router-dom/HashRouter';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';

// To be converted by postcss via webpack
import 'github-markdown-css/github-markdown.css';

import Main from './Main';
import Page from './Page';

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route exact path="/" component={Main} />
      <Route path="/page/:page+" component={Page} />
      <Route path="/doc/:page+" render={props => <Page {...props} doc />} />
    </Switch>
  </HashRouter>,
  document.getElementById('app'),
);
