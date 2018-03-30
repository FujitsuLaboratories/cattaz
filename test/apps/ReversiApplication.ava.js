import React from 'react';
import test from 'ava';

import { mount } from 'enzyme';

import * as RM from '../../src/apps/ReversiModel';
import ReversiApplication from '../../src/apps/ReversiApplication';

const Black = RM.StoneBlack;
const White = RM.StoneWhite;
const Model = RM.default;

function extractStoneCounts(wrapper) {
  const stoneCountText = wrapper.find('p').text();
  const m = /\D(\d)+\D+(\d)+\D/.exec(stoneCountText);
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}

function getButton(wrapper, positionLabel) {
  const buttons = wrapper.find('button');
  const button = buttons.filterWhere(btn => btn.text() === positionLabel);
  return button;
}

/** @test {ReversiApplication} */
test('ReversiApplication should render initial cells if no data is given', t => {
  const wrapper = mount(<ReversiApplication data="" onEdit={() => {}} appContext={{}} />);
  t.deepEqual([2, 2], extractStoneCounts(wrapper));
});

/** @test {ReversiApplication#handlePlaceStone} */
test('ReversiApplication should place stones', t => {
  const wrapper = mount(<ReversiApplication data="" onEdit={() => {}} appContext={{}} />);
  getButton(wrapper, 'c4').simulate('click');
  t.deepEqual([4, 1], extractStoneCounts(wrapper));
  t.is(getButton(wrapper, 'c4').length, 0, 'button should be disappeared');
});

/** @test {ReversiApplication.getDerivedStateFromProps} */
test('ReversiApplication should be updated by props', t => {
  const wrapper = mount(<ReversiApplication data="" onEdit={() => {}} appContext={{}} />);
  t.deepEqual([2, 2], extractStoneCounts(wrapper));
  const model = new Model();
  model.addStep(Black, 3, 2);
  model.addStep(White, 2, 2);
  wrapper.setProps({ data: model.serialize() });
  t.deepEqual([3, 3], extractStoneCounts(wrapper));
});
