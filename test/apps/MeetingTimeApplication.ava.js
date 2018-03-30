import React from 'react';
import test from 'ava';

import sinon from 'sinon';
import { mount } from 'enzyme';

import MeetingTimeApplication from '../../src/apps/MeetingTimeApplication';


function hasStart(wrapper) {
  return wrapper.find('div div').filterWhere(div => div.key() === 'start').text().indexOf('?') < 0;
}
function hasEnd(wrapper) {
  return wrapper.find('div div').filterWhere(div => div.key() === 'end').text().indexOf('?') < 0;
}
function getDurationText(wrapper) {
  return wrapper.find('div div').filterWhere(div => div.key() === 'duration').text().replace('Duration of a meeting: ', '');
}

function clickStart(wrapper) {
  wrapper.find('div div').filterWhere(div => div.key() === 'start').find('input').simulate('click');
}
function clickEnd(wrapper) {
  wrapper.find('div div').filterWhere(div => div.key() === 'end').find('input').simulate('click');
}

/** @test {MeetingTimeApplication} */
test('MeetingTimeApplication should render initial state if no data is given', t => {
  const wrapper = mount(<MeetingTimeApplication data="" onEdit={() => {}} appContext={{}} />);
  t.is('', getDurationText(wrapper));
  t.false(hasStart(wrapper));
  t.false(hasEnd(wrapper));
});

/** @test {MeetingTimeApplication#handleUpdateStartTime} */
test('MeetingTimeApplication should not render duration if no end is given', t => {
  const wrapper = mount(<MeetingTimeApplication data="" onEdit={() => {}} appContext={{}} />);
  clickStart(wrapper);
  t.is('', getDurationText(wrapper));
  t.true(hasStart(wrapper));
  t.false(hasEnd(wrapper));
});

/** @test {MeetingTimeApplication#handleUpdateEndTime} */
test('MeetingTimeApplication should render duration if both start and end are given', t => {
  const clock = sinon.useFakeTimers(new Date(2017, 1, 2, 3, 4, 5).valueOf());
  try {
    const wrapper = mount(<MeetingTimeApplication data="" onEdit={() => {}} appContext={{}} />);
    clickStart(wrapper);
    clock.tick('01:02:00');
    clickEnd(wrapper);
    t.is('01:02', getDurationText(wrapper));
    t.true(hasStart(wrapper));
    t.true(hasEnd(wrapper));
    clock.tick('01:02:00');
    clickStart(wrapper);
    t.false(getDurationText(wrapper).indexOf(':') >= 0, 'should not calculate duration if start is after end');
  } finally {
    clock.restore();
  }
});

/** @test {MeetingTimeApplication.getDerivedStateFromProps} */
test('MeetingTimeApplication should be updated by props', t => {
  const wrapper = mount(<MeetingTimeApplication data="" onEdit={() => {}} appContext={{}} />);
  t.is('', getDurationText(wrapper));
  const model = new MeetingTimeApplication.Model();
  model.updateStartTime({
    year: '2017', month: '01', day: '02', week: 'Mon', hour: '10', minute: '10',
  });
  model.updateEndTime({
    year: '2017', month: '01', day: '02', week: 'Mon', hour: '11', minute: '11',
  });
  wrapper.setProps({ data: model.serialize() });
  t.is('01:01', getDurationText(wrapper));
});
