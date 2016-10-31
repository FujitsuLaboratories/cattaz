import React from 'react';

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
  const jpWeek = ['日', '月', '火', '水', '木', '金', '土'];
  nowTime.week = jpWeek[week];
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
  if (!isNaN(tmpLengthTime)) {
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
    this.startTime = { year: '????', month: '??', day: '??', week: '?', hour: '??', minute: '??' };
    this.endTime = { year: '????', month: '??', day: '??', week: '?', hour: '??', minute: '??' };
  }
  updateStartTime(obj) {
    this.startTime = obj;
  }
  updateEndTime(str) {
    this.endTime = str;
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

export default class DATEApplication extends React.Component {
  constructor(props) {
    super();
    this.handleUpdateStartTime = this.handleUpdateStartTime.bind(this);
    this.handleUpdateEndTime = this.handleUpdateEndTime.bind(this);
    const setTime = MeetingTimeModel.deserialize(props.data);
    this.state = { time: setTime, lengthTime: calculationDuration(setTime.startTime, setTime.endTime) };
  }
  componentWillReceiveProps(newProps) {
    const setTime = MeetingTimeModel.deserialize(newProps.data);
    this.setState({ time: setTime, lengthTime: calculationDuration(setTime.startTime, setTime.endTime) });
  }
  shouldComponentUpdate(/* newProps, nextState */) {
    // TODO
    return true;
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
    return (<div>
      開始日時：&nbsp;{this.state.time.startTime.year}年{this.state.time.startTime.month}月{this.state.time.startTime.day}日（{this.state.time.startTime.week}）&nbsp;{this.state.time.startTime.hour}時{this.state.time.startTime.minute}分&nbsp;
      <input type="button" value="開始日時更新" onClick={this.handleUpdateStartTime} />
      <br />
      終了日時：&nbsp;{this.state.time.endTime.year}年{this.state.time.endTime.month}月{this.state.time.endTime.day}日（{this.state.time.endTime.week}）&nbsp;{this.state.time.endTime.hour}時{this.state.time.endTime.minute}分&nbsp;
      <input type="button" value="終了日時更新" onClick={this.handleUpdateEndTime} />
      <br />
      会議時間：&nbsp;{this.state.lengthTime}
    </div>);
  }
}

DATEApplication.propTypes = {
  data: React.PropTypes.string,
  onEdit: React.PropTypes.func,
  appContext: React.PropTypes.shape({}),
};
