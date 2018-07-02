import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';

import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';

class DateMatcherModel {
  constructor() {
    this.candidates = [];
    this.attendees = {};
  }
  setCandidates(candidates) {
    this.candidates = candidates;
  }
  addAttendee(name) {
    if (!this.attendees[name]) {
      this.attendees[name] = {};
    }
  }
  removeAttendee(name) {
    delete this.attendees[name];
  }
  setAnswer(name, candidate, value) {
    this.attendees[name][candidate] = value;
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
      const model = new DateMatcherModel();
      if (obj.candidates) model.candidates = obj.candidates;
      if (obj.attendees) model.attendees = obj.attendees;
      return model;
    } catch (ex) {
      return new DateMatcherModel();
    }
  }
}

const cellStyle = {
  border: '1px solid silver',
  verticalAlign: 'top',
};

export default class DateMatcherApplication extends React.Component {
  constructor() {
    super();
    this.state = { editing: null };
    this.refInputCandidates = React.createRef();
    this.refInputNewAttendee = React.createRef();
    this.handleSetCandidates = this.handleSetCandidates.bind(this);
    this.handleAddAttendee = this.handleAddAttendee.bind(this);
    this.handleStartEdit = this.handleStartEdit.bind(this);
    this.handleEndEdit = this.handleEndEdit.bind(this);
    this.handleRemoveAttendee = this.handleRemoveAttendee.bind(this);
    this.handleSetAnswer = this.handleSetAnswer.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.state, nextState)) return true;
    if (this.props.data === nextProps.data) return false;
    const oldModel = DateMatcherModel.deserialize(this.props.data);
    const newModel = DateMatcherModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
  }
  handleSetCandidates() {
    const { value } = this.refInputCandidates.current;
    if (!value) return;
    const candidates = uniq(value.split('\n').map(s => s.trim()).filter(s => s));
    if (candidates.length === 0) return;
    const model = new DateMatcherModel();
    model.setCandidates(candidates);
    this.props.onEdit(model.serialize(), this.props.appContext);
  }
  handleAddAttendee() {
    const { value } = this.refInputNewAttendee.current;
    if (!value) return;
    const attendeeName = value.trim();
    if (!attendeeName) return;
    const model = DateMatcherModel.deserialize(this.props.data);
    model.addAttendee(attendeeName);
    this.props.onEdit(model.serialize(), this.props.appContext);
    this.setState({ editing: attendeeName });
  }
  handleSetAnswer(ev) {
    const input = ev.target;
    if (!input) return;
    const attendee = input.getAttribute('data-attendee');
    const candidate = input.getAttribute('data-candidate');
    const answer = input.value;
    const model = DateMatcherModel.deserialize(this.props.data);
    model.setAnswer(attendee, candidate, answer);
    this.props.onEdit(model.serialize(), this.props.appContext);
  }
  handleStartEdit(ev) {
    const targetElement = ev.target;
    if (!targetElement) return;
    const attendeeName = targetElement.getAttribute('data-attendee');
    this.setState({ editing: attendeeName });
  }
  handleEndEdit() {
    this.setState({ editing: null });
  }
  handleRemoveAttendee(ev) {
    const targetElement = ev.target;
    if (!targetElement) return;
    const attendeeName = targetElement.getAttribute('data-attendee');
    const model = DateMatcherModel.deserialize(this.props.data);
    model.removeAttendee(attendeeName);
    this.props.onEdit(model.serialize(), this.props.appContext);
    this.setState({ editing: null });
  }
  renderAdmin() {
    return (
      <div>
        <textarea ref={this.refInputCandidates} />
        <p>Fill meeting time candidates for each line.</p>
        <button onClick={this.handleSetCandidates}>Start date matching</button>
      </div>);
  }
  renderAnswers(model) {
    const header = (
      <tr>
        <th />
        {model.candidates.map(s => <th style={cellStyle}>{s}</th>)}
      </tr>);
    const attendees = Object.keys(model.attendees).map((attendeeName) => {
      const ans = model.attendees[attendeeName] || {};
      const isEditingRow = attendeeName === this.state.editing;
      return (
        <tr key={attendeeName}>
          <th style={cellStyle}>
            {attendeeName}
            {isEditingRow ?
              [
                <button data-attendee={attendeeName} onClick={this.handleEndEdit}>End edit</button>,
                <button data-attendee={attendeeName} onClick={this.handleRemoveAttendee}>Remove</button>,
              ] : <button data-attendee={attendeeName} onClick={this.handleStartEdit}>Edit</button>}
          </th>
          {model.candidates.map(s => (
            <td key={s} style={cellStyle}>
              {isEditingRow ?
                <input type="text" value={ans[s]} size="4" onChange={this.handleSetAnswer} data-attendee={attendeeName} data-candidate={s} />
                : ans[s]}
            </td>))}
        </tr>);
    });
    return (
      <div>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>{header}</thead>
          <tbody>{attendees}</tbody>
        </table>
        <p>
          <input ref={this.refInputNewAttendee} type="text" placeholder="attenndee name" />
          <button onClick={this.handleAddAttendee}>Add attendee</button>
        </p>
      </div>);
  }
  render() {
    const model = DateMatcherModel.deserialize(this.props.data);
    if (model.candidates.length === 0) {
      return this.renderAdmin();
    }
    return this.renderAnswers(model);
  }
}

DateMatcherApplication.Model = DateMatcherModel;

DateMatcherApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
