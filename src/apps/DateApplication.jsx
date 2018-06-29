import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';

class DateModel {
  constructor() {
    this.date = '';
  }
  updateDate(str) {
    this.date = str;
  }
  equals(other) {
    return this.date === other.date;
  }
  serialize() {
    return Yaml.safeDump(this);
  }
  static deserialize(str) {
    try {
      const obj = Yaml.safeLoad(str);
      const model = new DateModel();
      if (obj.date) model.date = obj.date;
      return model;
    } catch (ex) {
      return new DateModel();
    }
  }
}

export default class DateApplication extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    const date = DateModel.deserialize(nextProps.data);
    return { date };
  }
  constructor() {
    super();
    this.state = { date: new DateModel() };
    this.handleUpdateDate = this.handleUpdateDate.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.date.equals(nextState.date);
  }
  handleUpdateDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const week = date.getDay();
    const day = date.getDate();
    const enWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const value = `${year}-${month}-${day} (${enWeek[week]}) ${hour}:${minutes}`;
    this.state.date.updateDate(value);
    this.forceUpdate();
    this.props.onEdit(this.state.date.serialize(), this.props.appContext);
  }
  render() {
    return (
      <div>
        Date and time: {this.state.date.date}
        <input type="button" value="Get current time" onClick={this.handleUpdateDate} />
      </div>);
  }
}

DateApplication.Model = DateModel;

DateApplication.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
