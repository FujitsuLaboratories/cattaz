import React from 'react';
import PropTypes from 'prop-types';

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
    return JSON.stringify(this, null, 2);
  }
  static deserialize(str) {
    try {
      const obj = JSON.parse(str);
      const model = new DateModel();
      model.date = obj.date;
      return model;
    } catch (ex) {
      return new DateModel();
    }
  }
}

export default class DateApplication extends React.Component {
  constructor(props) {
    super();
    this.handleUpdateDate = this.handleUpdateDate.bind(this);
    this.state = { date: DateModel.deserialize(props.data) };
  }
  componentWillReceiveProps(newProps) {
    if (this.props.data !== newProps.data) {
      const date = DateModel.deserialize(newProps.data);
      this.setState({ date });
    }
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
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
