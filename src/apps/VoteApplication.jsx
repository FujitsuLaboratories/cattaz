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
    this.candidates[name] += 1;
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
      if (obj.candidates) model.candidates = obj.candidates;
      return model;
    } catch (ex) {
      return new VoteModel();
    }
  }
}

export default class VoteApplication extends React.Component {
  constructor() {
    super();
    this.state = { errorMessage: '' };
    this.refInputCandidate = React.createRef();
    this.handleAddCandidate = this.handleAddCandidate.bind(this);
    this.handleAddVote = this.handleAddVote.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { data } = this.props;
    if (!isEqual(this.state, nextState)) return true;
    if (data === nextProps.data) return false;
    const oldModel = VoteModel.deserialize(data);
    const newModel = VoteModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
  }

  handleAddCandidate() {
    const { value } = this.refInputCandidate.current;
    if (!value) return;
    const { data, onEdit, appContext } = this.props;
    const model = VoteModel.deserialize(data);
    if (model.addCandidate(value)) {
      this.setState({ errorMessage: '' });
      onEdit(model.serialize(), appContext);
    } else {
      this.setState({ errorMessage: 'Duplicate Candidates' });
    }
  }

  handleAddVote(event) {
    const value = event.target.getAttribute('data-index');
    const { data, onEdit, appContext } = this.props;
    const model = VoteModel.deserialize(data);
    model.addVote(value);
    onEdit(model.serialize(), appContext);
  }

  render() {
    const { data } = this.props;
    const model = VoteModel.deserialize(data);
    const { errorMessage } = this.state;
    return (
      <div style={{ marginBottom: '50px' }}>
        <input ref={this.refInputCandidate} type="text" placeholder="Name of candidate" />
        <input type="button" value="Add Candidate" onClick={this.handleAddCandidate} />
        <div style={{ color: '#D8000C' }}>
          {errorMessage}
        </div>
        <ul>
          {Object.keys(model.candidates).map((s) => (
            <li key={s}>
              {`${s}: ${model.candidates[s]} `}
              <input data-index={s} type="button" value="Vote" onClick={this.handleAddVote} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

VoteApplication.Model = VoteModel;

VoteApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
