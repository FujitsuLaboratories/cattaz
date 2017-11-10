import React from 'react';
import PropTypes from 'prop-types';
import HashRouter from 'react-router-dom/HashRouter';
import NavLink from 'react-router-dom/NavLink';

import logo from '../docs/assets/cattaz.svg';
import docs from './docs';

const url = `http://${window.location.hostname}:1234`;

export default class Main extends React.Component {
  constructor() {
    super();
    this.handleNew = this.handleNew.bind(this);
    this.state = { pages: [], getPagesError: '' };
  }
  componentDidMount() {
    window.fetch(`${url}/pages`)
      .then(response => response.json())
      .then((data) => {
        this.setState({ pages: data, getPagesError: '' });
      }).catch((e) => {
        this.setState({ pages: [], getPagesError: `Get Pages Error [ ${e} ]` });
      });
  }
  handleNew() {
    const pageName = this.newPageName.value;
    if (pageName) {
      this.context.router.history.push(`/page/${pageName}`);
    }
  }
  render() {
    const metadataStyle = {
      margin: '0 0 0 0.5em',
      color: 'grey',
    };
    return (
      <div style={{ margin: '8px' }}>
        <h1><img src={logo} alt="cattaz" width="640" /></h1>
        <h2>Wiki pages</h2>
        {this.state.getPagesError}
        <ul>
          {this.state.pages.map(p => (
            <li key={p}>
              <NavLink to={`/page/${decodeURIComponent(p.page)}`}>{decodeURIComponent(p.page)}</NavLink>
              <span style={metadataStyle}>(created: {p.created}, modified: {p.modified}, active: {p.active})</span>
            </li>))}
        </ul>
        <p>
          Create a new page: <input ref={(c) => { this.newPageName = c; }} type="text" placeholder="new page name" />
          <input type="button" value="Create" onClick={this.handleNew} />
        </p>
        <h2>Documentation</h2>
        <ul>
          {Object.keys(docs).map(p => <li key={p}><NavLink to={`/doc/${p}`}>{p}</NavLink></li>)}
        </ul>
        <h2>License</h2>
        <ul>
          <li><a href="LICENSE.txt">The MIT License</a></li>
          <li><a href="licenses.txt">Attibution notice for third party software</a></li>
        </ul>
      </div>
    );
  }
}
Main.contextTypes = {
  router: PropTypes.shape(HashRouter.propTypes).isRequired,
};
