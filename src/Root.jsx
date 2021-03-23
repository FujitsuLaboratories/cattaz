import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { hot } from 'react-hot-loader';

import Main from './Main';
import Page from './Page';

const Root = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/" component={Main} />
      <Route path="/page/:page+" component={Page} />
      <Route path="/doc/:page+" render={(routeProps) => <Page match={routeProps.match} location={routeProps.location} history={routeProps.history} doc />} />
    </Switch>
  </HashRouter>
);

export default hot(module)(Root);
