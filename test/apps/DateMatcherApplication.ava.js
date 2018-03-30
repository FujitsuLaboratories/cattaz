import React from 'react';
import test from 'ava';

import { mount } from 'enzyme';

import DateMatcherApplication from '../../src/apps/DateMatcherApplication';

function setCandidates(wrapper, candidates) {
  const textarea = wrapper.find('textarea').first();
  const button = wrapper.find('button').first();
  textarea.instance().value = candidates.join('\n');
  button.simulate('click');
}

function hasTable(wrapper) {
  return wrapper.find('table').exists();
}

function addAttendee(wrapper, attendee) {
  const input = wrapper.find('p input').first();
  const button = wrapper.find('p button').first();
  input.instance().value = attendee;
  button.simulate('click');
}

function startEdit(wrapper, attendee) {
  const tr = wrapper.find('table tr').filterWhere(el => el.key() === attendee).first();
  tr.find('button').filterWhere(b => b.text() === 'Edit').simulate('click');
}
function inputAnswers(wrapper, attendee, answers) {
  const tr = wrapper.find('table tr').filterWhere(el => el.key() === attendee).first();
  const inputs = tr.find('input');
  for (let i = 0; i < answers.length; i += 1) {
    const input = inputs.at(i);
    input.instance().value = answers[i];
    input.simulate('change');
  }
}
function removeAttendee(wrapper, attendee) {
  const tr = wrapper.find('table tr').filterWhere(el => el.key() === attendee).first();
  tr.find('button').filterWhere(b => b.text() === 'Remove').simulate('click');
}
function endEdit(wrapper, attendee) {
  const tr = wrapper.find('table tr').filterWhere(el => el.key() === attendee).first();
  tr.find('button').filterWhere(b => b.text() === 'End edit').simulate('click');
}

/** @test {DateMatcherApplication} */
test('DateMatcherApplication should render initial state if no data is given', t => {
  const wrapper = mount(<DateMatcherApplication data="" onEdit={() => {}} appContext={{}} />);
  t.false(hasTable(wrapper));
});

/** @test {DateMatcherApplication#handleSetCandidates} */
test('DateMatcherApplication should render empty table after setting candidates', t => {
  const wrapper = mount(<DateMatcherApplication data="" onEdit={() => {}} appContext={{}} />);
  setCandidates(wrapper, []);
  t.false(hasTable(wrapper), 'ignore empty');
  setCandidates(wrapper, [' ', '']);
  t.false(hasTable(wrapper), 'completely ignore');
  setCandidates(wrapper, ['c1', '', 'c2', 'c1', ' c1 ']);
  t.true(hasTable(wrapper));
  t.deepEqual(['c1', 'c2'], wrapper.state().model.candidates, 'should ignore empty and duplicated');
});

/** @test {DateMatcherApplication#handleAddAttendee} */
test('DateMatcherApplication should add an attendee without answers', t => {
  const wrapper = mount(<DateMatcherApplication data="" onEdit={() => {}} appContext={{}} />);
  setCandidates(wrapper, ['c1', 'c2']);
  t.deepEqual({}, wrapper.state().model.attendees);
  addAttendee(wrapper, '');
  t.deepEqual({}, wrapper.state().model.attendees);
  addAttendee(wrapper, ' ');
  t.deepEqual({}, wrapper.state().model.attendees);
  addAttendee(wrapper, 'a1');
  t.deepEqual({ a1: {} }, wrapper.state().model.attendees);
  addAttendee(wrapper, 'a2');
  t.deepEqual({ a1: {}, a2: {} }, wrapper.state().model.attendees);
  addAttendee(wrapper, 'a1');
  t.deepEqual({ a1: {}, a2: {} }, wrapper.state().model.attendees, 'should ignore duplicated attendee');
  addAttendee(wrapper, ' a1 ');
  t.deepEqual({ a1: {}, a2: {} }, wrapper.state().model.attendees, 'should trim');
});

/** @test {DateMatcherApplication#handleRemoveAttendee} */
test('DateMatcherApplication should remove attendee', t => {
  const wrapper = mount(<DateMatcherApplication data="" onEdit={() => {}} appContext={{}} />);
  setCandidates(wrapper, ['c1', 'c2']);
  addAttendee(wrapper, 'a1');
  addAttendee(wrapper, 'a2');
  t.deepEqual({ a1: {}, a2: {} }, wrapper.state().model.attendees);
  startEdit(wrapper, 'a1');
  removeAttendee(wrapper, 'a1');
  t.deepEqual({ a2: {} }, wrapper.state().model.attendees);
});

/** @test {DateMatcherApplication#handleSetAnswer} */
test('DateMatcherApplication should set answers', t => {
  const wrapper = mount(<DateMatcherApplication data="" onEdit={() => {}} appContext={{}} />);
  setCandidates(wrapper, ['c1', 'c2']);
  addAttendee(wrapper, 'a1');
  addAttendee(wrapper, 'a2');
  t.deepEqual({ a1: {}, a2: {} }, wrapper.state().model.attendees);
  startEdit(wrapper, 'a1');
  inputAnswers(wrapper, 'a1', ['x', 'y']);
  endEdit(wrapper, 'a1');
  t.deepEqual({ a1: { c1: 'x', c2: 'y' }, a2: {} }, wrapper.state().model.attendees);
});

/** @test {DateMatcherApplication.getDerivedStateFromProps} */
test('DateMatcherApplication should be updated by props', t => {
  const wrapper = mount(<DateMatcherApplication data="" onEdit={() => {}} appContext={{}} />);
  t.false(hasTable(wrapper));
  const model = new DateMatcherApplication.Model();
  model.setCandidates(['c1', 'c2']);
  model.addAttendee('a1');
  model.addAttendee('a2');
  model.setAnswer('a1', 'c1', 'w');
  model.setAnswer('a1', 'c2', 'x');
  model.setAnswer('a2', 'c1', 'y');
  model.setAnswer('a2', 'c2', 'z');
  wrapper.setProps({ data: model.serialize() });
  t.true(hasTable(wrapper));
  t.deepEqual({ a1: { c1: 'w', c2: 'x' }, a2: { c1: 'y', c2: 'z' } }, wrapper.state().model.attendees);
});
