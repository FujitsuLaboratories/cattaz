import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';
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
    return Yaml.dump(this);
  }

  static deserialize(str) {
    try {
      const obj = Yaml.load(str);
      const model = new MeetingTimeModel();
      if (obj.startTime) model.startTime = obj.startTime;
      if (obj.endTime) model.endTime = obj.endTime;
      return model;
    } catch (ex) {
      return new MeetingTimeModel();
    }
  }
}

export default class MeetingTimeApplication extends React.Component {
  constructor() {
    super();
    this.handleUpdateStartTime = this.handleUpdateStartTime.bind(this);
    this.handleUpdateEndTime = this.handleUpdateEndTime.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    if (data === nextProps.data) return false;
    const oldModel = MeetingTimeModel.deserialize(data);
    const newModel = MeetingTimeModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
  }

  handleUpdateStartTime() {
    const value = getNowTime();
    const { data, onEdit, appContext } = this.props;
    const model = MeetingTimeModel.deserialize(data);
    model.updateStartTime(value);
    onEdit(model.serialize(), appContext);
  }

  handleUpdateEndTime() {
    const value = getNowTime();
    const { data, onEdit, appContext } = this.props;
    const model = MeetingTimeModel.deserialize(data);
    model.updateEndTime(value);
    onEdit(model.serialize(), appContext);
  }

  render() {
    const { data } = this.props;
    const time = MeetingTimeModel.deserialize(data);
    const duration = calculationDuration(time.startTime, time.endTime);
    const convertDateToString = (date) => `${date.year}/${date.month}/${date.day} (${date.week}) ${date.hour}:${date.minute}`;
    return (
      <div>
        <div key="start">
          {`Start at ${convertDateToString(time.startTime)}`}
          &nbsp;
          <input type="button" value="Refresh Start" onClick={this.handleUpdateStartTime} />
        </div>
        <div key="end">
          {`End at ${convertDateToString(time.endTime)}`}
          &nbsp;
          <input type="button" value="Refresh End" onClick={this.handleUpdateEndTime} />
        </div>
        <div key="duration">
          {`Duration of a meeting: ${duration}`}
        </div>
      </div>
    );
  }
}

MeetingTimeApplication.Model = MeetingTimeModel;

MeetingTimeApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
