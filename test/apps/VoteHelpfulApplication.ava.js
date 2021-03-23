import test from 'ava';

import { mountApp } from '../helper';

import VoteHelpfulApplication from '../../src/apps/VoteHelpfulApplication';

function hasVoteButtons(wrapper) {
  return wrapper.find('input').length >= 2;
}
function hasBar(wrapper) {
  return wrapper.find('div div span').exists();
}

function getBarTexts(wrapper) {
  return wrapper.find('div div span').map(e => e.text());
}

function vote(wrapper, label) {
  wrapper.find('input').filterWhere(i => i.instance().value === label).simulate('click');
}
function voteYes(wrapper) {
  vote(wrapper, 'Yes');
}
function voteNo(wrapper) {
  vote(wrapper, 'No');
}

/** @test {VoteHelpfulApplication} */
test('VoteHelpfulApplication should render initial state if no data is given', t => {
  const wrapper = mountApp(VoteHelpfulApplication);
  t.true(hasVoteButtons(wrapper));
  t.false(hasBar(wrapper));
});

/** @test {VoteHelpfulApplication#handleAddVote} */
test('VoteHelpfulApplication should hide buttons and show bars after voting', t => {
  const wrapper = mountApp(VoteHelpfulApplication);
  t.true(hasVoteButtons(wrapper));
  t.false(hasBar(wrapper));
  voteYes(wrapper);
  t.false(hasVoteButtons(wrapper));
  t.true(hasBar(wrapper));
  t.deepEqual(getBarTexts(wrapper), ['100%', '1', '0', '0%']);

  t.true(wrapper.state('voted'));
  wrapper.setState({ voted: false });

  t.true(hasVoteButtons(wrapper));
  t.true(hasBar(wrapper));
  voteNo(wrapper);
  t.false(hasVoteButtons(wrapper));
  t.true(hasBar(wrapper));
  t.deepEqual(getBarTexts(wrapper), ['50%', '1', '1', '50%']);
});

/** @test {VoteHelpfulApplication#shouldComponentUpdate} */
test('VoteHelpfulApplication should be updated by props', t => {
  const wrapper = mountApp(VoteHelpfulApplication);
  t.true(hasVoteButtons(wrapper));
  t.false(hasBar(wrapper));
  const model = new VoteHelpfulApplication.Model();
  model.addVote('Yes');
  model.addVote('No');
  model.addVote('Yes');
  wrapper.setProps({ data: model.serialize() });
  t.true(hasVoteButtons(wrapper));
  t.true(hasBar(wrapper));
  t.deepEqual(getBarTexts(wrapper), ['67%', '2', '1', '33%']);
});
