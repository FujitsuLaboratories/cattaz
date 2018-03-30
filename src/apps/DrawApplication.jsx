import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';
import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';

class DrawModel {
  constructor() {
    this.candidates = [];
    this.elected = '';
  }
  addCandidate(name) {
    this.candidates.push(name);
  }
  setElected(name) {
    this.elected = name;
  }
  equals(other) {
    return isEqual(this, other);
  }
  serialize() {
    return Yaml.safeDump(this);
  }
  static deserialize(str) {
    try {
      const obj = Yaml.safeLoad(str);
      const model = new DrawModel();
      if (obj.candidates) model.candidates = obj.candidates;
      if (obj.elected) model.elected = obj.elected;
      return model;
    } catch (ex) {
      return new DrawModel();
    }
  }
}

export default class DrawApplication extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    const draw = DrawModel.deserialize(nextProps.data);
    return { draw, elected: draw.elected };
  }
  constructor() {
    super();
    this.refInputCandidate = React.createRef();
    this.handleAddCandidate = this.handleAddCandidate.bind(this);
    this.handleStartStop = this.handleStartStop.bind(this);
    this.drawRun = this.drawRun.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.draw.equals(nextState.draw) || this.state.elected !== nextState.elected || this.state.start !== nextState.start;
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }
  handleAddCandidate() {
    const { value } = this.refInputCandidate.current;
    if (!value) return;
    const newModel = clone(this.state.draw);
    newModel.addCandidate(value);
    this.setState({ draw: newModel });
    this.forceUpdate();
    this.props.onEdit(this.state.draw.serialize(), this.props.appContext);
  }
  drawRun() {
    this.setState({ elected: this.state.draw.candidates[Math.ceil(Math.random() * this.state.draw.candidates.length) - 1] });
  }
  handleStartStop() {
    if (!this.state.start) {
      this.drawRun(); // Some people may stop within the interval
      this.intervalId = setInterval(this.drawRun, 85);
      this.setState({ start: true });
    } else {
      clearInterval(this.intervalId);
      this.state.draw.setElected(this.state.elected);
      this.setState({ start: false });
      this.props.onEdit(this.state.draw.serialize(), this.props.appContext);
    }
  }
  render() {
    let dispElected = this.state.elected;
    if (this.state.elected && this.state.elected.length > 10) {
      dispElected = `${this.state.elected.substr(0, 10)}...`;
    }
    return (
      <div style={{ marginBottom: '50px' }}>
        <input ref={this.refInputCandidate} type="text" placeholder="Add Candidate" />
        <input type="button" value="Add Candidate" onClick={this.handleAddCandidate} />
        <div key="candidates">Candidates {JSON.stringify(this.state.draw.candidates)}</div>
        <div key="elected">Elected [{this.state.draw.elected}]</div>
        <div
          key="display"
          style={{
            border: '1px solid #000',
            backgroundColor: this.state.start ? '#fff' : '#fbc02d',
            width: '250px',
            height: '50px',
            textAlign: 'center',
            display: 'table-cell',
            verticalAlign: 'middle',
          }}
        >
          {dispElected}
        </div>
        <input type="button" value={this.state.start ? 'Stop' : 'Start'} onClick={this.handleStartStop} />
      </div>);
  }
}

DrawApplication.Model = DrawModel;

DrawApplication.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
