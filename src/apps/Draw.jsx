import React from 'react';
import PropTypes from 'prop-types';

class DrawModel {
  constructor() {
    this.candidates = [];
    this.elected = '';
  }
  addCandidates(name) {
    this.candidates.push(name);
  }
  addElected(name) {
    this.elected = name;
  }
  serialize() {
    return JSON.stringify(this, null, 2);
  }
  static deserialize(str) {
    try {
      const obj = JSON.parse(str);
      const model = new DrawModel();
      model.candidates = obj.candidates;
      model.elected = obj.elected;
      return model;
    } catch (ex) {
      return new DrawModel();
    }
  }
}

export default class DrawApplication extends React.Component {
  constructor(props) {
    super();
    this.handleAddCandidates = this.handleAddCandidates.bind(this);
    this.handleStartStop = this.handleStartStop.bind(this);
    this.drawRun = this.drawRun.bind(this);
    const tmpDrawModel = DrawModel.deserialize(props.data);
    this.state = { draw: tmpDrawModel, start: false, elected: tmpDrawModel.elected };
  }
  componentWillReceiveProps(newProps) {
    const tmpDraw = DrawModel.deserialize(newProps.data);
    this.setState({ draw: tmpDraw, elected: tmpDraw.elected });
  }
  shouldComponentUpdate(/* newProps, nextState */) {
    // TODO
    return true;
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }
  handleAddCandidates() {
    const { value } = this.inputCandidates;
    if (!value) return;
    this.state.draw.addCandidates(value);
    this.props.onEdit(this.state.draw.serialize(), this.props.appContext);
  }
  drawRun() {
    this.setState({ elected: this.state.draw.candidates[Math.ceil(Math.random() * this.state.draw.candidates.length) - 1] });
  }
  handleStartStop() {
    if (!this.state.start) {
      this.intervalId = setInterval(this.drawRun, 85);
      this.setState({ start: true });
    } else {
      clearInterval(this.intervalId);
      this.state.draw.addElected(this.state.elected);
      this.setState({ start: false });
      this.props.onEdit(this.state.draw.serialize(), this.props.appContext);
    }
  }
  render() {
    let startStopBtnValue = 'Start';
    let bgColor = '#fbc02d';
    if (this.state.start) {
      startStopBtnValue = 'Stop';
      bgColor = '#fff';
    }
    let dispElected = this.state.elected;
    if (this.state.elected && this.state.elected.length > 10) {
      dispElected = `${this.state.elected.substr(0, 10)}...`;
    }
    return (
      <div style={{ marginBottom: '50px' }}>
        <input ref={(input) => { this.inputCandidates = input; }} type="text" placeholder="Add Candidates" />
        <input type="button" value="Add Candidates" onClick={this.handleAddCandidates} />
        <div>Candidates {JSON.stringify(this.state.draw.candidates)}</div>
        <div>Elected [{this.state.draw.elected}]</div>
        <div style={{
            border: '1px solid #000',
            backgroundColor: bgColor,
            width: '250px',
            height: '50px',
            textAlign: 'center',
            display: 'table-cell',
            verticalAlign: 'middle',
          }}
        >
          {dispElected}
        </div>
        <input type="button" value={startStopBtnValue} onClick={this.handleStartStop} />
      </div>);
  }
}

DrawApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
