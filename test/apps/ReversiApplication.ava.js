import test from 'ava';

import { mountApp } from '../helper';

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
  const wrapper = mountApp(ReversiApplication);
  t.deepEqual(extractStoneCounts(wrapper), [2, 2]);
});

/** @test {ReversiApplication#handlePlaceStone} */
test('ReversiApplication should place stones', t => {
  const wrapper = mountApp(ReversiApplication);
  getButton(wrapper, 'c4').simulate('click');
  t.deepEqual(extractStoneCounts(wrapper), [4, 1]);
  t.is(getButton(wrapper, 'c4').length, 0, 'button should be disappeared');
});

/** @test {ReversiApplication#shouldComponentUpdate} */
test('ReversiApplication should be updated by props', t => {
  const wrapper = mountApp(ReversiApplication);
  t.deepEqual(extractStoneCounts(wrapper), [2, 2]);
  const model = new Model();
  model.addStep(Black, 3, 2);
  model.addStep(White, 2, 2);
  wrapper.setProps({ data: model.serialize() });
  t.deepEqual(extractStoneCounts(wrapper), [3, 3]);
});
