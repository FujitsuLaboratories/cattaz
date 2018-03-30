import React from 'react';
import test from 'ava';

import { mount } from 'enzyme';

import VoteApplication from '../../src/apps/VoteApplication';

function addCandidate(wrapper, candidateText) {
  const textbox = wrapper.find('input').at(0);
  const button = wrapper.find('input').at(1);
  textbox.instance().value = candidateText;
  button.simulate('click');
}

function getVotes(wrapper) {
  const dic = {};
  wrapper.find('li').forEach(li => {
    const rawText = li.text();
    const match = / (\d+) $/.exec(rawText);
    const count = parseInt(match[1], 10);
    const candidate = li.key();
    dic[candidate] = count;
  });
  return dic;
}

function addVote(wrapper, candidateText) {
  const li = wrapper.find('li').filterWhere(l => l.key() === candidateText);
  const input = li.find('input');
  input.simulate('click');
}

/** @test {VoteApplication} */
test('VoteApplication should render initial state if no data is given', t => {
  const wrapper = mount(<VoteApplication data="" onEdit={() => {}} appContext={{}} />);
  t.deepEqual({}, getVotes(wrapper));
});

/** @test {VoteApplication#handleAddCandidate} */
test('VoteApplication should reject duplicated candidates', t => {
  const wrapper = mount(<VoteApplication data="" onEdit={() => {}} appContext={{}} />);
  addCandidate(wrapper, '');
  t.deepEqual({}, getVotes(wrapper));
  addCandidate(wrapper, 'c1');
  t.deepEqual({ c1: 0 }, getVotes(wrapper));
  addCandidate(wrapper, 'c1');
  t.deepEqual({ c1: 0 }, getVotes(wrapper));
});

/** @test {VoteApplication#handleAddVote} */
test('VoteApplication should count votes', t => {
  const wrapper = mount(<VoteApplication data="" onEdit={() => {}} appContext={{}} />);
  addCandidate(wrapper, 'c1');
  addCandidate(wrapper, 'c2');
  t.deepEqual({ c1: 0, c2: 0 }, getVotes(wrapper));
  addVote(wrapper, 'c1');
  addVote(wrapper, 'c2');
  addVote(wrapper, 'c1');
  t.deepEqual({ c1: 2, c2: 1 }, getVotes(wrapper));
});

/** @test {VoteApplication.getDerivedStateFromProps} */
test('VoteApplication should be updated by props', t => {
  const wrapper = mount(<VoteApplication data="" onEdit={() => {}} appContext={{}} />);
  t.deepEqual({}, getVotes(wrapper));
  const model = new VoteApplication.Model();
  model.addCandidate('c1');
  model.addCandidate('c2');
  model.addVote('c1');
  model.addVote('c2');
  model.addVote('c1');
  wrapper.setProps({ data: model.serialize() });
  t.deepEqual({ c1: 2, c2: 1 }, getVotes(wrapper));
});
