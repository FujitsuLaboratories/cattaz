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
  constructor() {
    super();
    this.handleUpdateDate = this.handleUpdateDate.bind(this);
  }
  shouldComponentUpdate(nextProps) {
    if (this.props.data === nextProps.data) return false;
    const oldModel = DateModel.deserialize(this.props.data);
    const newModel = DateModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
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
    const newModel = new DateModel();
    newModel.updateDate(value);
    this.props.onEdit(newModel.serialize(), this.props.appContext);
  }
  render() {
    const date = DateModel.deserialize(this.props.data);
    return (
      <div>
        Date and time: {date.date}
        <input type="button" value="Get current time" onClick={this.handleUpdateDate} />
      </div>);
  }
}

DateApplication.Model = DateModel;

DateApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
