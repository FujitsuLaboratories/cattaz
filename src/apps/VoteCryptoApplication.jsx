import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';
import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';

class VoteCryptoModel {
  constructor() {
    this.candidates = {};
    this.opened = false;
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
  openVoted() {
    this.opened = true;
  }
  equals(other) {
    return isEqual(this, other);
  }
  serialize() {
    function encrypt(plaintext) {
      // plaintext to base64
      // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings
      return window.btoa(unescape(encodeURIComponent(plaintext)));
    }
    const obj = { ciphertext: encrypt(JSON.stringify(this.candidates)), opened: this.opened };
    return Yaml.safeDump(obj);
  }
  static deserialize(str) {
    function decrypt(ciphertext) {
      // base64 to plaintext
      return decodeURIComponent(escape(window.atob(ciphertext)));
    }
    try {
      const obj = Yaml.safeLoad(str);
      const model = new VoteCryptoModel();
      if (obj.ciphertext) model.candidates = JSON.parse(decrypt(obj.ciphertext));
      model.opened = !!obj.opened;
      return model;
    } catch (ex) {
      return new VoteCryptoModel();
    }
  }
}

export default class VoteCryptoApplication extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    const vote = VoteCryptoModel.deserialize(nextProps.data);
    return { vote };
  }
  constructor() {
    super();
    this.refInputCandidate = React.createRef();
    this.handleAddCandidate = this.handleAddCandidate.bind(this);
    this.handleAddVote = this.handleAddVote.bind(this);
    this.handleVotingResult = this.handleVotingResult.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.vote.equals(nextState.vote) || this.state.voteMessage !== nextState.voteMessage || this.state.errorMessage !== nextState.errorMessage;
  }
  handleAddCandidate() {
    const { value } = this.refInputCandidate.current;
    if (!value) return;
    const newModel = clone(this.state.vote);
    if (newModel.addCandidate(value)) {
      this.setState({ vote: newModel, errorMessage: '' });
      this.props.onEdit(this.state.vote.serialize(), this.props.appContext);
    } else {
      this.setState({ errorMessage: 'Duplicate Candidate' });
    }
  }
  handleAddVote(event) {
    const value = event.target.getAttribute('data-index');
    const newModel = clone(this.state.vote);
    newModel.addVote(value);
    this.setState({ vote: newModel, voteMessage: 'Voted' });
    this.props.onEdit(this.state.vote.serialize(), this.props.appContext);
    const self = this;
    setTimeout(() => {
      self.setState({ voteMessage: '' });
    }, 1000);
  }
  handleVotingResult() {
    const newModel = clone(this.state.vote);
    newModel.openVoted();
    this.setState({ vote: newModel });
    this.props.onEdit(this.state.vote.serialize(), this.props.appContext);
  }
  render() {
    let votingResult = '';
    if (this.state.vote.opened) {
      votingResult = Object.keys(this.state.vote.candidates).map(s => (<li key={s}>{s}: {this.state.vote.candidates[s]} <input data-index={s} type="button" value="Vote" onClick={this.handleAddVote} /></li>));
    } else {
      votingResult = Object.keys(this.state.vote.candidates).map(s => (<li key={s}>{s} <input data-index={s} type="button" value="Vote" onClick={this.handleAddVote} /></li>));
    }
    return (
      <div style={{ marginBottom: '50px' }}>
        <input ref={this.refInputCandidate} type="text" placeholder="Name of candidate" />
        <input type="button" value="Add Candidate" onClick={this.handleAddCandidate} />
        <div style={{ color: '#00529B' }}>{this.state.voteMessage}</div>
        <div style={{ color: '#D8000C' }}>{this.state.errorMessage}</div>
        <ul>
          {votingResult}
        </ul>
        { this.state.vote.opened ?
          null : <input key="result" type="button" value="Result" onClick={this.handleVotingResult} />
        }
      </div>);
  }
}

VoteCryptoApplication.Model = VoteCryptoModel;

VoteCryptoApplication.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
