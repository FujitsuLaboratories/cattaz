import React from 'react';

class VoteModel {
  constructor() {
    this.candidates = {};
  }
  addCandidates(name) {
    if (name in this.candidates) {
      return false;
    }
    this.candidates[name] = 1;
    return true;
  }
  addVote(name) {
    this.candidates[name] = this.candidates[name] + 1;
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
    this.handleAddCandidates = this.handleAddCandidates.bind(this);
    this.handleAddVote = this.handleAddVote.bind(this);
    this.state = { vote: VoteModel.deserialize(props.data), errorMessage: '' };
  }
  componentWillReceiveProps(newProps) {
    const vote = VoteModel.deserialize(newProps.data);
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
  }
  render() {
    return (<div style={{ marginBottom: '50px' }}>
      <input ref={(input) => { this.inputCandidates = input; }} type="text" placeholder="Add Candidates" />
      <input type="button" value="Add Candidates" onClick={this.handleAddCandidates} />
      <div style={{ color: '#D8000C' }}>{this.state.errorMessage}</div>
      <ul>
        {Object.keys(this.state.vote.candidates).map(s => (<li key={s}>{s}: {this.state.vote.candidates[s]} <input data-index={s} type="button" value="Vote" onClick={this.handleAddVote} /></li>))}
      </ul>
    </div>
    );
  }
}

VoteApplication.propTypes = {
  data: React.PropTypes.string.isRequired,
  onEdit: React.PropTypes.func.isRequired,
  appContext: React.PropTypes.shape({}).isRequired,
};
