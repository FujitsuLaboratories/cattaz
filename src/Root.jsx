import React from 'react';
import HashRouter from 'react-router-dom/HashRouter';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import { hot } from 'react-hot-loader';

import Main from './Main';
import Page from './Page';

const Root = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/" component={Main} />
      <Route path="/page/:page+" component={Page} />
      <Route path="/doc/:page+" render={props => <Page {...props} doc />} />
    </Switch>
  </HashRouter>
);

export default hot(module)(Root);
