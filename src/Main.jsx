import React from 'react';
import HashRouter from 'react-router-dom/HashRouter';
import NavLink from 'react-router-dom/NavLink';

export default class Main extends React.Component {
  constructor() {
    super();
    this.handleNew = this.handleNew.bind(this);
    this.state = { pages: ['page1', 'page2'] }; // TODO
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
        <h1>cattaz</h1>
        <h2>pages</h2>
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
