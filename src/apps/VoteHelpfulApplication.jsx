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
  static getDerivedStateFromProps(nextProps) {
    const vote = VoteHelpfulModel.deserialize(nextProps.data);
    return { vote };
  }
  constructor() {
    super();
    this.state = { vote: new VoteHelpfulModel() };
    this.handleAddVote = this.handleAddVote.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.vote.equals(nextState.vote) || this.state.voted !== nextState.voted;
  }
  handleAddVote(event) {
    const value = event.target.getAttribute('data-index');
    this.state.vote.addVote(value);
    this.props.onEdit(this.state.vote.serialize(), this.props.appContext);
    this.setState({ voted: true });
  }
  render() {
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
    const ny = this.state.vote.candidates.Yes;
    const nn = this.state.vote.candidates.No;
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
          this.state.vote.candidates.Yes + this.state.vote.candidates.No > 0
            ? barElems
            : null
        }
      </div>);
  }
}

VoteHelpfulApplication.Model = VoteHelpfulModel;

VoteHelpfulApplication.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
