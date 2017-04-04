import React from 'react';

class VoteCryptoModel {
  constructor() {
    this.candidates = {};
    this.openResult = { opened: false };
  }
  addCandidates(name) {
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
    this.openResult.opened = true;
  }
  serialize() {
    function encrypt(plaintext) {
      // plaintext to base64
      // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings
      return window.btoa(unescape(encodeURIComponent(plaintext)));
    }
    const obj = { ciphertext: encrypt(JSON.stringify(this.candidates)), openResult: this.openResult };
    return JSON.stringify(obj, null, 2);
  }
  static deserialize(str) {
    function decrypt(ciphertext) {
      // base64 to plaintext
      return decodeURIComponent(escape(window.atob(ciphertext)));
    }
    try {
      const obj = JSON.parse(str);
      const model = new VoteCryptoModel();
      model.candidates = JSON.parse(decrypt(obj.ciphertext));
      model.openResult = obj.openResult;
      return model;
    } catch (ex) {
      return new VoteCryptoModel();
    }
  }
}

export default class VoteCryptoApplication extends React.Component {
  constructor(props) {
    super();
    this.handleAddCandidates = this.handleAddCandidates.bind(this);
    this.handleAddVote = this.handleAddVote.bind(this);
    this.handleVotingResult = this.handleVotingResult.bind(this);
    this.state = { vote: VoteCryptoModel.deserialize(props.data), voteMessage: '', errorMessage: '' };
  }
  componentWillReceiveProps(newProps) {
    const vote = VoteCryptoModel.deserialize(newProps.data);
    this.setState({ vote });
  }
  shouldComponentUpdate(/* newProps, nextState */) {
    // TODO
    return true;
  }
  handleAddCandidates() {
    const value = this.inputCandidates.value;
    if (!value) return;
    if (this.state.vote.addCandidates(value)) {
      this.setState({ errorMessage: '' });
      this.props.onEdit(this.state.vote.serialize(), this.props.appContext);
    } else {
      this.setState({ errorMessage: 'Duplicate Candidates' });
    }
  }
  handleAddVote(event) {
    const value = event.target.getAttribute('data-index');
    this.state.vote.addVote(value);
    this.props.onEdit(this.state.vote.serialize(), this.props.appContext);
    this.setState({ voteMessage: 'Voted' });
    const self = this;
    setTimeout(() => {
      self.setState({ voteMessage: '' });
    }, 1000);
  }
  handleVotingResult() {
    this.state.vote.openVoted();
    this.props.onEdit(this.state.vote.serialize(), this.props.appContext);
  }
  render() {
    let votingResult = '';
    if (this.state.vote.openResult.opened) {
      votingResult = Object.keys(this.state.vote.candidates).map(s => (<li key={s}>{s}: {this.state.vote.candidates[s]} <input data-index={s} type="button" value="Vote" onClick={this.handleAddVote} /></li>));
    } else {
      votingResult = Object.keys(this.state.vote.candidates).map(s => (<li key={s}>{s} <input data-index={s} type="button" value="Vote" onClick={this.handleAddVote} /></li>));
    }
    return (<div style={{ marginBottom: '50px' }}>
      <input ref={(input) => { this.inputCandidates = input; }} type="text" placeholder="Add Candidates" />
      <input type="button" value="Add Candidates" onClick={this.handleAddCandidates} />
      <div style={{ color: '#00529B' }}>{this.state.voteMessage}</div>
      <div style={{ color: '#D8000C' }}>{this.state.errorMessage}</div>
      <ul>
        {votingResult}
      </ul>
      <input type="button" value="Result" onClick={this.handleVotingResult} />
    </div>
    );
  }
}

VoteCryptoApplication.propTypes = {
  data: React.PropTypes.string.isRequired,
  onEdit: React.PropTypes.func.isRequired,
  appContext: React.PropTypes.shape({}).isRequired,
};
