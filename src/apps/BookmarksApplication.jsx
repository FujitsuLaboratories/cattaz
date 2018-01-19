import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';

import isEqual from 'lodash/isEqual';

const RECENT_MAX = 20;

class Bookmark {
  constructor(name, link, recentClicks) {
    this.name = name;
    this.link = link;
    this.recentClicks = recentClicks;
  }
  addClickHistory(datetime) {
    const overflow = this.recentClicks.length - RECENT_MAX;
    if (overflow >= 0) {
      this.recentClicks.splice(0, overflow + 1);
    }
    this.recentClicks.push(datetime);
  }
}

class BookmarksModel {
  constructor() {
    this.bookmarks = [];
  }
  equals(other) {
    return isEqual(this, other);
  }
  serialize() {
    return Yaml.safeDump(this);
  }
  addBookmark(name, link) {
    this.bookmarks.push(new Bookmark(name, link, []));
  }
  hasBookmark(link) {
    const bookmark = this.bookmarks.find(b => b.link === link);
    return !!bookmark;
  }
  addClickHistory(link, datetime) {
    const bookmark = this.bookmarks.find(b => b.link === link);
    if (bookmark) {
      bookmark.addClickHistory(datetime);
    }
  }
  static deserialize(str) {
    try {
      const obj = Yaml.safeLoad(str);
      const model = new BookmarksModel();
      if (obj.bookmarks) {
        model.bookmarks = obj.bookmarks.map(e => new Bookmark(e.name, e.link, e.recentClicks));
      }
      return model;
    } catch (ex) {
      return new BookmarksModel();
    }
  }
}

export default class BookmarksApplication extends React.Component {
  static getDateBeforeDays(days) {
    const date = new Date();
    date.setDate(date.getDate() - days); // Automatically calculate month
    return date;
  }
  constructor(props) {
    super();
    this.handleAdd = this.handleAdd.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = { bookmarks: BookmarksModel.deserialize(props.data) };
  }
  componentWillReceiveProps(newProps) {
    if (this.props.data !== newProps.data) {
      const bookmarks = BookmarksModel.deserialize(newProps.data);
      this.setState({ bookmarks });
    }
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.bookmarks.equals(nextState.bookmarks);
  }
  handleAdd() {
    const name = this.inputName.value;
    const link = this.inputLink.value;
    if (name && link) {
      if (!this.state.bookmarks.hasBookmark(link)) {
        this.state.bookmarks.addBookmark(name, link);
        this.forceUpdate();
        this.props.onEdit(this.state.bookmarks.serialize(), this.props.appContext);
      }
    }
  }
  handleClick(ev) {
    const link = ev.target.getAttribute('data-link'); // href attribute may be changed by canonicalization
    ev.preventDefault();
    this.state.bookmarks.addClickHistory(link, new Date());
    this.forceUpdate();
    this.props.onEdit(this.state.bookmarks.serialize(), this.props.appContext);
    window.open(link, '_blank');
  }
  render() {
    const bookmarks = this.state.bookmarks.bookmarks.slice(0);
    bookmarks.sort((a, b) => {
      for (let i = 0; i < 7; i += 1) {
        const date = BookmarksApplication.getDateBeforeDays(i);
        const diff = b.recentClicks.filter(d => d > date).length - a.recentClicks.filter(d => d > date).length;
        if (diff !== 0) return diff;
      }
      return 0;
    });
    return (
      <React.Fragment>
        <ol>
          {bookmarks.map(b => <li key={b.link}><a href={b.link} onClick={this.handleClick} data-link={b.link}>{b.name}</a></li>)}
        </ol>
        <input type="text" ref={(c) => { this.inputName = c; }} placeholder="name" />
        <input type="text" ref={(c) => { this.inputLink = c; }} placeholder="link" />
        <button onClick={this.handleAdd}>Add bookmark</button>
      </React.Fragment>);
  }
}

BookmarksApplication.Model = BookmarksModel;

BookmarksApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
