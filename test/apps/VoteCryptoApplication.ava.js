import React from 'react';
import test from 'ava';

import { shallow, mount } from 'enzyme';

import VoteCryptoApplication from '../../src/apps/VoteCryptoApplication';

function addCandidate(wrapper, candidateText) {
  const textbox = wrapper.find('input').at(0);
  const button = wrapper.find('input').at(1);
  textbox.instance().value = candidateText;
  button.simulate('click');
}

function getVotes(wrapper) {
  return wrapper.find('li').map(li => li.text());
}

function addVote(wrapper, candidateText) {
  const li = wrapper.find('li').filterWhere(l => l.key() === candidateText);
  const input = li.find('input');
  input.simulate('click');
}

function makeOpen(wrapper) {
  wrapper.find('input').filterWhere(i => i.key() === 'result').simulate('click');
}

/** @test {VoteCryptoApplication} */
test('VoteCryptoApplication should render initial state if no data is given', t => {
  const wrapper = shallow(<VoteCryptoApplication data="" onEdit={() => {}} appContext={{}} />);
  t.deepEqual([], getVotes(wrapper));
});

/** @test {VoteCryptoApplication#handleAddVote} */
test('VoteCryptoApplication should not render result before open', t => {
  const wrapper = mount(<VoteCryptoApplication data="" onEdit={() => {}} appContext={{}} />);
  t.deepEqual([], getVotes(wrapper));
  addCandidate(wrapper, 'c1');
  addCandidate(wrapper, 'c2');
  addCandidate(wrapper, 'c1'); // should be ignored
  t.deepEqual(['c1 ', 'c2 '], getVotes(wrapper));
  addVote(wrapper, 'c1');
  addVote(wrapper, 'c2');
  addVote(wrapper, 'c1');
  t.deepEqual(['c1 ', 'c2 '], getVotes(wrapper));
});

/** @test {VoteCryptoApplication#handleVotingResult} */
test('VoteCryptoApplication should render result after open', t => {
  const wrapper = mount(<VoteCryptoApplication data="" onEdit={() => {}} appContext={{}} />);
  t.deepEqual([], getVotes(wrapper));
  addCandidate(wrapper, 'c1');
  addCandidate(wrapper, 'c2');
  addVote(wrapper, 'c1');
  addVote(wrapper, 'c2');
  addVote(wrapper, 'c1');
  t.deepEqual(['c1 ', 'c2 '], getVotes(wrapper));
  makeOpen(wrapper);
  t.deepEqual(['c1: 2 ', 'c2: 1 '], getVotes(wrapper));
});

/** @test {VoteCryptoApplication#componentWillReceiveProps} */
test('VoteCryptoApplication should be updated by props', t => {
  const wrapper = shallow(<VoteCryptoApplication data="" onEdit={() => {}} appContext={{}} />);
  t.deepEqual([], getVotes(wrapper));
  const model = new VoteCryptoApplication.Model();
  model.addCandidate('c1');
  model.addCandidate('c2');
  model.addVote('c1');
  model.addVote('c2');
  model.addVote('c1');
  wrapper.setProps({ data: model.serialize() });
  t.deepEqual(['c1 ', 'c2 '], getVotes(wrapper));
  model.openVoted();
  wrapper.setProps({ data: model.serialize() });
  t.deepEqual(['c1: 2 ', 'c2: 1 '], getVotes(wrapper));
});

/** @test {VoteCryptoModel#serialize} */
test('VoteCryptoApplication should not serialize in plain text', t => {
  const model = new VoteCryptoApplication.Model();
  model.addCandidate('abc');
  model.addCandidate('xyz');
  const serialized = model.serialize();
  t.false(serialized.indexOf('abc') >= 0);
  t.false(serialized.indexOf('xyz') >= 0);
});
