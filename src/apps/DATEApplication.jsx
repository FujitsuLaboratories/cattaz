import React from 'react';

class DATEModel {
  constructor() {
    this.date = '';
  }
  updateDate(str) {
    this.date = str;
  }
  serialize() {
    return JSON.stringify(this, null, 2);
  }
  static deserialize(str) {
    try {
      const obj = JSON.parse(str);
      const model = new DATEModel();
      model.date = obj.date;
      return model;
    } catch (ex) {
      return new DATEModel();
    }
  }
}

export default class DATEApplication extends React.Component {
  constructor(props) {
    super();
    this.handleUpdateDate = this.handleUpdateDate.bind(this);
    this.state = { date: DATEModel.deserialize(props.data) };
  }
  componentWillReceiveProps(newProps) {
    const date = DATEModel.deserialize(newProps.data);
    this.setState({ date });
  }
  shouldComponentUpdate(/* newProps, nextState */) {
    // TODO
    return true;
  }
  handleUpdateDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const week = date.getDay();
    const day = date.getDate();
    const jpWeek = ['日', '月', '火', '水', '木', '金', '土'];
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const value = `${year}年${month}月${day}日（${jpWeek[week]}） ${hour}時${minutes}分 `;
    this.state.date.updateDate(value);
    this.props.onEdit(this.state.date.serialize(), this.props.appContext);
  }
  render() {
    return (<div>
      日時： {this.state.date.date}
      <input type="button" value="現在日時" onClick={this.handleUpdateDate} />
    </div>);
  }
}

DATEApplication.propTypes = {
  data: React.PropTypes.string.isRequired,
  onEdit: React.PropTypes.func.isRequired,
  appContext: React.PropTypes.shape({}).isRequired,
};
