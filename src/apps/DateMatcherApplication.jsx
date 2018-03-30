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
  static getDerivedStateFromProps(nextProps) {
    const model = DateMatcherModel.deserialize(nextProps.data);
    return { model };
  }
  constructor() {
    super();
    this.refInputCandidates = React.createRef();
    this.refInputNewAttendee = React.createRef();
    this.handleSetCandidates = this.handleSetCandidates.bind(this);
    this.handleAddAttendee = this.handleAddAttendee.bind(this);
    this.handleStartEdit = this.handleStartEdit.bind(this);
    this.handleEndEdit = this.handleEndEdit.bind(this);
    this.handleRemoveAttendee = this.handleRemoveAttendee.bind(this);
    this.handleSetAnswer = this.handleSetAnswer.bind(this);
  }
  shouldComponentUpdate(newProps, nextState) {
    return !this.state.model.equals(nextState.model) || this.state.editing !== nextState.editing;
  }
  handleSetCandidates() {
    const { value } = this.refInputCandidates.current;
    if (!value) return;
    const candidates = uniq(value.split('\n').map(s => s.trim()).filter(s => s));
    if (candidates.length === 0) return;
    const model = new DateMatcherModel();
    model.setCandidates(candidates);
    this.setState({ model });
    this.props.onEdit(model.serialize(), this.props.appContext);
  }
  handleAddAttendee() {
    const { value } = this.refInputNewAttendee.current;
    if (!value) return;
    const attendeeName = value.trim();
    if (!attendeeName) return;
    this.state.model.addAttendee(attendeeName);
    this.props.onEdit(this.state.model.serialize(), this.props.appContext);
    this.setState({ editing: attendeeName });
  }
  handleSetAnswer(ev) {
    const input = ev.target;
    if (!input) return;
    const attendee = input.getAttribute('data-attendee');
    const candidate = input.getAttribute('data-candidate');
    const answer = input.value;
    this.state.model.setAnswer(attendee, candidate, answer);
    this.forceUpdate();
    this.props.onEdit(this.state.model.serialize(), this.props.appContext);
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
    this.state.model.removeAttendee(attendeeName);
    this.props.onEdit(this.state.model.serialize(), this.props.appContext);
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
  renderAnswers() {
    const header = (
      <tr>
        <th />
        {this.state.model.candidates.map(s => <th style={cellStyle}>{s}</th>)}
      </tr>);
    const attendees = Object.keys(this.state.model.attendees).map((attendeeName) => {
      const ans = this.state.model.attendees[attendeeName] || {};
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
          {this.state.model.candidates.map(s => (
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
    if (this.state.model.candidates.length === 0) {
      return this.renderAdmin();
    }
    return this.renderAnswers();
  }
}

DateMatcherApplication.Model = DateMatcherModel;

DateMatcherApplication.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};
