import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

class VoteModel {
  constructor() {
    this.candidates = {};
  }
  addCandidate(name) {
    if (name in this.candidates) {
      return false;
    }
    this.candidates[name] = 0;
    return true;
  }
  addVote(name) {
    this.candidates[name] = this.candidates[name] + 1;
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
      const model = new VoteModel();
      model.candidates = obj.candidates;
      return model;
    } catch (ex) {
      return new VoteModel();
    }
  }
}

export default class VoteApplication extends React.Component {
  constructor(props) {
    super();
    this.handleAddCandidate = this.handleAddCandidate.bind(this);
    this.handleAddVote = this.handleAddVote.bind(this);
    this.state = { vote: VoteModel.deserialize(props.data), errorMessage: '' };
  }
  componentWillReceiveProps(newProps) {
    if (this.props.data !== newProps.data) {
      const vote = VoteModel.deserialize(newProps.data);
      this.setState({ vote });
    }
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.vote.equals(nextState.vote) || this.state.errorMessage !== nextState.errorMessage;
  }
  handleAddCandidate() {
    const { value } = this.inputCandidates;
    if (!value) return;
    if (this.state.vote.addCandidate(value)) {
      this.forceUpdate();
      this.setState({ errorMessage: '' });
      this.props.onEdit(this.state.vote.serialize(), this.props.appContext);
    } else {
      this.setState({ errorMessage: 'Duplicate Candidates' });
    }
  }
  handleAddVote(event) {
    const value = event.target.getAttribute('data-index');
    this.state.vote.addVote(value);
    this.forceUpdate();
    this.props.onEdit(this.state.vote.serialize(), this.props.appContext);
  }
  render() {
    return (
      <div style={{ marginBottom: '50px' }}>
        <input ref={(input) => { this.inputCandidates = input; }} type="text" placeholder="Add Candidates" />
        <input type="button" value="Add Candidate" onClick={this.handleAddCandidate} />
        <div style={{ color: '#D8000C' }}>{this.state.errorMessage}</div>
        <ul>
          {Object.keys(this.state.vote.candidates).map(s => (<li key={s}>{s}: {this.state.vote.candidates[s]} <input data-index={s} type="button" value="Vote" onClick={this.handleAddVote} /></li>))}
        </ul>
      </div>);
  }
}

VoteApplication.Model = VoteModel;

VoteApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
