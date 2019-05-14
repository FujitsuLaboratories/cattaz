import React from 'react';
import RouterLink from 'react-router-dom/Link';
import TimeAgo from 'react-timeago';
import Modal from 'react-modal';
import { createHashHistory } from 'history';

import logo from '../docs/assets/cattaz.svg';

const url = `http://${window.location.hostname}:${process.env.PORT || '8080'}`;
const timeAgoMinPeriod = 10;
const pagesListMax = 10;

// TODO: Make appropriate cross-origin correspondence
// Avoid unnecessary caching in IE browser
let headers = {};
const userAgent = window.navigator.userAgent.toLowerCase();
if (userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1) {
  headers = { pragma: 'no-cache' };
}

export default class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      pages: [], currentPageNum: 1, getPagesError: '', modalIsOpen: false, deletePageName: '', deleteErrorMsg: '',
    };
    this.refInputNewPageName = React.createRef();
    this.refContainer = React.createRef();
    this.handleNew = this.handleNew.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleDeleteOpenModal = this.handleDeleteOpenModal.bind(this);
    this.handleDeleteCloseModal = this.handleDeleteCloseModal.bind(this);
    this.handleDeleteOkBtnModal = this.handleDeleteOkBtnModal.bind(this);
  }

  componentDidMount() {
    Modal.setAppElement(this.refContainer.current);
    this.getListPages();
  }

  async getListPages() {
    try {
      const response = await window.fetch(`${url}/pages`, {
        headers,
      });
      const data = await response.json();
      this.setState({
        pages: data.sort((x, y) => {
          if (x.modified === y.modified) return 0;
          if (!x.modified) return 1;
          if (!y.modified) return -1;
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
    } catch (e) {
      this.setState({ pages: [], getPagesError: `Get Pages Error [ ${e} ]` });
    }
  }

  handleNew() {
    const pageName = this.refInputNewPageName.current.value;
    if (pageName) {
      const history = createHashHistory();
      history.push(`/page/${pageName}`);
    }
  }

  handleDeleteOpenModal(e) {
    this.setState({ modalIsOpen: true, deletePageName: e.target.id });
  }

  handleDeleteCloseModal() {
    this.setState({ modalIsOpen: false, deleteErrorMsg: '' });
  }

  async handleDeleteOkBtnModal() {
    const { deletePageName } = this.state;
    try {
      const res = await window.fetch(`${url}/deletePage`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: deletePageName,
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        this.getListPages();
        this.setState({ modalIsOpen: false, deleteErrorMsg: '' });
      } else {
        this.setState({ deleteErrorMsg: `Error: ${data.msg}` });
      }
    } catch (e) {
      this.setState({ deleteErrorMsg: `Error: ${e}` });
    }
  }

  handlePrevious() {
    const { currentPageNum } = this.state;
    this.setState({ currentPageNum: currentPageNum - 1 });
  }

  handleNext() {
    const { currentPageNum } = this.state;
    this.setState({ currentPageNum: currentPageNum + 1 });
  }

  renderListPages() {
    const { pages, currentPageNum, getPagesError } = this.state;
    const metadataStyle = {
      margin: '0 0 0 0.5em',
      color: 'grey',
    };
    const totalPageCount = Math.ceil(pages.length / pagesListMax);
    const currentPages = pages.slice((currentPageNum - 1) * pagesListMax, currentPageNum * pagesListMax);
    return (
      <React.Fragment>
        {getPagesError}
        <p>
          Create a new page:
          {' '}
          <input ref={this.refInputNewPageName} type="text" placeholder="new page name" />
          <input type="button" value="Create" onClick={this.handleNew} />
        </p>
        <ul>
          {currentPages.map(p => (
            <li key={p.page}>
              <RouterLink to={`/page/${decodeURIComponent(p.page)}`}>
                {decodeURIComponent(p.page)}
              </RouterLink>
              <span style={metadataStyle}>
                (created:
                {' '}
                <TimeAgo date={p.created} minPeriod={timeAgoMinPeriod} />
                , modified:
                {' '}
                <TimeAgo date={p.modified} minPeriod={timeAgoMinPeriod} />
                , active:
                {' '}
                {p.active}
                )
              </span>
              <button className="deleteBtn" onClick={this.handleDeleteOpenModal} id={p.page} type="button">
                Delete
              </button>
            </li>
          ))}
        </ul>
        {currentPageNum > 1 ? (
          <button type="button" onClick={this.handlePrevious}>
            Prev
          </button>
        ) : null}
        {pages.length > pagesListMax ? (
          <span>
            {`&nbsp;Page: ${currentPageNum}&nbsp;`}
          </span>
        ) : null}
        {currentPageNum < totalPageCount ? (
          <button type="button" onClick={this.handleNext}>
            Next
          </button>
        ) : null}
      </React.Fragment>
    );
  }

  render() {
    const { modalIsOpen, deletePageName, deleteErrorMsg } = this.state;
    const modalStyles = {
      wrapper: {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        },
      },
      pageName: {
        marginTop: '10px',
      },
      error: {
        color: '#e74c3c',
      },
    };
    return (
      <div style={{ margin: '8px' }} ref={this.refContainer}>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={this.handleDeleteCloseModal}
          style={modalStyles.wrapper}
          contentLabel="Delete page"
        >
          <div>
            Do you really want to delete?
          </div>
          <div style={modalStyles.pageName}>
            &quot;
            {deletePageName}
            &quot;
          </div>
          {deleteErrorMsg !== '' ? (
            <div style={modalStyles.error}>
              {deleteErrorMsg}
            </div>
          ) : null}
          <button className="deleteCancelBtnModal" onClick={this.handleDeleteCloseModal} type="button">
            Cancel
          </button>
          <button className="deleteOkBtnModal" onClick={this.handleDeleteOkBtnModal} type="button">
            OK
          </button>
        </Modal>
        <h1>
          <img src={logo} alt="cattaz" width="640" />
        </h1>
        <h2>
          List of pages
        </h2>
        {this.renderListPages()}
        <h2>
          Documentation
        </h2>
        <ul>
          <li>
            <RouterLink to="/doc/index">
              Index
            </RouterLink>
            {' '}
            (
            <RouterLink to="/doc/ja/index">
              日本語
            </RouterLink>
            )
          </li>
          <li>
            <RouterLink to="/doc/usage">
              Usage
            </RouterLink>
            {' '}
            (
            <RouterLink to="/doc/ja/usage">
              日本語
            </RouterLink>
            )
          </li>
          <li>
            List of sample applications
            <ul>
              <li>
                <RouterLink to="/doc/app-hello">
                  Hello
                </RouterLink>
                {' '}
                (
                <RouterLink to="/doc/ja/app-hello">
                  日本語
                </RouterLink>
                )
              </li>
              <li>
                <RouterLink to="/doc/app-kanban">
                  Kanban
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/doc/apps">
                  and more
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>
        <h2>
          License
        </h2>
        <ul>
          <li>
            <a href="LICENSE.txt">
              The MIT License
            </a>
            . Source code is available on
            {' '}
            <a href="https://github.com/FujitsuLaboratories/cattaz">
              GitHub
            </a>
            .
          </li>
          <li>
            <a href="licenses.txt">
              Attibution notice for third party software
            </a>
          </li>
        </ul>
      </div>
    );
  }
}
