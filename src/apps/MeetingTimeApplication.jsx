import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

function fillZero(num) {
  let numStr = String(num);
  if (num < 10) {
    numStr = `0${numStr}`;
  }
  return numStr;
}

function getNowTime() {
  const nowTime = {};
  const date = new Date();
  nowTime.year = String(date.getFullYear());
  nowTime.month = fillZero((date.getMonth() + 1));
  const week = date.getDay();
  const enWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  nowTime.week = enWeek[week];
  nowTime.day = fillZero(date.getDate());
  nowTime.hour = fillZero(date.getHours());
  nowTime.minute = fillZero(date.getMinutes());
  return nowTime;
}

function ms2hour(ms) {
  let hour = Math.floor(ms / 3600000);
  let minutes = Math.floor((ms - (hour * 3600000)) / 60000);
  hour = fillZero(hour);
  minutes = fillZero(minutes);
  return `${hour}:${minutes}`;
}

function calculationDuration(startTime, endTime) {
  let lengthTime = '';
  const msStartTime = `${startTime.year}-${startTime.month}-${startTime.day} ${startTime.hour}:${startTime.minute}`;
  const msEndTime = `${endTime.year}-${endTime.month}-${endTime.day} ${endTime.hour}:${endTime.minute}`;
  const tmpLengthTime = Date.parse(msEndTime) - Date.parse(msStartTime);
  if (!Number.isNaN(tmpLengthTime)) {
    if (tmpLengthTime >= 0) {
      lengthTime = ms2hour(Date.parse(msEndTime) - Date.parse(msStartTime));
    } else {
      lengthTime = '時空が歪んでいます';
    }
  }
  return lengthTime;
}

class MeetingTimeModel {
  constructor() {
    this.startTime = {
      year: '????', month: '??', day: '??', week: '?', hour: '??', minute: '??',
    };
    this.endTime = {
      year: '????', month: '??', day: '??', week: '?', hour: '??', minute: '??',
    };
  }
  updateStartTime(obj) {
    this.startTime = obj;
  }
  updateEndTime(str) {
    this.endTime = str;
  }
  equals(other) {
    return isEqual(this, other);
  }
  serialize() {
    return JSON.stringify(this, null, 2);
  }
  static deserialize(str) {
    try {
      const obj = JSON.parse(str);
      const model = new MeetingTimeModel();
      model.startTime = obj.startTime;
      model.endTime = obj.endTime;
      return model;
    } catch (ex) {
      return new MeetingTimeModel();
    }
  }
}

export default class MeetingTimeApplication extends React.Component {
  constructor(props) {
    super();
    this.handleUpdateStartTime = this.handleUpdateStartTime.bind(this);
    this.handleUpdateEndTime = this.handleUpdateEndTime.bind(this);
    const setTime = MeetingTimeModel.deserialize(props.data);
    this.state = { time: setTime };
  }
  componentWillReceiveProps(newProps) {
    if (this.props.data !== newProps.data) {
      const setTime = MeetingTimeModel.deserialize(newProps.data);
      this.setState({ time: setTime });
    }
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.time.equals(nextState.time);
  }
  handleUpdateStartTime() {
    const value = getNowTime();
    this.state.time.updateStartTime(value);
    this.props.onEdit(this.state.time.serialize(), this.props.appContext);
  }
  handleUpdateEndTime() {
    const value = getNowTime();
    this.state.time.updateEndTime(value);
    this.props.onEdit(this.state.time.serialize(), this.props.appContext);
  }
  render() {
    const duration = calculationDuration(this.state.time.startTime, this.state.time.endTime);
    return (
      <div>
        Start at {this.state.time.startTime.year}/{this.state.time.startTime.month}/{this.state.time.startTime.day} ({this.state.time.startTime.week}) {this.state.time.startTime.hour}:{this.state.time.startTime.minute}&nbsp;
        <input type="button" value="Refresh Start" onClick={this.handleUpdateStartTime} />
        <br />
        End at {this.state.time.endTime.year}/{this.state.time.endTime.month}/{this.state.time.endTime.day} ({this.state.time.endTime.week}) {this.state.time.endTime.hour}:{this.state.time.endTime.minute}&nbsp;
        <input type="button" value="Refresh End" onClick={this.handleUpdateEndTime} />
        <br />
        Duration of a meeting: {duration}
      </div>);
  }
}

MeetingTimeApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
