import React from 'react';
import HashRouter from 'react-router-dom/HashRouter';
import NavLink from 'react-router-dom/NavLink';

import http from 'http';

import logo from '../docs/assets/cattz-10-character.png';

const url = `http://${window.location.hostname}:1234`;

export default class Main extends React.Component {
  constructor() {
    super();
    this.handleNew = this.handleNew.bind(this);
    this.state = { pages: [], getPagesError: '' };
  }
  componentDidMount() {
    http.get(`${url}/pages`, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        this.setState({ pages: JSON.parse(data), getPagesError: '' });
      });
    }).on('error', (e) => {
      this.setState({ pages: [], getPagesError: `Get Pages Error [ ${e} ]` });
    });
  }
  handleNew() {
    const pageName = this.newPageName.value;
    if (pageName) {
      this.context.router.history.push(`/page/${encodeURIComponent(pageName)}`);
    }
  }
  render() {
    return (
      <div>
        <h1><img src={logo} alt="cattaz" /></h1>
        <h2>pages</h2>
        {this.state.getPagesError}
        <ul>
          {this.state.pages.map(p => <li><NavLink to={`/page/${encodeURIComponent(p)}`}>{p}</NavLink></li>)}
        </ul>
        <p>
          Create a new page: <input ref={(c) => { this.newPageName = c; }} type="text" placeholder="new page name" />
          <input type="button" value="Create" onClick={this.handleNew} />
        </p>
      </div>
    );
  }
}
Main.contextTypes = {
  router: React.PropTypes.shape(HashRouter.propTypes).isRequired,
};
