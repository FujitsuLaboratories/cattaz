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

  clone() {
    const c = clone(this);
    c.candidates = clone(this.candidates);
    return c;
  }

  serialize() {
    return Yaml.dump(this);
  }

  static deserialize(str) {
    try {
      const obj = Yaml.load(str);
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
  constructor() {
    super();
    this.state = { start: false, electedTemp: null };
    this.refInputCandidate = React.createRef();
    this.handleAddCandidate = this.handleAddCandidate.bind(this);
    this.handleStartStop = this.handleStartStop.bind(this);
    this.drawRun = this.drawRun.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.state, nextState)) return true;
    const { data } = this.props;
    if (data === nextProps.data) return false;
    const oldModel = DrawModel.deserialize(data);
    const newModel = DrawModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  handleAddCandidate() {
    const { value } = this.refInputCandidate.current;
    if (!value) return;
    const { data, onEdit, appContext } = this.props;
    const newModel = DrawModel.deserialize(data);
    newModel.addCandidate(value);
    onEdit(newModel.serialize(), appContext);
  }

  handleStartStop() {
    const { start } = this.state;
    if (!start) {
      this.drawRun(); // Some people may stop within the interval
      this.intervalId = setInterval(this.drawRun, 85);
      this.setState({ start: true });
    } else {
      clearInterval(this.intervalId);
      const { electedTemp } = this.state;
      const { data, onEdit, appContext } = this.props;
      const newModel = DrawModel.deserialize(data);
      newModel.setElected(electedTemp);
      this.setState({
        start: false, electedTemp: null,
      });
      onEdit(newModel.serialize(), appContext);
    }
  }

  drawRun() {
    const { data } = this.props;
    const draw = DrawModel.deserialize(data);
    this.setState({ electedTemp: draw.candidates[Math.ceil(Math.random() * draw.candidates.length) - 1] });
  }

  render() {
    const { data } = this.props;
    const draw = DrawModel.deserialize(data);
    const { electedTemp, start } = this.state;
    let dispElected = electedTemp || draw.elected;
    if (dispElected && dispElected.length > 10) {
      dispElected = `${dispElected.substr(0, 10)}...`;
    }
    return (
      <div style={{ marginBottom: '50px' }}>
        <input ref={this.refInputCandidate} type="text" placeholder="Add Candidate" />
        <input type="button" value="Add Candidate" onClick={this.handleAddCandidate} />
        <div key="candidates">
          Candidates
          {' '}
          {JSON.stringify(draw.candidates)}
        </div>
        <div key="elected">
          Elected [
          {draw.elected}
          ]
        </div>
        <div
          key="display"
          style={{
            border: '1px solid #000',
            backgroundColor: start ? '#fff' : '#fbc02d',
            width: '250px',
            height: '50px',
            textAlign: 'center',
            display: 'table-cell',
            verticalAlign: 'middle',
          }}
        >
          {dispElected}
        </div>
        <input type="button" value={start ? 'Stop' : 'Start'} onClick={this.handleStartStop} />
      </div>
    );
  }
}

DrawApplication.Model = DrawModel;

DrawApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
