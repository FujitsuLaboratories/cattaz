import React from 'react';
import CryptoJS from 'crypto-js';

const SECRETKEY = '4c8a8e23fc360219950af8becbeff58cfe7a41553e662f05ca138f71ee1a30cb73d7ee49f54e48dd17325f5f0d6a69e420b756a99cc533b4fb3630f077a7498d';

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
    const encrypt = { ciphertext: CryptoJS.AES.encrypt(JSON.stringify(this.candidates), SECRETKEY).toString(), openResult: this.openResult };
    return JSON.stringify(encrypt, null, 2);
  }
  static deserialize(str) {
    try {
      const obj = JSON.parse(str);
      const model = new VoteCryptoModel();
      model.candidates = JSON.parse(CryptoJS.AES.decrypt(obj.ciphertext, SECRETKEY).toString(CryptoJS.enc.Utf8));
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
