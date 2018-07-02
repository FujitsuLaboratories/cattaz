import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';
import isEqual from 'lodash/isEqual';

class VoteHelpfulModel {
  constructor() {
    this.candidates = {
      Yes: 0,
      No: 0,
    };
  }
  addVote(name) {
    this.candidates[name] = this.candidates[name] + 1;
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
      const model = new VoteHelpfulModel();
      if (obj.candidates) model.candidates = obj.candidates;
      return model;
    } catch (ex) {
      return new VoteHelpfulModel();
    }
  }
}

export default class VoteHelpfulApplication extends React.Component {
  constructor() {
    super();
    this.state = { voted: false };
    this.handleAddVote = this.handleAddVote.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.state, nextState)) return true;
    if (this.props.data === nextProps.data) return false;
    const oldModel = VoteHelpfulModel.deserialize(this.props.data);
    const newModel = VoteHelpfulModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
  }
  handleAddVote(event) {
    const value = event.target.getAttribute('data-index');
    const model = VoteHelpfulModel.deserialize(this.props.data);
    model.addVote(value);
    this.props.onEdit(model.serialize(), this.props.appContext);
    this.setState({ voted: true });
  }
  render() {
    const model = VoteHelpfulModel.deserialize(this.props.data);
    const colors = { No: '#da3d3d', Yes: '#218bce' };
    const styles = {
      button: {
        margin: '10px',
        fontSize: 'x-large',
        backgroundColor: 'white',
        borderWidth: '5px',
        borderStyle: 'solid',
        width: '200px',
        height: '150px',
        borderRadius: '10px',
        cursor: 'pointer',
      },
      barLabel: {
        display: 'inline-block',
        textAlign: 'center',
        width: '3em',
      },
      bar: {
        display: 'inline-block',
        textAlign: 'center',
        color: 'white',
        height: '20px',
      },
      message: {
        backgroundColor: '#eee',
      },
    };

    const buttonElems = ['Yes', 'No'].map(key => (
      <input
        type="button"
        style={Object.assign(
          {},
          styles.button,
          { borderColor: colors[key] },
        )}
        data-index={key}
        onClick={this.handleAddVote}
        value={key}
      />));

    const W = 320;
    const ny = model.candidates.Yes;
    const nn = model.candidates.No;
    const wy = ny / (ny + nn);
    const wn = nn / (ny + nn);

    const barElems = (
      <div style={{ marginTop: '10px', textAlign: 'center', width: `${(2 * 200) + (4 * 10)}px` }}>
        <span style={styles.barLabel}>{Math.round(wy * 100)}%</span>
        <span style={Object.assign({}, styles.bar, { backgroundColor: colors.Yes, width: (ny / (ny + nn)) * W })}>{ny}</span>
        <span style={Object.assign({}, styles.bar, { backgroundColor: colors.No, width: (nn / (ny + nn)) * W })}>{nn}</span>
        <span style={styles.barLabel}>{Math.round(wn * 100)}%</span>
      </div>);

    return (
      <div>
        {
          this.state.voted
            ? <p style={styles.message}>Thank you for contribution!</p>
            : buttonElems
        }
        {
          model.candidates.Yes + model.candidates.No > 0
            ? barElems
            : null
        }
      </div>);
  }
}

VoteHelpfulApplication.Model = VoteHelpfulModel;

VoteHelpfulApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
