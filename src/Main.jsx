import React from 'react';
import PropTypes from 'prop-types';
import HashRouter from 'react-router-dom/HashRouter';
import RouterLink from 'react-router-dom/Link';
import TimeAgo from 'react-timeago';

import logo from '../docs/assets/cattaz.svg';

const url = `http://${window.location.hostname}:1234`;
const timeAgoMinPeriod = 10;
const pagesListMax = 10;

export default class Main extends React.Component {
  constructor() {
    super();
    this.handleNew = this.handleNew.bind(this);
    this.state = { pages: [], currentPageNum: 1, getPagesError: '' };
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
  }
  componentDidMount() {
    window.fetch(`${url}/pages`)
      .then(response => response.json())
      .then((data) => {
        this.setState({
          pages: data.sort((x, y) => {
            if (x.modified > y.modified) {
              return -1;
            }
            if (x.modified < y.modified) {
              return 1;
            }
            return 0;
          }),
          getPagesError: '',
        });
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
  handlePrevious() {
    this.setState({ currentPageNum: this.state.currentPageNum - 1 });
  }
  handleNext() {
    this.setState({ currentPageNum: this.state.currentPageNum + 1 });
  }
  renderListPages() {
    const metadataStyle = {
      margin: '0 0 0 0.5em',
      color: 'grey',
    };
    const totalPageCount = Math.ceil(this.state.pages.length / pagesListMax);
    const currentPages = this.state.pages.slice((this.state.currentPageNum - 1) * pagesListMax, this.state.currentPageNum * pagesListMax);
    return (
      <div>
        {this.state.getPagesError}
        <p>
          Create a new page: <input ref={(c) => { this.newPageName = c; }} type="text" placeholder="new page name" />
          <input type="button" value="Create" onClick={this.handleNew} />
        </p>
        <ul>
          {currentPages.map(p => (
            <li key={p.page}>
              <RouterLink to={`/page/${decodeURIComponent(p.page)}`}>{decodeURIComponent(p.page)}</RouterLink>
              <span style={metadataStyle}>(created: <TimeAgo date={p.created} minPeriod={timeAgoMinPeriod} />, modified: <TimeAgo date={p.modified} minPeriod={timeAgoMinPeriod} />, active: {p.active})</span>
            </li>))}
        </ul>
        {this.state.currentPageNum > 1 ? <button type="button" onClick={this.handlePrevious}>Prev</button> : null}
        {this.state.pages.length > pagesListMax ? <span>&nbsp;Page:{this.state.currentPageNum}&nbsp;</span> : null}
        {this.state.currentPageNum < totalPageCount ? <button type="button" onClick={this.handleNext}>Next</button> : null}
      </div>);
  }
  render() {
    return (
      <div style={{ margin: '8px' }}>
        <h1><img src={logo} alt="cattaz" width="640" /></h1>
        <h2>List of pages</h2>
        {this.renderListPages()}
        <h2>Documentation</h2>
        <ul>
          <li><RouterLink to="/doc/index">Index</RouterLink> (<RouterLink to="/doc/ja/index">日本語</RouterLink>)</li>
          <li><RouterLink to="/doc/usage">Usage</RouterLink> (<RouterLink to="/doc/ja/usage">日本語</RouterLink>)</li>
          <li>List of sample applications
            <ul>
              <li><RouterLink to="/doc/app-hello">Hello</RouterLink> (<RouterLink to="/doc/ja/app-hello">日本語</RouterLink>)</li>
              <li><RouterLink to="/doc/app-kanban">Kanban</RouterLink></li>
              <li><RouterLink to="/doc/apps">and more</RouterLink></li>
            </ul>
          </li>
        </ul>
        <h2>License</h2>
        <ul>
          <li><a href="LICENSE.txt">The MIT License</a>. Source code is available on <a href="https://github.com/FujitsuLaboratories/cattaz">GitHub</a>.</li>
          <li><a href="licenses.txt">Attibution notice for third party software</a></li>
        </ul>
      </div>
    );
  }
}
Main.contextTypes = {
  router: PropTypes.shape(HashRouter.propTypes).isRequired,
};
