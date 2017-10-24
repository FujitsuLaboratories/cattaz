import React from 'react';
import test from 'ava';

import sinon from 'sinon';
import { shallow, mount } from 'enzyme';

import DateApplication from '../../src/apps/DateApplication';

/** @test {DateApplication} */
test('DateApplication should render initial state if no data is given', t => {
  const wrapper = shallow(<DateApplication data="" onEdit={() => {}} appContext={{}} />);
  t.is('Date and time: ', wrapper.text());
});

/** @test {DateApplication#handleUpdateDate} */
test('DateApplication should display current time after clicking button', t => {
  const clock = sinon.useFakeTimers(new Date(2017, 1, 2, 3, 4, 5).valueOf());
  try {
    const wrapper = mount(<DateApplication data="" onEdit={() => {}} appContext={{}} />);
    wrapper.find('input').first().simulate('click');
    t.is('Date and time: 2017-2-2 (Thu) 3:4', wrapper.text());
    clock.tick('01:02:00');
    wrapper.find('input').first().simulate('click');
    t.is('Date and time: 2017-2-2 (Thu) 4:6', wrapper.text());
  } finally {
    clock.restore();
  }
});

/** @test {DateApplication#componentWillReceiveProps} */
test('DateApplication should be updated by props', t => {
  const wrapper = shallow(<DateApplication data="" onEdit={() => {}} appContext={{}} />);
  t.is('Date and time: ', wrapper.text());
  const model = new DateApplication.Model();
  model.updateDate('2017-01-02');
  wrapper.setProps({ data: model.serialize() });
  t.is('Date and time: 2017-01-02', wrapper.text());
  const oldModel = wrapper.state('date');
  wrapper.setProps({ data: model.serialize() });
  t.is(oldModel, wrapper.state('date'), 'should not replace state if same data is given');
});
