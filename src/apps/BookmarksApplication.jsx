import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';

import isEqual from 'lodash/isEqual';

const DAYS_TO_KEEP = 14;

function toUTCDateValue(datetime) {
  return (datetime.getUTCFullYear() * 10000) + ((datetime.getUTCMonth() + 1) * 100) + datetime.getUTCDate();
}
function fromUTCDateValue(value) {
  const year = Math.floor(value / 10000);
  const month = Math.floor((value % 10000) / 100);
  const date = value % 100;
  return new Date(Date.UTC(year, month + 1, date));
}

class Bookmark {
  constructor(name, link, clicks = []) {
    this.name = name;
    this.link = link;
    this.clicks = new Map(clicks);
  }
  addClickCount(datetime) {
    const utcDateValue = toUTCDateValue(datetime);
    if (this.clicks.has(utcDateValue)) {
      this.clicks.set(utcDateValue, this.clicks.get(utcDateValue) + 1);
    } else {
      this.clicks.set(utcDateValue, 1);
      if (this.clicks.size > DAYS_TO_KEEP) {
        const minDateValue = Math.min(...this.clicks.keys());
        this.clicks.delete(minDateValue);
      }
    }
  }
  getScore(datetime) {
    const msec = fromUTCDateValue(toUTCDateValue(datetime)).getTime();
    return [...this.clicks.entries()].reduce((prevValue, currentValue) => {
      const [date, count] = currentValue;
      const dateDiff = Math.round((msec - fromUTCDateValue(date).getTime()) / (24 * 60 * 60 * 1000));
      return prevValue + (count / (dateDiff + 1));
    }, 0);
  }
  toSerializable() {
    return {
      name: this.name,
      link: this.link,
      clicks: [...this.clicks.entries()],
    };
  }
  static fromDeserialized(obj) {
    return new Bookmark(obj.name, obj.link, obj.clicks);
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
    return Yaml.safeDump({
      bookmarks: this.bookmarks.map(b => b.toSerializable()),
    });
  }
  addBookmark(name, link) {
    this.bookmarks.push(new Bookmark(name, link));
  }
  hasBookmark(link) {
    const bookmark = this.bookmarks.find(b => b.link === link);
    return !!bookmark;
  }
  addClickCount(link, datetime) {
    const bookmark = this.bookmarks.find(b => b.link === link);
    if (bookmark) {
      bookmark.addClickCount(datetime);
    }
  }
  static deserialize(str) {
    try {
      const obj = Yaml.safeLoad(str);
      const model = new BookmarksModel();
      if (obj.bookmarks) {
        model.bookmarks = obj.bookmarks.map(Bookmark.fromDeserialized);
      }
      return model;
    } catch (ex) {
      return new BookmarksModel();
    }
  }
}

export default class BookmarksApplication extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    const bookmarks = BookmarksModel.deserialize(nextProps.data);
    return { bookmarks };
  }
  static getDateBeforeDays(days) {
    const date = new Date();
    date.setDate(date.getDate() - days); // Automatically calculate month
    return date;
  }
  constructor() {
    super();
    this.refInputName = React.createRef();
    this.refInputLink = React.createRef();
    this.handleAdd = this.handleAdd.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.bookmarks.equals(nextState.bookmarks);
  }
  handleAdd() {
    const name = this.refInputName.current.value;
    const link = this.refInputLink.current.value;
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
    this.state.bookmarks.addClickCount(link, new Date());
    this.forceUpdate();
    this.props.onEdit(this.state.bookmarks.serialize(), this.props.appContext);
    window.open(link, '_blank');
  }
  render() {
    const now = new Date();
    const scoredBookmarks = this.state.bookmarks.bookmarks.map(b => [b, b.getScore(now)]);
    scoredBookmarks.sort((a, b) => b[1] - a[1]);
    return (
      <React.Fragment>
        <ol>
          {scoredBookmarks.map(b => <li key={b[0].link}><a href={b[0].link} onClick={this.handleClick} data-link={b[0].link}>{b[0].name}</a></li>)}
        </ol>
        <input type="text" ref={this.refInputName} placeholder="name" />
        <input type="text" ref={this.refInputLink} placeholder="link" />
        <button onClick={this.handleAdd}>Add bookmark</button>
      </React.Fragment>);
  }
}

BookmarksApplication.Model = BookmarksModel;

BookmarksApplication.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
